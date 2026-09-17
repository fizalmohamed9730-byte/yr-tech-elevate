-- ============================================================
-- FIX FULL STACK TASK DUPLICATION ROOT CAUSES
-- ============================================================

-- 1. Widen task_no CHECK constraint to allow tasks 7-10 (for 3-month internships)
ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_task_no_check;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_task_no_check CHECK (task_no BETWEEN 1 AND 10);

-- 2. Add unique index to prevent duplicate submissions at DB level
--    (UNIQUE(internship_id, task_no) already exists, but ensure it's enforced)
--    This is already in the schema. Verify it exists:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'submissions_internship_id_task_no_key'
  ) THEN
    ALTER TABLE public.submissions ADD UNIQUE (internship_id, task_no);
  END IF;
END $$;

-- 3. Clean up any existing duplicate submissions (keep the one with earliest submitted_at)
DELETE FROM public.submissions
WHERE id NOT IN (
  SELECT MIN(id)
  FROM public.submissions
  GROUP BY internship_id, task_no
);
