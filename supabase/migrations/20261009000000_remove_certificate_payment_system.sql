-- =============================================================================
-- REMOVE CERTIFICATE PAYMENT SYSTEM
-- DATE: 2026-10-09
-- =============================================================================
-- GOAL:
--   Make the internship certificate completely free for every intern and every
--   batch (including September 2026 and all future registrations). The only
--   requirements to receive a certificate are:
--     1. every required task for the chosen domain + duration is approved, and
--     2. an admin releases the certificate.
--
-- WHAT THIS DOES:
--   1. Ensures the certificate lifecycle columns/audit table exist (idempotent).
--   2. Drops the certificate_payments guard trigger + function (if present).
--   3. Redefines handle_new_user() so new interns are never tagged with a
--      payment flow (no certificate_flow_version write).
--   4. Redefines issue_certificate() / reissue_certificate() to be payment-free
--      and domain-aware (required task count is derived inline from the domain
--      slug + duration).
--
-- WHAT THIS DELIBERATELY DOES NOT DO:
--   - It does NOT drop certificate_payments or app_settings. Those tables are
--     left in place, unused, so no historical payment rows are destroyed.
--   - It does NOT drop the certificate_flow_version column. It is ignored by
--     all functions after this migration.
--   - It does NOT delete or mass-modify any profiles, internships,
--     submissions, certificates or existing payment rows.
--
-- SAFETY / IDEMPOTENCY:
--   - Pure CREATE OR REPLACE + ADD COLUMN IF NOT EXISTS + DROP ... IF EXISTS.
--   - Safe on a fresh database (all prior migrations applied) AND on a database
--     where the payment migrations were never applied.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Ensure columns the redefined functions rely on exist (idempotent).
--    Mirrors the defensive ADD COLUMN IF NOT EXISTS guard from
--    20260921000000_fix_registration_trigger.sql so this runs on any state.
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS discovery_source text,
  ADD COLUMN IF NOT EXISTS discovery_other text,
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS internship_id uuid,
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS selected_domain text,
  ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'intern',
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS college text,
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS year text;

UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;

ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS duration text NOT NULL DEFAULT '1 Month',
  ADD COLUMN IF NOT EXISTS offer_letter_code text,
  ADD COLUMN IF NOT EXISTS offer_issued_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_code text,
  ADD COLUMN IF NOT EXISTS certificate_issued_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_released_by uuid,
  ADD COLUMN IF NOT EXISTS certificate_released_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS certificate_revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_revoked_by uuid,
  ADD COLUMN IF NOT EXISTS certificate_revoke_reason text;

-- Any internship that already has a certificate code is 'issued'.
UPDATE public.internships
SET certificate_status = 'issued'
WHERE certificate_code IS NOT NULL AND certificate_status = 'none';

-- -----------------------------------------------------------------------------
-- 2. Ensure the certificate audit log exists (idempotent)
-- -----------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_certificate_audit_log_internship
  ON public.certificate_audit_log(internship_id);

ALTER TABLE public.certificate_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read certificate audit log" ON public.certificate_audit_log;
CREATE POLICY "Admins read certificate audit log" ON public.certificate_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Service inserts certificate audit log" ON public.certificate_audit_log;
CREATE POLICY "Service inserts certificate audit log" ON public.certificate_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 3. Remove the payment guard (trigger + function) if present.
--    The certificate_payments table may not exist at all (e.g. production),
--    so the trigger drop is guarded by a table-existence check.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.certificate_payments') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS certificate_payments_guard ON public.certificate_payments;
  END IF;
END $$;
DROP FUNCTION IF EXISTS public.certificate_payments_guard();

-- -----------------------------------------------------------------------------
-- 4. handle_new_user(): never assign a payment flow to new interns
--    (based on the robust 20260921000000 version, minus certificate_flow_version)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.app_role;
  v_domain uuid;
  v_duration text;
  v_internship_id uuid;
