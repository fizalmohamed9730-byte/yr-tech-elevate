-- =============================================================================
-- SEPTEMBER 2026 CERTIFICATE PAYMENT EXEMPTION + PAYMENT HARDENING
-- DATE: 2026-10-05
-- =============================================================================
-- ROOT CAUSES:
--   1. issue_certificate() / reissue_certificate() gate certificate release on a
--      paid certificate_payments row whenever certificate_flow_version =
--      'payment_v1'. handle_new_user() assigns 'payment_v1' to EVERY new intern,
--      so interns who registered during September 2026 are blocked from getting
--      their certificate unless they pay.
--   2. The exemption cannot be derived from certificate_flow_version: it must be
--      a RUNTIME check of the real registration timestamp
--      (profiles.created_at), so no mass data update is required and future
--      registrations are handled automatically.
--   3. app_settings.certificate_fee was seeded as 99 while the product fee is
--      100, so the dashboard could display a different amount than expected.
--   4. Students could INSERT any amount / upi_id / status they liked, because
--      the INSERT RLS policy only constrained status and ownership.
--   5. reissue_certificate() still hardcoded required tasks as 3/4/5 by
--      duration, ignoring the domain-aware 5/7/10 counts, so reissue was
--      stricter/looser than issue for AI & FullStack internships.
--
-- FIXES:
--   1. Single source of truth helper is_september_2026_certificate_exempt().
--   2. issue_certificate() and reissue_certificate() skip the payment gate for
--      exempt internships (task approval + admin release still required).
--   3. certificate_fee default corrected 99 -> 100 (only when still stale).
--   4. New BEFORE INSERT/UPDATE trigger locks amount/currency/upi_id/status for
--      non-admin actors and blocks payment rows for exempt internships.
--   5. reissue_certificate() now uses the shared domain-aware task count helper.
--
-- SAFETY:
--   - Purely additive + CREATE OR REPLACE. Idempotent.
--   - NO existing certificate_payments rows, internships, or profiles are
--     modified or deleted. No mass UPDATE of user data.
--   - Exempt users keep working certificates through the normal admin flow; only
--     the payment requirement is bypassed.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. September 2026 exemption helper (single source of truth)
--    Registration timestamp = profiles.created_at (written by the
--    on_auth_user_created / handle_new_user() trigger at signup).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_september_2026_certificate_exempt(p_internship_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT (
      p.created_at >= TIMESTAMPTZ '2026-09-01 00:00:00+00'
      AND p.created_at <  TIMESTAMPTZ '2026-10-01 00:00:00+00'
    )
    FROM public.internships i
    JOIN public.profiles p ON p.id = i.student_id
    WHERE i.id = p_internship_id
  ), false);
$$;

