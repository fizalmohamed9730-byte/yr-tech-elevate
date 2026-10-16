-- =============================================================================
-- TASK SUBMISSION & RESUBMISSION AUDIT AND RESILIENCE MIGRATION
-- DATE: 2026-10-15
-- =============================================================================
-- Comprehensive verification and hardening for task submissions & resubmissions
-- across all internship domains (Full-Stack, AI/ML, Python, C++, UI/UX, Cybersecurity)
-- and durations (1 Month, 2 Months, 3 Months).
--
-- Guarantees:
--   1. task_no valid range 1..10 (accommodates 3-month AI/Full-Stack milestones).
--   2. status CHECK allows ('pending_review', 'pending', 'approved', 'rejected', 'resubmit').
--   3. Unique constraint on (internship_id, task_no) prevents duplicate submission records.
--   4. RLS policies allow students to INSERT new tasks and UPDATE existing
--      submissions (after revision request or pending review) to 'pending_review'.
--   5. Students can never self-approve.
--   6. Admin permissions and certificate release logic remain strictly protected.
-- =============================================================================

-- 1. Ensure task_no range constraint (1..10)
DO $$
BEGIN
  ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_task_no_check;
  ALTER TABLE public.submissions ADD CONSTRAINT submissions_task_no_check CHECK (task_no BETWEEN 1 AND 10);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Constraint submissions_task_no_check update encountered: %', SQLERRM;
END $$;

-- 2. Ensure status CHECK constraint includes all valid states
DO $$
BEGIN
  ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
  ALTER TABLE public.submissions ADD CONSTRAINT submissions_status_check
    CHECK (status IN ('pending_review', 'pending', 'approved', 'rejected', 'resubmit'));
  ALTER TABLE public.submissions ALTER COLUMN status SET DEFAULT 'pending_review';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Constraint submissions_status_check update encountered: %', SQLERRM;
END $$;

-- 3. Ensure unique constraint on (internship_id, task_no)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'submissions_internship_id_task_no_key'
  ) THEN
    ALTER TABLE public.submissions ADD CONSTRAINT submissions_internship_id_task_no_key UNIQUE (internship_id, task_no);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Unique constraint submissions_internship_id_task_no_key check: %', SQLERRM;
END $$;

-- 4. Performance indices for dashboard and admin queries
CREATE INDEX IF NOT EXISTS idx_submissions_internship_task ON public.submissions (internship_id, task_no);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON public.submissions (submitted_at DESC);

-- 5. RLS Policies
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 5a. SELECT: Students can view their own submissions
DROP POLICY IF EXISTS "Students view own submissions" ON public.submissions;
CREATE POLICY "Students view own submissions" ON public.submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_id AND i.student_id = auth.uid()
    )
  );

-- 5b. INSERT: Students can insert their own submissions in pending_review / pending status
DROP POLICY IF EXISTS "Students insert own submissions" ON public.submissions;
CREATE POLICY "Students insert own submissions" ON public.submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_id AND i.student_id = auth.uid()
    )
    AND status IN ('pending_review', 'pending')
  );

-- 5c. UPDATE: Students can update their own submissions if rejected, needs revision,
--              or awaiting evaluation (e.g. fixing broken link before admin review)
DROP POLICY IF EXISTS "Students update own pending submissions" ON public.submissions;
CREATE POLICY "Students update own pending submissions" ON public.submissions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_id AND i.student_id = auth.uid()
    )
    AND status IN ('resubmit', 'rejected', 'pending_review', 'pending')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_id AND i.student_id = auth.uid()
    )
    AND status IN ('pending_review', 'pending')
  );

-- 5d. Admin full management policy
DROP POLICY IF EXISTS "Admins manage submissions" ON public.submissions;
CREATE POLICY "Admins manage submissions" ON public.submissions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
