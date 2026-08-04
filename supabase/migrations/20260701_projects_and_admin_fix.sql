-- ============================================================
-- FIX ADMIN ROLE + CREATE PROJECT SYSTEM
-- Run in Supabase Dashboard SQL Editor if not done already
-- ============================================================

-- 1. FIX ADMIN ROLE (user needs admin, not student)
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'fizalyrtech@gmail.com')
  AND role != 'admin';

-- Ensure admin has exactly one admin role row
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'fizalyrtech@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Remove non-admin roles for admin
DELETE FROM public.user_roles
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'fizalyrtech@gmail.com')
  AND role != 'admin';

-- 2. UPDATE has_role to treat admin email as admin
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
    UNION ALL
    SELECT 1 FROM auth.users WHERE id = _user_id AND email = 'fizalyrtech@gmail.com' AND _role = 'admin'
  )
$$;

-- 3. CREATE set_role_admin RPC for fallback
CREATE OR REPLACE FUNCTION public.set_role_admin()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'fizalyrtech@gmail.com') THEN
    DELETE FROM public.user_roles WHERE user_id = auth.uid();
    INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  END IF;
END;
$$;

-- 4. CREATE PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  file_url text,
  deadline timestamptz,
  difficulty text NOT NULL DEFAULT 'Intermediate' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 5. CREATE PROJECT_DOMAINS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.project_domains (
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  domain_id uuid REFERENCES public.domains(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, domain_id)
);

ALTER TABLE public.project_domains ENABLE ROW LEVEL SECURITY;

-- 6. CREATE PROJECT_SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.project_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_url text,
  github_url text,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  feedback text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, student_id)
);

ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES FOR PROJECTS

-- Anyone authenticated can read active projects
CREATE POLICY "Authenticated users can view projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (active = true);

-- Admins can manage projects
CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 8. RLS POLICIES FOR PROJECT_DOMAINS

CREATE POLICY "Authenticated users can view project_domains"
  ON public.project_domains FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage project_domains"
  ON public.project_domains FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 9. RLS POLICIES FOR PROJECT_SUBMISSIONS

-- Students can view their own submissions; admins can view all
CREATE POLICY "Students view own submissions, admins all"
  ON public.project_submissions FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR has_role(auth.uid(), 'admin')
  );

-- Students can insert their own submissions
CREATE POLICY "Students can insert own submissions"
  ON public.project_submissions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Students can update their own pending submissions
CREATE POLICY "Students can update own pending submissions"
  ON public.project_submissions FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() AND status = 'pending')
  WITH CHECK (student_id = auth.uid() AND status = 'pending');

-- Admins can manage all submissions
CREATE POLICY "Admins can manage submissions"
  ON public.project_submissions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 10. GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_domains TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_submissions TO authenticated;

-- 11. AUTO-CONFIRM EMAILS (if not already created)
CREATE OR REPLACE FUNCTION public.auto_confirm_student_emails()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  NEW.email_confirmed_at := now();
  NEW.confirmed_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_auto_confirm_emails ON auth.users;
CREATE OR REPLACE TRIGGER tr_auto_confirm_emails
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_student_emails();

-- Confirm any remaining unconfirmed users
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now())
WHERE email_confirmed_at IS NULL;
