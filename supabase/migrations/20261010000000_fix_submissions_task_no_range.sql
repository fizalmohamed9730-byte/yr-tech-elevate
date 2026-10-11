-- =============================================================================
-- FIX submissions.task_no CHECK CONSTRAINT (allow all valid tasks 1..10)
-- DATE: 2026-10-10
-- =============================================================================
-- ROOT CAUSE:
--   The base schema created public.submissions.task_no with
--     CHECK (task_no BETWEEN 1 AND 5)          (auto-named submissions_task_no_check)
--   The internship configuration supports up to 10 tasks (AI / Full-Stack for
--   3 Months requires 5/7/10 tasks; other domains require 3/4/5). Submitting
--   Task 6+ therefore fails with:
--     new row for relation "submissions" violates check constraint
--     "submissions_task_no_check"
--
-- FIX:
--   Replace the outdated constraint with CHECK (task_no BETWEEN 1 AND 10), which
--   matches the maximum task number produced by the frontend (src/lib/tasks.ts)
--   and keeps the numeric bound validation (arbitrary/invalid values still fail).
--
-- SAFETY / SCOPE:
--   - Idempotent: DROP ... IF EXISTS then ADD.
--   - Touches ONLY the task_no CHECK constraint. No rows are inserted, updated
--     or deleted. RLS, policies, triggers, ownership checks, approval and
--     certificate logic are untouched.
--   - If any legacy rows fall outside 1..10, the constraint is added NOT VALID so
--     the migration cannot fail on historical data; all new writes are still
--     validated. Otherwise it is added and fully validated.
-- =============================================================================

DO $$
DECLARE
  v_out_of_range bigint;
BEGIN
  SELECT count(*) INTO v_out_of_range
  FROM public.submissions
  WHERE task_no < 1 OR task_no > 10;

  ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_task_no_check;

  IF v_out_of_range = 0 THEN
    ALTER TABLE public.submissions
      ADD CONSTRAINT submissions_task_no_check CHECK (task_no BETWEEN 1 AND 10);
  ELSE
    RAISE WARNING
      'Found % submissions with task_no outside 1..10; adding submissions_task_no_check as NOT VALID (new rows are still validated).',
      v_out_of_range;
    ALTER TABLE public.submissions
      ADD CONSTRAINT submissions_task_no_check CHECK (task_no BETWEEN 1 AND 10) NOT VALID;
  END IF;
END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
