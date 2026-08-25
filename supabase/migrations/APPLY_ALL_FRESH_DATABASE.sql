-- ============================================================================
-- YR NOVATECH INTERNSHIP PORTAL — COMPLETE DATABASE SETUP (single file)
-- Run once in the Supabase SQL Editor of a COMPLETELY EMPTY database.
-- Idempotent: safe to re-run. Functions use CREATE OR REPLACE, tables use
-- CREATE IF NOT EXISTS, policies/triggers are DROP-then-CREATE.
-- ============================================================================

-- ------------------------- 1. ENUMS (exception-safe, no ADD VALUE in txn) -------------------------
DO $$
BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','student','intern');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.internship_status AS ENUM ('pending','active','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------- 2. user_roles -------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ------------------------- 3. has_role() -------------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ------------------------- 4. profiles -------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  bio text,
  avatar_url text,
  github_url text,
  linkedin_url text,
  portfolio_url text,
  resume_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------- 5. domains -------------------------
CREATE TABLE IF NOT EXISTS public.domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.domains TO anon, authenticated;
GRANT ALL ON public.domains TO service_role;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active domains" ON public.domains;
CREATE POLICY "Anyone can view active domains" ON public.domains
  FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Admins manage domains" ON public.domains;
CREATE POLICY "Admins manage domains" ON public.domains
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.domains (slug, name, description, icon) VALUES
  ('full-stack',        'Full Stack Development',                'MERN, Next.js, Postgres, deployments.', 'Code'),
  ('ui-ux',             'UI/UX Design',                          'Figma, design systems, user research.', 'Palette'),
  ('python',            'Python Programming',                    'Scripting, automation, backend with FastAPI.', 'Terminal'),
  ('cpp',               'C++ Programming',                       'DSA, OOP, competitive problem solving.', 'Cpu'),
  ('cyber-security',    'Cyber Security',                        'Ethical hacking, web security, CTF challenges.', 'Shield'),
  ('artificial-intelligence', 'Artificial Intelligence & Machine Learning',
                          'Data analysis, prediction models, spam email detection, chatbots.', 'Cpu')
ON CONFLICT (slug) DO NOTHING;

-- ------------------------- 6. batches -------------------------
CREATE TABLE IF NOT EXISTS public.batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.batches TO authenticated;
GRANT ALL ON public.batches TO service_role;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated view batches" ON public.batches;
CREATE POLICY "Authenticated view batches" ON public.batches
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage batches" ON public.batches;
CREATE POLICY "Admins manage batches" ON public.batches
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ------------------------- 7. internships (base) -------------------------
CREATE TABLE IF NOT EXISTS public.internships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_code text NOT NULL UNIQUE
    DEFAULT ('YR-' || upper(substring(gen_random_uuid()::text, 1, 8))),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id uuid NOT NULL REFERENCES public.domains(id),
  batch_id uuid REFERENCES public.batches(id),
  status public.internship_status NOT NULL DEFAULT 'pending',
  progress_percent int NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.internships TO authenticated;
GRANT ALL ON public.internships TO service_role;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own internships" ON public.internships;
CREATE POLICY "Students view own internships" ON public.internships
  FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS "Admins view all internships" ON public.internships;
CREATE POLICY "Admins view all internships" ON public.internships
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Students create own internship" ON public.internships;
CREATE POLICY "Students create own internship" ON public.internships
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage internships" ON public.internships;
CREATE POLICY "Admins manage internships" ON public.internships
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS internships_set_updated_at ON public.internships;
CREATE TRIGGER internships_set_updated_at BEFORE UPDATE ON public.internships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------- 8. EXTEND columns -------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS college text,
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS year text,
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS internship_id uuid,
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS selected_domain text,
  ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'intern';

UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;

ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS offer_letter_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS offer_issued_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS certificate_issued_at timestamptz,
  ADD COLUMN IF NOT EXISTS duration text NOT NULL DEFAULT '1 Month'
    CHECK (duration IN ('1 Month', '2 Months', '3 Months')),
  ADD COLUMN IF NOT EXISTS offer_letter_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS offer_letter_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS offer_letter_email_error text,
  ADD COLUMN IF NOT EXISTS offer_letter_resend_message_id text,
  ADD COLUMN IF NOT EXISTS certificate_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS certificate_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_email_error text,
  ADD COLUMN IF NOT EXISTS certificate_resend_message_id text;

CREATE UNIQUE INDEX IF NOT EXISTS internships_one_per_student ON public.internships(student_id);

-- ------------------------- 9. submissions -------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  task_no int NOT NULL CHECK (task_no BETWEEN 1 AND 6),
  github_url text,
  project_url text,
  drive_url text,
  notes text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','resubmit')),
  feedback text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (internship_id, task_no)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own submissions" ON public.submissions;
CREATE POLICY "Students view own submissions" ON public.submissions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.internships i WHERE i.id = internship_id AND i.student_id = auth.uid()));
DROP POLICY IF EXISTS "Students insert own submissions" ON public.submissions;
CREATE POLICY "Students insert own submissions" ON public.submissions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.internships i WHERE i.id = internship_id AND i.student_id = auth.uid()));
DROP POLICY IF EXISTS "Students update own pending submissions" ON public.submissions;
CREATE POLICY "Students update own pending submissions" ON public.submissions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.internships i WHERE i.id = internship_id AND i.student_id = auth.uid())
         AND status IN ('pending','resubmit','rejected'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.internships i WHERE i.id = internship_id AND i.student_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage submissions" ON public.submissions;
CREATE POLICY "Admins manage submissions" ON public.submissions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS submissions_set_updated_at ON public.submissions;
CREATE TRIGGER submissions_set_updated_at BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------- 10. Progress / certificate / offer letter -------------------------
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
        status = CASE WHEN v_approved >= v_required THEN 'completed'::public.internship_status ELSE status END,
        completed_at = CASE WHEN v_approved >= v_required AND completed_at IS NULL THEN now() ELSE completed_at END,
        certificate_code = CASE WHEN v_approved >= 1 AND certificate_code IS NULL
          THEN 'YRN-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8)) ELSE certificate_code END,
        certificate_issued_at = CASE WHEN v_approved >= 1 AND certificate_issued_at IS NULL
          THEN now() ELSE certificate_issued_at END
  WHERE id = v_iid;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS submissions_recalc ON public.submissions;
CREATE TRIGGER submissions_recalc AFTER INSERT OR UPDATE OR DELETE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.recalc_internship_progress();

CREATE OR REPLACE FUNCTION public.issue_offer_letter()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.offer_letter_code IS NULL THEN
    NEW.offer_letter_code := 'YRN-OL-' || upper(substring(gen_random_uuid()::text, 1, 8));
    NEW.offer_issued_at := now();
    IF NEW.started_at IS NULL THEN NEW.started_at := now(); END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS internships_issue_offer ON public.internships;
CREATE TRIGGER internships_issue_offer BEFORE UPDATE ON public.internships
  FOR EACH ROW EXECUTE FUNCTION public.issue_offer_letter();

-- ------------------------- 11. Storage buckets + policies -------------------------
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars',        'avatars',        true),
  ('resumes',        'resumes',        false),
  ('submissions',    'submissions',    false),
  ('offer-letters',  'offer-letters',  false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload to own resume folder" ON storage.objects;
CREATE POLICY "Users upload to own resume folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users read own resume" ON storage.objects;
CREATE POLICY "Users read own resume" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));
DROP POLICY IF EXISTS "Users update own resume" ON storage.objects;
CREATE POLICY "Users update own resume" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users delete own resume" ON storage.objects;
CREATE POLICY "Users delete own resume" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users upload to own submissions" ON storage.objects;
CREATE POLICY "Users upload to own submissions" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'submissions' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users read own submissions, admins all" ON storage.objects;
CREATE POLICY "Users read own submissions, admins all" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'submissions' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));
DROP POLICY IF EXISTS "Avatars are public read" ON storage.objects;
CREATE POLICY "Avatars are public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Admins manage offer letters storage" ON storage.objects;
CREATE POLICY "Admins manage offer letters storage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'offer-letters' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'offer-letters' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Interns read own offer letter storage" ON storage.objects;
CREATE POLICY "Interns read own offer letter storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'offer-letters' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ------------------------- 12. Projects -------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  file_url text,
  deadline timestamptz,
  difficulty text NOT NULL DEFAULT 'Intermediate'
    CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.project_domains (
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  domain_id uuid REFERENCES public.domains(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, domain_id)
);
ALTER TABLE public.project_domains ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.project_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url text,
  github_url text,
  notes text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  feedback text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, student_id)
);
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
CREATE POLICY "Authenticated users can view projects" ON public.projects
  FOR SELECT TO authenticated USING (active = true);
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
CREATE POLICY "Admins can insert projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
CREATE POLICY "Admins can update projects" ON public.projects
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects" ON public.projects
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Authenticated users can view project_domains" ON public.project_domains;
CREATE POLICY "Authenticated users can view project_domains" ON public.project_domains
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage project_domains" ON public.project_domains;
CREATE POLICY "Admins can manage project_domains" ON public.project_domains
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Students view own submissions, admins all" ON public.project_submissions;
CREATE POLICY "Students view own submissions, admins all" ON public.project_submissions
  FOR SELECT TO authenticated USING (student_id = auth.uid() OR has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Students can insert own submissions" ON public.project_submissions;
CREATE POLICY "Students can insert own submissions" ON public.project_submissions
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "Students can update own pending submissions" ON public.project_submissions;
CREATE POLICY "Students can update own pending submissions" ON public.project_submissions
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid() AND status = 'pending')
  WITH CHECK (student_id = auth.uid() AND status = 'pending');
