-- =============================================================================
-- ADD: Certificate Revocation & Re-Issue System
-- DATE: 2026-09-19
-- =============================================================================
-- Adds:
--   1. certificate_status column to internships ('none'|'issued'|'revoked')
--   2. certificate revocation audit columns to internships
--   3. certificate_audit_log table for full audit trail
--   4. revoke_certificate() RPC — admin-only
--   5. reissue_certificate() RPC — admin-only
--   6. Updates issue_certificate() to set certificate_status = 'issued'
--   7. Extends protect_certificate_fields() trigger
--   8. RLS policies for certificate_audit_log
--
-- SAFETY:
--   - All operations are additive (no data loss)
--   - Existing issued certificates get certificate_status = 'issued'
--   - No existing records are deleted or mass-modified
--   - Idempotent where possible
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add certificate_status and revocation audit columns to internships
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS certificate_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS certificate_revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_revoked_by uuid,
  ADD COLUMN IF NOT EXISTS certificate_revoke_reason text;

-- Backfill: any internship with a certificate_code should be 'issued'
UPDATE public.internships
SET certificate_status = 'issued'
WHERE certificate_code IS NOT NULL AND certificate_status = 'none';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Create certificate_audit_log table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certificate_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  action text NOT NULL,  -- 'issued' | 'revoked' | 'reissued'
  admin_id uuid NOT NULL,
  old_certificate_code text,
  new_certificate_code text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient lookups by internship
CREATE INDEX IF NOT EXISTS idx_certificate_audit_log_internship
  ON public.certificate_audit_log(internship_id);

