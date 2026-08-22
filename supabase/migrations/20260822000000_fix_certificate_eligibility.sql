-- =============================================================================
-- FIX: Certificate eligibility — require ALL tasks approved, not just 1
-- DATE: 2026-08-22
-- ISSUE: recalc_internship_progress() granted certificate when v_approved >= 1
-- FIX: Remove auto certificate generation entirely. Certificates must be
--       issued manually by admin via issueCertificate() or admin UI.
-- =============================================================================

-- 1. Revoke premature certificates where not all tasks are approved
UPDATE public.internships
SET certificate_code = NULL,
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

-- 2. Fix the trigger function: remove auto certificate generation
CREATE OR REPLACE FUNCTION public.recalc_internship_progress()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_iid uuid;
  v_approved int;
  v_duration text;
  v_required int;
BEGIN
  v_iid := COALESCE(NEW.internship_id, OLD.internship_id);
  SELECT count(*) INTO v_approved FROM public.submissions WHERE internship_id = v_iid AND status = 'approved';
  SELECT duration INTO v_duration FROM public.internships WHERE id = v_iid;
  v_required := CASE WHEN v_duration = '1 Month' THEN 3 WHEN v_duration = '2 Months' THEN 4 ELSE 5 END;

  UPDATE public.internships
    SET progress_percent = LEAST(ROUND((v_approved::float / v_required::float) * 100), 100),
        status = CASE
          WHEN v_approved >= v_required AND status != 'completed' THEN 'completed'::public.internship_status
          ELSE status
        END,
        completed_at = CASE
          WHEN v_approved >= v_required AND completed_at IS NULL THEN now()
          ELSE completed_at
        END
    WHERE id = v_iid;
  RETURN NEW;
END $$;

-- 3. Prevent students from self-approving submissions
-- The old WITH CHECK did not restrict the status field, allowing a student
-- to change status from 'pending' to 'approved'. Fix: only allow safe statuses.
DROP POLICY IF EXISTS "Students update own pending submissions" ON public.submissions;
CREATE POLICY "Students update own pending submissions" ON public.submissions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.internships i WHERE i.id = internship_id AND i.student_id = auth.uid())
    AND status IN ('pending', 'resubmit', 'rejected')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.internships i WHERE i.id = internship_id AND i.student_id = auth.uid())
    AND status IN ('pending', 'resubmit')
  );
