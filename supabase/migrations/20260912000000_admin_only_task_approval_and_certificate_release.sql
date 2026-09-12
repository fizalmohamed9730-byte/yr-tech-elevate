-- =============================================================================
-- ADMIN-ONLY TASK APPROVAL & CERTIFICATE RELEASE
-- DATE: 2026-09-12
-- =============================================================================
-- This migration enforces that ONLY the admin can:
--   1. Approve/reject task submissions (status → approved/rejected)
--   2. Release certificates (certificate_code + certificate_issued_at)
--
-- Interns submit tasks as 'pending_review' (not 'pending').
-- Students CANNOT update submission status to 'approved' or any other value.
-- Students can only resubmit when admin sets status to 'resubmit'.
-- =============================================================================

-- 1. Add 'pending_review' to submissions status CHECK constraint
--    Current: IN ('pending','approved','rejected','resubmit')
--    New:     IN ('pending_review','pending','approved','rejected','resubmit')
--    (keep 'pending' for backwards compatibility with any legacy rows)
ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_status_check
  CHECK (status IN ('pending_review','pending','approved','rejected','resubmit'));

-- 2. Change the default status from 'pending' to 'pending_review'
ALTER TABLE public.submissions ALTER COLUMN status SET DEFAULT 'pending_review';

-- 3. Migrate any existing 'pending' rows to 'pending_review'
UPDATE public.submissions SET status = 'pending_review' WHERE status = 'pending';

-- 4. Add certificate audit columns to internships
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS certificate_released_by uuid;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS certificate_released_at timestamptz;

-- 5. Tighten student RLS on submissions:
--    Students can ONLY update when status = 'resubmit' or 'rejected'
--    (admin asked for resubmission, or previous submission was rejected).
--    Can only set it back to 'pending_review'.
--    This prevents students from ever changing status to 'approved' or any other value.
DROP POLICY IF EXISTS "Students update own pending submissions" ON public.submissions;
CREATE POLICY "Students update own pending submissions" ON public.submissions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_id AND i.student_id = auth.uid()
    )
    AND status IN ('resubmit', 'rejected')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_id AND i.student_id = auth.uid()
    )
    AND status = 'pending_review'
  );

-- 6. Ensure the trigger function uses 'approved' count (unchanged, but confirm)
--    The recalc_internship_progress trigger already counts status = 'approved'.
--    It auto-sets internship status to 'completed' when all tasks are approved.
--    Certificate issuance is manual via admin (certificate_code column).
--    No changes needed to the trigger.
