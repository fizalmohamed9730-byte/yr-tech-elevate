-- ============================================================
-- STABILIZE ADMIN DATA FETCHING
-- Apply missing analytics columns + add performance indexes
-- Safe: all ADD COLUMN IF NOT EXISTS, all CREATE INDEX IF NOT EXISTS
-- ============================================================

-- 1. Add missing analytics columns (migration 20260916 never applied to production)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS discovery_source text,
  ADD COLUMN IF NOT EXISTS discovery_other text;

COMMENT ON COLUMN public.profiles.country IS 'Country selected during registration';
COMMENT ON COLUMN public.profiles.discovery_source IS 'How the user heard about YR NOVATECH';
COMMENT ON COLUMN public.profiles.discovery_other IS 'Free-text when discovery_source is Other';

-- 2. Performance indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_internships_created_at ON public.internships (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON public.submissions (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_internship_task ON public.submissions (internship_id, task_no);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_internships_student_id ON public.internships (student_id);

-- 3. Ensure has_role is the clean version (no hardcoded email fallback)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Ensure auto_confirm_student_emails avoids GENERATED ALWAYS error
CREATE OR REPLACE FUNCTION public.auto_confirm_student_emails()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := now();
  END IF;
  RETURN NEW;
END;
$$;