DROP POLICY IF EXISTS "Admins can manage submissions" ON public.project_submissions;
CREATE POLICY "Admins can manage submissions" ON public.project_submissions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_domains TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_submissions TO authenticated;

-- ------------------------- 13. Internship code generator (YRN<YYYY>NNNNN) -------------------------
CREATE SEQUENCE IF NOT EXISTS public.internship_code_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.generate_internship_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_year text := to_char(now(), 'YYYY');
  v_code text;
BEGIN
  v_code := 'YRN' || v_year || lpad(nextval('public.internship_code_seq')::text, 5, '0');
  WHILE EXISTS (SELECT 1 FROM public.internships WHERE internship_code = v_code) LOOP
    v_code := 'YRN' || v_year || lpad(nextval('public.internship_code_seq')::text, 5, '0');
  END LOOP;
  NEW.internship_code := v_code;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tr_generate_internship_code ON public.internships;
CREATE TRIGGER tr_generate_internship_code
  BEFORE INSERT ON public.internships
  FOR EACH ROW EXECUTE FUNCTION public.generate_internship_code();

ALTER TABLE public.internships ALTER COLUMN internship_code DROP DEFAULT;
ALTER TABLE public.internships ALTER COLUMN internship_code SET NOT NULL;

-- ------------------------- 14. Auto-confirm emails -------------------------
-- NOTE: On modern Supabase, auth.users.confirmed_at is a GENERATED ALWAYS column
-- (derived from email_confirmed_at / phone_confirmed_at). It can ONLY be set to
-- DEFAULT and must NEVER be written directly, or error 428C9 is raised.
-- We therefore set ONLY email_confirmed_at; confirmed_at is derived automatically.
CREATE OR REPLACE FUNCTION public.auto_confirm_student_emails()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tr_auto_confirm_emails ON auth.users;
CREATE TRIGGER tr_auto_confirm_emails
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_student_emails();

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- ------------------------- 15. handle_new_user (NO hardcoded emails) -------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.app_role;
  v_domain uuid;
  v_duration text;
  v_internship_id uuid;
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    v_role := 'admin';
  ELSE
    v_role := 'intern';
  END IF;

  INSERT INTO public.profiles (
    id, user_id, email, full_name, phone, college, department, year,
    avatar_url, must_change_password, role, duration, selected_domain
  )
  VALUES (
    NEW.id, NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name',
             split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'college',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'year',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false),
    v_role,
    COALESCE(NEW.raw_user_meta_data->>'duration', '1 Month'),
    NEW.raw_user_meta_data->>'domain_id'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    college = COALESCE(EXCLUDED.college, public.profiles.college),
    department = COALESCE(EXCLUDED.department, public.profiles.department),
    year = COALESCE(EXCLUDED.year, public.profiles.year),
    role = EXCLUDED.role;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF NEW.raw_user_meta_data->>'domain_id'
     ~ '^[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$' THEN
    v_domain := (NEW.raw_user_meta_data->>'domain_id')::uuid;
  END IF;

  v_duration := COALESCE(NEW.raw_user_meta_data->>'duration', '1 Month');
  IF v_domain IS NOT NULL AND v_role = 'intern' THEN
    INSERT INTO public.internships (student_id, domain_id, duration)
    VALUES (NEW.id, v_domain, v_duration)
    ON CONFLICT (student_id) DO NOTHING
    RETURNING id INTO v_internship_id;
    UPDATE public.profiles
    SET internship_id = COALESCE(v_internship_id, internship_id)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------- 15b. Enquiries & Announcements -------------------------
