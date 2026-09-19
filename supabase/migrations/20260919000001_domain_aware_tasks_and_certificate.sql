-- =============================================================================
-- FIX: Domain-Aware Task Submission + Certificate Eligibility
-- DATE: 2026-09-19
-- =============================================================================
-- ROOT CAUSES:
--   1. submissions_task_no_check may still be BETWEEN 1 AND 5 or 1 AND 6 in
--      production, blocking task submissions for AIML/FullStack 2M/3M interns
--      (tasks 6-10).
--   2. recalc_internship_progress() hardcodes required tasks as 3/4/5 based on
--      duration only, ignoring domain. AIML/FullStack have 5/7/10 tasks per
--      duration, so internships are marked "completed" prematurely.
--   3. issue_certificate() RPC uses the same hardcoded 3/4/5, allowing premature
--      certificate issuance.
--
-- FIXES:
--   1. Widen CHECK constraint to BETWEEN 1 AND 10 (idempotent).
--   2. Make recalc_internship_progress() domain-aware.
--   3. Make issue_certificate() domain-aware.
--   4. Recalculate status of all internships using corrected logic.
--
-- SAFETY:
--   - All operations are idempotent (IF EXISTS / CREATE OR REPLACE).
--   - No data is deleted or modified except status/progress fields.
--   - Existing approved submissions are preserved.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Widen task_no CHECK constraint (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_task_no_check;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_task_no_check CHECK (task_no BETWEEN 1 AND 10);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Replace recalc_internship_progress() — DOMAIN-AWARE
--    Required tasks by domain + duration:
--      AI/FullStack: 1M=5, 2M=7, 3M=10
--      Other domains: 1M=3, 2M=4, 3M=5
-- ─────────────────────────────────────────────────────────────────────────────
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

  -- Domain-aware required task count
  v_required := CASE
    WHEN v_domain_slug IN ('artificial-intelligence', 'full-stack') AND v_duration = '1 Month' THEN 5
    WHEN v_domain_slug IN ('artificial-intelligence', 'full-stack') AND v_duration = '2 Months' THEN 7
    WHEN v_domain_slug IN ('artificial-intelligence', 'full-stack') AND v_duration = '3 Months' THEN 10
    WHEN v_duration = '1 Month' THEN 3
    WHEN v_duration = '2 Months' THEN 4
    ELSE 5
  END;

  UPDATE public.internships
    SET progress_percent = LEAST(ROUND((v_approved::float / v_required::float) * 100), 100),
        status = CASE
          WHEN v_approved >= v_required AND status != 'completed'
            THEN 'completed'::public.internship_status
          ELSE status
        END,
        completed_at = CASE
          WHEN v_approved >= v_required AND completed_at IS NULL THEN now()
          ELSE completed_at
        END
        -- NOTE: certificate_code is NEVER set here. Only admin issue_certificate can set it.
    WHERE id = v_iid;
  RETURN NEW;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Replace issue_certificate() — DOMAIN-AWARE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.issue_certificate(p_internship_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
  v_domain_slug text;
  v_approved int;
  v_required int;
  v_code text;
BEGIN
  -- Verify caller is admin
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can issue certificates';
  END IF;

  -- Fetch internship + domain slug
  SELECT i.*, d.slug AS domain_slug INTO v_internship
    FROM public.internships i
    LEFT JOIN public.domains d ON d.id = i.domain_id
    WHERE i.id = p_internship_id;
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

  -- Domain-aware required task count
  v_required := CASE
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '1 Month' THEN 5
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '2 Months' THEN 7
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '3 Months' THEN 10
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
-- 4. Recalculate status of ALL internships using corrected logic
--    This fixes any internships that were prematurely marked "completed"
--    due to the old 3/4/5 hardcoded logic.
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE public.internships
SET
  progress_percent = sub.new_progress,
  status = CASE
    WHEN sub.new_progress >= 100 AND status != 'completed' THEN 'completed'::public.internship_status
    WHEN sub.new_progress < 100 AND status = 'completed' THEN 'active'::public.internship_status
    ELSE status
  END,
  completed_at = CASE
    WHEN sub.new_progress >= 100 AND completed_at IS NULL THEN now()
    WHEN sub.new_progress < 100 THEN NULL
    ELSE completed_at
  END
FROM (
  SELECT
    i.id AS internship_id,
    LEAST(ROUND(
      (count(CASE WHEN s.status = 'approved' THEN 1 END)::float /
       CASE
         WHEN d.slug IN ('artificial-intelligence', 'full-stack') AND i.duration = '1 Month' THEN 5.0
         WHEN d.slug IN ('artificial-intelligence', 'full-stack') AND i.duration = '2 Months' THEN 7.0
         WHEN d.slug IN ('artificial-intelligence', 'full-stack') AND i.duration = '3 Months' THEN 10.0
         WHEN i.duration = '1 Month' THEN 3.0
         WHEN i.duration = '2 Months' THEN 4.0
         ELSE 5.0
       END
    ) * 100), 100) AS new_progress
  FROM public.internships i
  LEFT JOIN public.submissions s ON s.internship_id = i.id
  LEFT JOIN public.domains d ON d.id = i.domain_id
  WHERE i.certificate_code IS NULL  -- only recalculate internships without issued certificates
  GROUP BY i.id, d.slug, i.duration
) sub
WHERE public.internships.id = sub.internship_id;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Ensure trigger bindings exist
-- ─────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS submissions_recalc ON public.submissions;
CREATE TRIGGER submissions_recalc AFTER INSERT OR UPDATE OR DELETE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.recalc_internship_progress();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Notify PostgREST to reload schema
-- ─────────────────────────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