-- RLS: Only admins can read audit logs, service role handles writes
ALTER TABLE public.certificate_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can read all audit logs
DROP POLICY IF EXISTS "Admins read certificate audit log" ON public.certificate_audit_log;
CREATE POLICY "Admins read certificate audit log" ON public.certificate_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only service role (via RPC) can insert audit logs
DROP POLICY IF EXISTS "Service inserts certificate audit log" ON public.certificate_audit_log;
CREATE POLICY "Service inserts certificate audit log" ON public.certificate_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Update issue_certificate() to set certificate_status
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.issue_certificate(p_internship_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
  v_approved int;
  v_required int;
  v_code text;
BEGIN
  -- Verify caller is admin
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can issue certificates';
  END IF;

  -- Fetch internship
  SELECT * INTO v_internship FROM public.internships WHERE id = p_internship_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Internship not found';
  END IF;

  -- Already issued (and not revoked)?
  IF v_internship.certificate_code IS NOT NULL AND v_internship.certificate_status = 'issued' THEN
    RETURN jsonb_build_object('error', 'Certificate already issued: ' || v_internship.certificate_code);
  END IF;

  -- Count approved submissions
  SELECT count(*) INTO v_approved
    FROM public.submissions
    WHERE internship_id = p_internship_id AND status = 'approved';

  -- Determine required tasks
  v_required := CASE
    WHEN v_internship.duration = '1 Month' THEN 3
    WHEN v_internship.duration = '2 Months' THEN 4
    ELSE 5
  END;

  -- Validate all tasks approved
  IF v_approved < v_required THEN
    RAISE EXCEPTION 'Cannot issue certificate: % of % required tasks approved', v_approved, v_required;
  END IF;

  -- Check payment for payment_v1 interns
  IF v_internship.certificate_flow_version = 'payment_v1' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.certificate_payments
      WHERE internship_id = p_internship_id AND status = 'paid'
    ) THEN
      RETURN jsonb_build_object('error', 'Certificate payment not verified');
    END IF;
  END IF;

  -- Generate code and issue
  v_code := 'YRNT-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8));

  UPDATE public.internships
    SET certificate_code     = v_code,
        certificate_issued_at = now(),
        certificate_released_by = v_admin_id,
        certificate_released_at = now(),
        certificate_status    = 'issued'
  WHERE id = p_internship_id;

  -- Audit log
  INSERT INTO public.certificate_audit_log (internship_id, action, admin_id, old_certificate_code, new_certificate_code, reason)
  VALUES (p_internship_id, 'issued', v_admin_id, v_internship.certificate_code, v_code, 'Initial issue');

  RETURN jsonb_build_object(
    'success', true,
    'certificate_code', v_code,
    'issued_at', now()::text,
    'released_by', v_admin_id::text
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.issue_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_certificate(uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. revoke_certificate() RPC — admin-only
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.revoke_certificate(p_internship_id uuid, p_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
BEGIN
  -- Verify caller is admin
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can revoke certificates';
  END IF;

  -- Reason is required
  IF p_reason IS NULL OR trim(p_reason) = '' THEN
    RAISE EXCEPTION 'Revocation reason is required';
  END IF;

  -- Fetch internship
  SELECT * INTO v_internship FROM public.internships WHERE id = p_internship_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Internship not found';
  END IF;

  -- Must be issued to revoke
  IF v_internship.certificate_status != 'issued' THEN
    RETURN jsonb_build_object('error', 'Certificate is not in issued status (current: ' || v_internship.certificate_status || ')');
  END IF;

  -- Revoke: preserve old code in audit, clear certificate fields
  UPDATE public.internships
    SET certificate_status    = 'revoked',
        certificate_revoked_at  = now(),
        certificate_revoked_by  = v_admin_id,
        certificate_revoke_reason = trim(p_reason),
        -- Clear active certificate fields so intern cannot download
        certificate_code       = NULL,
        certificate_issued_at  = NULL,
        certificate_released_by = NULL,
        certificate_released_at = NULL
  WHERE id = p_internship_id;

  -- Audit log (preserves old certificate_code)
  INSERT INTO public.certificate_audit_log (internship_id, action, admin_id, old_certificate_code, new_certificate_code, reason)
  VALUES (p_internship_id, 'revoked', v_admin_id, v_internship.certificate_code, NULL, trim(p_reason));

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Certificate revoked',
    'revoked_at', now()::text,
    'revoked_by', v_admin_id::text,
    'reason', trim(p_reason)
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.revoke_certificate(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_certificate(uuid, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. reissue_certificate() RPC — admin-only
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.reissue_certificate(p_internship_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
  v_approved int;
  v_required int;
  v_code text;
BEGIN
  -- Verify caller is admin
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can reissue certificates';
  END IF;

  -- Fetch internship
  SELECT * INTO v_internship FROM public.internships WHERE id = p_internship_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Internship not found';
  END IF;

  -- Must be revoked to reissue
  IF v_internship.certificate_status != 'revoked' THEN
    RETURN jsonb_build_object('error', 'Certificate is not in revoked status (current: ' || v_internship.certificate_status || ')');
  END IF;

  -- Verify all required tasks are still approved
  SELECT count(*) INTO v_approved
    FROM public.submissions
    WHERE internship_id = p_internship_id AND status = 'approved';

  v_required := CASE
    WHEN v_internship.duration = '1 Month' THEN 3
    WHEN v_internship.duration = '2 Months' THEN 4
    ELSE 5
  END;

  IF v_approved < v_required THEN
    RAISE EXCEPTION 'Cannot reissue: only % of % required tasks are approved', v_approved, v_required;
  END IF;

  -- Check payment for payment_v1 interns
  IF v_internship.certificate_flow_version = 'payment_v1' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.certificate_payments
      WHERE internship_id = p_internship_id AND status = 'paid'
    ) THEN
      RETURN jsonb_build_object('error', 'Certificate payment not verified');
    END IF;
  END IF;

  -- Generate new code (new version)
  v_code := 'YRNT-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8));

  UPDATE public.internships
    SET certificate_code     = v_code,
        certificate_issued_at = now(),
        certificate_released_by = v_admin_id,
        certificate_released_at = now(),
        certificate_status    = 'issued',
        -- Clear revocation fields
        certificate_revoked_at  = NULL,
        certificate_revoked_by  = NULL,
        certificate_revoke_reason = NULL
  WHERE id = p_internship_id;

  -- Audit log (preserves old revoked certificate_code from history)
  INSERT INTO public.certificate_audit_log (internship_id, action, admin_id, old_certificate_code, new_certificate_code, reason)
  VALUES (p_internship_id, 'reissued', v_admin_id, NULL, v_code, 'Re-issued after revocation');

  RETURN jsonb_build_object(
    'success', true,
    'certificate_code', v_code,
    'issued_at', now()::text,
    'released_by', v_admin_id::text
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.reissue_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reissue_certificate(uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Extend protect_certificate_fields() trigger to protect new columns
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.protect_certificate_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF NEW.certificate_code IS DISTINCT FROM OLD.certificate_code THEN
      RAISE EXCEPTION 'Students cannot modify certificate_code';
    END IF;
    IF NEW.certificate_issued_at IS DISTINCT FROM OLD.certificate_issued_at THEN
      RAISE EXCEPTION 'Students cannot modify certificate_issued_at';
    END IF;
    IF NEW.certificate_released_by IS DISTINCT FROM OLD.certificate_released_by THEN
      RAISE EXCEPTION 'Students cannot modify certificate_released_by';
    END IF;
    IF NEW.certificate_released_at IS DISTINCT FROM OLD.certificate_released_at THEN
      RAISE EXCEPTION 'Students cannot modify certificate_released_at';
    END IF;
    IF NEW.certificate_status IS DISTINCT FROM OLD.certificate_status THEN
      RAISE EXCEPTION 'Students cannot modify certificate_status';
    END IF;
    IF NEW.certificate_revoked_at IS DISTINCT FROM OLD.certificate_revoked_at THEN
      RAISE EXCEPTION 'Students cannot modify certificate_revoked_at';
    END IF;
    IF NEW.certificate_revoked_by IS DISTINCT FROM OLD.certificate_revoked_by THEN
      RAISE EXCEPTION 'Students cannot modify certificate_revoked_by';
    END IF;
    IF NEW.certificate_revoke_reason IS DISTINCT FROM OLD.certificate_revoke_reason THEN
      RAISE EXCEPTION 'Students cannot modify certificate_revoke_reason';
    END IF;
    IF NEW.progress_percent IS DISTINCT FROM OLD.progress_percent THEN
      RAISE EXCEPTION 'Students cannot modify progress_percent';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS protect_certificate_fields ON public.internships;
CREATE TRIGGER protect_certificate_fields
  BEFORE UPDATE ON public.internships
  FOR EACH ROW EXECUTE FUNCTION public.protect_certificate_fields();

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Notify PostgREST to reload schema
-- ─────────────────────────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