CREATE TABLE IF NOT EXISTS public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','archived'))
);
GRANT SELECT ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit an enquiry" ON public.enquiries;
CREATE POLICY "Anyone can submit an enquiry" ON public.enquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Admins view enquiries" ON public.enquiries;
CREATE POLICY "Admins view enquiries" ON public.enquiries
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage enquiries" ON public.enquiries;
CREATE POLICY "Admins manage enquiries" ON public.enquiries
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth users view announcements" ON public.announcements;
CREATE POLICY "Auth users view announcements" ON public.announcements
  FOR SELECT TO authenticated USING (active = true);
DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
CREATE POLICY "Admins manage announcements" ON public.announcements
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ------------------------- 17. Feedback table -------------------------
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message text NOT NULL CHECK (char_length(message) >= 10),
  created_at timestamptz DEFAULT now() NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students insert own feedback" ON public.feedback;
CREATE POLICY "Students insert own feedback" ON public.feedback
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students view own feedback" ON public.feedback;
CREATE POLICY "Students view own feedback" ON public.feedback
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students update own feedback" ON public.feedback;
CREATE POLICY "Students update own feedback" ON public.feedback
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students delete own feedback" ON public.feedback;
CREATE POLICY "Students delete own feedback" ON public.feedback
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins view all feedback" ON public.feedback;
CREATE POLICY "Admins view all feedback" ON public.feedback
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage all feedback" ON public.feedback;
CREATE POLICY "Admins manage all feedback" ON public.feedback
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ------------------------- 18. Admin bootstrap RPC -------------------------
CREATE OR REPLACE FUNCTION public.promote_to_admin(p_email text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
     OR EXISTS (SELECT 1 FROM public.user_roles
                WHERE user_id = auth.uid() AND role = 'admin') THEN
    SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower(p_email);
    IF v_uid IS NOT NULL THEN
      DELETE FROM public.user_roles WHERE user_id = v_uid;
      INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin');
      UPDATE public.profiles SET role = 'admin' WHERE id = v_uid;
      RETURN true;
    END IF;
  END IF;
  RETURN false;
END $$;

REVOKE ALL ON FUNCTION public.promote_to_admin(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(text) TO authenticated, service_role;

-- ------------------------- 17. user_roles: self-insert on signup -------------------------
DROP POLICY IF EXISTS "Users insert own role on signup" ON public.user_roles;
CREATE POLICY "Users insert own role on signup" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'intern');
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ------------------------- 18. Tighten function execution (all functions now exist) -------------------------
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.promote_to_admin(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_internship_progress() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.issue_offer_letter() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_internship_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_confirm_student_emails() FROM PUBLIC, anon, authenticated;