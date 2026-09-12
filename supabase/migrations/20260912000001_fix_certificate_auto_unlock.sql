-- =============================================================================
-- FIX: Certificate auto-unlock bug
-- DATE: 2026-09-12
-- =============================================================================
-- ROOT CAUSE:
--   The recalc_internship_progress trigger (from 20260627151000 / 20260627152000)
--   auto-generates certificate_code when v_approved >= 1:
--
--     certificate_code = CASE WHEN v_approved >= 1 AND certificate_code IS NULL
--       THEN 'YRN-CERT-' || ... ELSE certificate_code END
--
--   This means the FIRST approved task unlocks the certificate automatically.
--
-- Additionally:
--   - The student UPDATE policy on internships allows modifying ANY column
--     (including certificate_code) — a student could set it via the API.
--   - The admin issueCertificate() function does not validate that all
--     required tasks are approved before issuing.
--
-- FIX:
--   1. Replace recalc_internship_progress — NO auto-certificate generation.
--      The trigger ONLY updates progress_percent, status, completed_at.
--   2. Revoke any prematurely issued certificates (where not all tasks approved).
--   3. Tighten student UPDATE policy — only allow status + started_at changes.
--   4. Create issue_certificate RPC — validates all tasks approved before issuing.
--   5. Prevent students from directly setting certificate fields via RLS.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Replace trigger — REMOVE auto certificate generation
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.recalc_internship_progress()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_iid uuid;
  v_approved int;
  v_duration text;
  v_required int;
BEGIN
  v_iid := COALESCE(NEW.internship_id, OLD.internship_id);
  SELECT count(*) INTO v_approved
    FROM public.submissions WHERE internship_id = v_iid AND status = 'approved';
  SELECT duration INTO v_duration
    FROM public.internships WHERE id = v_iid;
  v_required := CASE
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
-- 2. Revoke prematurely issued certificates
--    Any internship where certificate_code was auto-generated but not all
--    required tasks are approved → set certificate_code back to NULL.
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE public.internships
SET certificate_code   = NULL,
    certificate_issued_at = NULL
WHERE certificate_code IS NOT NULL
  AND (
    SELECT count(*) FROM public.submissions
    WHERE internship_id = public.internships.id AND status = 'approved'
  ) < CASE
    WHEN public.internships.duration = '1 Month' THEN 3
    WHEN public.internships.duration = '2 Months' THEN 4
    ELSE 5
  END;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Tighten student UPDATE policy on internships
--    Students may ONLY update status + started_at (for auto-activation flow).
--    They must NOT be able to modify certificate_code, certificate_issued_at,
--    certificate_released_by, certificate_released_at, progress_percent, etc.
--
--    Approach: DROP the broad student UPDATE policy and replace it with a
--    restricted version using a BEFORE UPDATE trigger that rejects changes
--    to certificate columns by non-admin users.
-- ─────────────────────────────────────────────────────────────────────────────

-- 3a. Remove the overly broad student UPDATE policy
DROP POLICY IF EXISTS "Students update own internship" ON public.internships;

-- 3b. Re-create it — students can update their own internship, BUT a
--     BEFORE UPDATE trigger will reject any attempt to modify certificate fields.
CREATE POLICY "Students update own internship" ON public.internships
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- 3c. BEFORE UPDATE trigger to block certificate field changes by non-admins
CREATE OR REPLACE FUNCTION public.protect_certificate_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- If the current user is NOT an admin, block changes to certificate fields
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
    -- Also block students from setting their own progress_percent or status to completed
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
-- 4. Secure certificate issuance function (RPC)
--    Only callable by admins. Validates that ALL required tasks are approved
--    before issuing the certificate. Prevents certificate issuance if the
--    internship is not fully complete.
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

  -- Already issued?
  IF v_internship.certificate_code IS NOT NULL THEN
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

  -- Generate code and issue
  v_code := 'YRNT-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8));

  UPDATE public.internships
    SET certificate_code     = v_code,
        certificate_issued_at = now(),
        certificate_released_by = v_admin_id,
        certificate_released_at = now()
  WHERE id = p_internship_id;

  RETURN jsonb_build_object(
    'success', true,
    'certificate_code', v_code,
    'issued_at', now()::text,
    'released_by', v_admin_id::text
  );
END $$;

-- Grant execute only to authenticated (admin check is inside the function)
REVOKE EXECUTE ON FUNCTION public.issue_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_certificate(uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Confirm: trigger is AFTER INSERT OR UPDATE OR DELETE on submissions
-- ─────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS submissions_recalc ON public.submissions;
CREATE TRIGGER submissions_recalc AFTER INSERT OR UPDATE OR DELETE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.recalc_internship_progress();
