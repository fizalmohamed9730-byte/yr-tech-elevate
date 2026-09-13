-- ============================================================================
-- FIX PROFILES QUERY TIMEOUT — "canceling statement due to statement timeout"
-- Date: 2026-09-13
-- ============================================================================
-- ROOT CAUSE:
--   1. avatar_url column stores base64-encoded images (up to ~800KB each)
--   2. Admin query fetches ALL profiles INCLUDING avatar_url (~40MB+ for 50 students)
--   3. No index on created_at (ORDER BY requires full sort on bloated result)
--   4. 9 parallel queries compete for DB resources
--
-- FIXES (applied in this migration + frontend code):
--   A. Add indexes for ORDER BY clauses used in admin queries
--   B. Frontend: remove avatar_url from admin profiles SELECT (load on demand)
--   C. Add index for user_roles lookups used by has_role() in RLS
-- ============================================================================

-- 1. Index for profiles ORDER BY created_at DESC (admin intern list)
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at DESC);

-- 2. Index for internships ORDER BY created_at DESC (admin internship list)
CREATE INDEX IF NOT EXISTS idx_internships_created_at ON public.internships (created_at DESC);

-- 3. Index for submissions ORDER BY submitted_at DESC (admin submission list)
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON public.submissions (submitted_at DESC);

-- 4. Index for feedback ORDER BY created_at DESC (admin feedback list)
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback (created_at DESC);

-- 5. Index for announcements ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements (created_at DESC);

-- 6. Index for enquiries ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries (created_at DESC);

-- 7. Composite index for submissions by internship_id (used in dashboard load)
CREATE INDEX IF NOT EXISTS idx_submissions_internship_task ON public.submissions (internship_id, task_no);

-- 8. Index for feedback by user_id (used in dashboard FeedbackPanel)
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback (user_id);

-- 9. Index for internships by student_id (used in dashboard + admin)
CREATE INDEX IF NOT EXISTS idx_internships_student_id ON public.internships (student_id);

-- 10. Ensure has_role() is the clean version (no auth.users UNION ALL).
--     Older migrations (20260627160000, 20260701) added a hardcoded email
--     UNION ALL into auth.users which adds overhead to every RLS evaluation.
--     This version is idempotent and matches APPLY_ALL_FRESH_DATABASE.sql.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 11. Fix auto_confirm_student_emails trigger.
--     The 20260701 version tries to write to auth.users.confirmed_at which is
--     GENERATED ALWAYS on modern Supabase. Writing to it raises error 428C9.
--     Only email_confirmed_at should be set; confirmed_at is derived automatically.
CREATE OR REPLACE FUNCTION public.auto_confirm_student_emails()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := now();
  END IF;
  RETURN NEW;
END $$;

-- ============================================================================
-- SECURITY: No data modified. No RLS disabled. Only indexes + function replace.
-- ============================================================================