REVOKE EXECUTE ON FUNCTION public.is_september_2026_certificate_exempt(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_september_2026_certificate_exempt(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 2. Domain-aware required task count helper (shared by issue + reissue)
--    AI / FullStack: 1M=5, 2M=7, 3M=10
--    Other domains : 1M=3, 2M=4, 3M=5
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.certificate_required_task_count(p_domain_slug text, p_duration text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_domain_slug IN ('artificial-intelligence', 'full-stack') AND p_duration = '1 Month' THEN 5
    WHEN p_domain_slug IN ('artificial-intelligence', 'full-stack') AND p_duration = '2 Months' THEN 7
    WHEN p_domain_slug IN ('artificial-intelligence', 'full-stack') AND p_duration = '3 Months' THEN 10
    WHEN p_duration = '1 Month' THEN 3
    WHEN p_duration = '2 Months' THEN 4
    ELSE 5
  END;
$$;

REVOKE EXECUTE ON FUNCTION public.certificate_required_task_count(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.certificate_required_task_count(text, text) TO authenticated;

-- -----------------------------------------------------------------------------
-- 3. Correct stale default fee 99 -> 100
--    Only updates the row while it still holds the stale seeded value, so a
--    fee an admin customised through app_settings is never overwritten.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_current numeric;
BEGIN
  SELECT (value #>> '{}')::numeric INTO v_current
    FROM public.app_settings WHERE key = 'certificate_fee';

  IF v_current IS NULL THEN
    INSERT INTO public.app_settings (key, value) VALUES ('certificate_fee', to_jsonb(100))
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  ELSIF v_current = 99 THEN
    UPDATE public.app_settings
      SET value = to_jsonb(100), updated_at = now()
      WHERE key = 'certificate_fee';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. Payment row guard
--    - Exempt internships can never have a payment row created by a student.
--    - Non-admin actors cannot choose amount / currency / upi_id / status;
--      these are always taken from the server-side configuration.
--    - Trusted server contexts (auth.uid() IS NULL, e.g. service_role /
--      SQL editor / migrations) are left untouched.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.certificate_payments_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_fee numeric;
  v_actor_is_admin boolean := false;
BEGIN
  -- Trusted server-side context: do not rewrite anything.
  IF v_actor IS NULL THEN
    RETURN NEW;
  END IF;

  v_actor_is_admin := COALESCE(public.has_role(v_actor, 'admin'), false);

  IF NOT v_actor_is_admin THEN
    IF public.is_september_2026_certificate_exempt(NEW.internship_id) THEN
      RAISE EXCEPTION
        'September 2026 registered interns are exempt from the certificate payment and cannot submit one.'
        USING ERRCODE = 'check_violation';
    END IF;

    -- Server-side configuration is authoritative.
    SELECT COALESCE((value #>> '{}')::numeric, 100) INTO v_fee
      FROM public.app_settings WHERE key = 'certificate_fee';

    NEW.amount   := COALESCE(v_fee, 100);
    NEW.currency := 'INR';
    NEW.upi_id   := 'fizalabbas@sbi';

    IF TG_OP = 'INSERT' THEN
      NEW.status       := 'pending_verification';
      NEW.submitted_at := now();
    ELSE
      -- Students may only move a rejected payment back into verification.
      IF NEW.status IS DISTINCT FROM 'pending_verification' THEN
        RAISE EXCEPTION 'Students cannot set payment status to %', NEW.status
          USING ERRCODE = 'insufficient_privilege';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS certificate_payments_guard ON public.certificate_payments;
CREATE TRIGGER certificate_payments_guard
  BEFORE INSERT OR UPDATE ON public.certificate_payments
  FOR EACH ROW EXECUTE FUNCTION public.certificate_payments_guard();

-- -----------------------------------------------------------------------------
-- 5. issue_certificate() - exempt batch bypasses the payment gate
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

  v_required := public.certificate_required_task_count(v_internship.domain_slug, v_internship.duration);
  IF v_approved < v_required THEN
    RAISE EXCEPTION 'Cannot issue certificate: % of % required tasks approved', v_approved, v_required;
  END IF;

  -- Payment gate: applies to payment_v1 EXCEPT the September 2026 batch.
  IF v_internship.certificate_flow_version = 'payment_v1'
     AND NOT public.is_september_2026_certificate_exempt(p_internship_id) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.certificate_payments
      WHERE internship_id = p_internship_id AND status = 'paid'
    ) THEN
      RETURN jsonb_build_object('error', 'Certificate payment not verified');
    END IF;
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
  VALUES (p_internship_id, 'issued', v_admin_id, v_internship.certificate_code, v_code,
          CASE WHEN public.is_september_2026_certificate_exempt(p_internship_id)
               THEN 'Initial issue (September 2026 batch - payment exempt)'
               ELSE 'Initial issue' END);

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
-- 6. reissue_certificate() - exempt batch bypasses the payment gate,
--    and required task count is now domain-aware (was hardcoded 3/4/5).
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

  v_required := public.certificate_required_task_count(v_internship.domain_slug, v_internship.duration);
  IF v_approved < v_required THEN
    RAISE EXCEPTION 'Cannot reissue: only % of % required tasks are approved', v_approved, v_required;
  END IF;

  IF v_internship.certificate_flow_version = 'payment_v1'
     AND NOT public.is_september_2026_certificate_exempt(p_internship_id) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.certificate_payments
      WHERE internship_id = p_internship_id AND status = 'paid'
    ) THEN
      RETURN jsonb_build_object('error', 'Certificate payment not verified');
    END IF;
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
-- 7. Recalculate progress using the shared domain-aware helper
--    (identical values to the previous inline CASE, now single-sourced)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recalc_internship_progress()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_iid uuid;
  v_approved int;
  v_duration text;
  v_domain_slug text;
  v_required int;
BEGIN
  v_iid := COALESCE(NEW.internship_id, OLD.internship_id);

  SELECT count(*) INTO v_approved
    FROM public.submissions WHERE internship_id = v_iid AND status = 'approved';

  SELECT i.duration, d.slug INTO v_duration, v_domain_slug
    FROM public.internships i
    LEFT JOIN public.domains d ON d.id = i.domain_id
    WHERE i.id = v_iid;

  v_required := public.certificate_required_task_count(v_domain_slug, v_duration);

  UPDATE public.internships
    SET progress_percent = LEAST(ROUND((v_approved::float / v_required::float) * 100), 100),
        status = CASE
          WHEN v_approved >= v_required AND status <> 'completed'
            THEN 'completed'::public.internship_status
          ELSE status
        END,
        completed_at = CASE
          WHEN v_approved >= v_required AND completed_at IS NULL THEN now()
          ELSE completed_at
        END
    WHERE id = v_iid;
  RETURN NEW;
END $$;

-- -----------------------------------------------------------------------------
-- 8. Notify PostgREST to reload schema
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';