BEGIN
  -- Determine role: string comparison avoids enum cast errors
  IF COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), 'intern') = 'admin' THEN
    v_role := 'admin';
  ELSE
    v_role := 'intern';
  END IF;

  -- Insert or update profile with all known columns
  INSERT INTO public.profiles (
    id, user_id, email, full_name, phone, college, department, year,
    avatar_url, must_change_password, role, duration, selected_domain,
    country, discovery_source, discovery_other
  )
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'phone',''),
    NULLIF(NEW.raw_user_meta_data->>'college',''),
    NULLIF(NEW.raw_user_meta_data->>'department',''),
    NULLIF(NEW.raw_user_meta_data->>'year',''),
    NULLIF(NEW.raw_user_meta_data->>'avatar_url',''),
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false),
    v_role,
    COALESCE(NEW.raw_user_meta_data->>'duration', '1 Month'),
    NULLIF(NEW.raw_user_meta_data->>'domain_id',''),
    NULLIF(NEW.raw_user_meta_data->>'country',''),
    NULLIF(NEW.raw_user_meta_data->>'discovery_source',''),
    NULLIF(NEW.raw_user_meta_data->>'discovery_other','')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    college = COALESCE(EXCLUDED.college, public.profiles.college),
    department = COALESCE(EXCLUDED.department, public.profiles.department),
    year = COALESCE(EXCLUDED.year, public.profiles.year),
    role = EXCLUDED.role,
    country = COALESCE(EXCLUDED.country, public.profiles.country),
    discovery_source = COALESCE(EXCLUDED.discovery_source, public.profiles.discovery_source),
    discovery_other = COALESCE(EXCLUDED.discovery_other, public.profiles.discovery_other);

  -- Assign role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Safely parse domain_id (regex guard prevents UUID cast errors)
  v_domain := NULL;
  IF NEW.raw_user_meta_data->>'domain_id'
     ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    v_domain := (NEW.raw_user_meta_data->>'domain_id')::uuid;
  END IF;

  v_duration := COALESCE(NEW.raw_user_meta_data->>'duration', '1 Month');

  -- Create internship if domain is valid and user is an intern.
  -- NOTE: certificate_flow_version is intentionally NOT written anymore.
  IF v_domain IS NOT NULL AND v_role = 'intern' THEN
    INSERT INTO public.internships (student_id, domain_id, duration, status)
    VALUES (NEW.id, v_domain, v_duration, 'active')
    ON CONFLICT (student_id) DO NOTHING
    RETURNING id INTO v_internship_id;

    UPDATE public.profiles
    SET internship_id = COALESCE(v_internship_id, internship_id)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END $$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 5. issue_certificate(): admin-only, domain-aware, NO payment gate
--    Required tasks — AI / FullStack: 1M=5, 2M=7, 3M=10
--                      Other domains: 1M=3, 2M=4, 3M=5
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.issue_certificate(p_internship_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
  v_approved int;
  v_required int;
  v_code text;
BEGIN
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can issue certificates';
  END IF;

  SELECT i.*, d.slug AS domain_slug INTO v_internship
    FROM public.internships i
    LEFT JOIN public.domains d ON d.id = i.domain_id
    WHERE i.id = p_internship_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Internship not found';
  END IF;

  IF v_internship.certificate_code IS NOT NULL AND v_internship.certificate_status = 'issued' THEN
    RETURN jsonb_build_object('error', 'Certificate already issued: ' || v_internship.certificate_code);
  END IF;

  SELECT count(*) INTO v_approved
    FROM public.submissions
    WHERE internship_id = p_internship_id AND status = 'approved';

  v_required := CASE
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '1 Month' THEN 5
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '2 Months' THEN 7
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '3 Months' THEN 10
    WHEN v_internship.duration = '1 Month' THEN 3
    WHEN v_internship.duration = '2 Months' THEN 4
    ELSE 5
  END;

  IF v_approved < v_required THEN
    RAISE EXCEPTION 'Cannot issue certificate: % of % required tasks approved', v_approved, v_required;
  END IF;

  v_code := 'YRNT-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8));

  UPDATE public.internships
    SET certificate_code     = v_code,
        certificate_issued_at = now(),
        certificate_released_by = v_admin_id,
        certificate_released_at = now(),
        certificate_status    = 'issued'
  WHERE id = p_internship_id;

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

-- -----------------------------------------------------------------------------
-- 6. reissue_certificate(): admin-only, domain-aware, NO payment gate
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reissue_certificate(p_internship_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
  v_approved int;
  v_required int;
  v_code text;
BEGIN
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can reissue certificates';
  END IF;

  SELECT i.*, d.slug AS domain_slug INTO v_internship
    FROM public.internships i
    LEFT JOIN public.domains d ON d.id = i.domain_id
    WHERE i.id = p_internship_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Internship not found';
  END IF;

  IF v_internship.certificate_status <> 'revoked' THEN
    RETURN jsonb_build_object('error', 'Certificate is not in revoked status (current: ' || v_internship.certificate_status || ')');
  END IF;

  SELECT count(*) INTO v_approved
    FROM public.submissions
    WHERE internship_id = p_internship_id AND status = 'approved';

  v_required := CASE
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '1 Month' THEN 5
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '2 Months' THEN 7
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '3 Months' THEN 10
    WHEN v_internship.duration = '1 Month' THEN 3
    WHEN v_internship.duration = '2 Months' THEN 4
    ELSE 5
  END;

  IF v_approved < v_required THEN
    RAISE EXCEPTION 'Cannot reissue: only % of % required tasks are approved', v_approved, v_required;
  END IF;

  v_code := 'YRNT-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8));

  UPDATE public.internships
    SET certificate_code     = v_code,
        certificate_issued_at = now(),
        certificate_released_by = v_admin_id,
        certificate_released_at = now(),
        certificate_status    = 'issued',
        certificate_revoked_at  = NULL,
        certificate_revoked_by  = NULL,
        certificate_revoke_reason = NULL
  WHERE id = p_internship_id;

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

-- -----------------------------------------------------------------------------
-- 7. Notify PostgREST to reload schema
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
