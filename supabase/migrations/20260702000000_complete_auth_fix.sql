-- ============================================================================
-- COMPLETE AUTH & REGISTRATION FIX — YR NOVATECH Internship Portal
-- Idempotent: safe to run multiple times. Run in Supabase Dashboard SQL Editor.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. ROLE ENUM — add 'intern' (keep 'admin'; 'student' retained for legacy)
-- ---------------------------------------------------------------------------
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'intern';

UPDATE public.user_roles SET role = 'intern' WHERE role = 'student';

-- ---------------------------------------------------------------------------
-- 2. PROFILES — ensure full column set required by the app
--    (id references auth.users.id; user_id mirrors it for clarity)
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS internship_id uuid,
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS selected_domain text,
  ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'intern',
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT true;

UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;
UPDATE public.profiles SET role = 'intern' WHERE role IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- ---------------------------------------------------------------------------
-- 3. INTERNSHIP CODE — sequential per year, e.g. YRN202600001, never duplicated
-- ---------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.internship_code_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.generate_internship_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_year text := to_char(now(), 'YYYY');
  v_code text;
BEGIN
  v_code := 'YRN' || v_year || lpad(nextval('public.internship_code_seq')::text, 5, '0');
  IF EXISTS (SELECT 1 FROM public.internships WHERE internship_code = v_code) THEN
    LOOP
      v_code := 'YRN' || v_year || lpad(nextval('public.internship_code_seq')::text, 5, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.internships WHERE internship_code = v_code);
    END LOOP;
  END IF;
  NEW.internship_code := v_code;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tr_generate_internship_code ON public.internships;
CREATE OR REPLACE TRIGGER tr_generate_internship_code
  BEFORE INSERT ON public.internships
  FOR EACH ROW EXECUTE FUNCTION public.generate_internship_code();

ALTER TABLE public.internships ALTER COLUMN internship_code DROP DEFAULT;
ALTER TABLE public.internships ALTER COLUMN internship_code SET NOT NULL;

-- ---------------------------------------------------------------------------
-- 4. AUTO-CONFIRM EMAILS — trigger + retroactively confirm existing users
--    This makes registration -> auto-login work without email verification.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_confirm_student_emails()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
  NEW.confirmed_at := COALESCE(NEW.confirmed_at, now());
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tr_auto_confirm_emails ON auth.users;
CREATE OR REPLACE TRIGGER tr_auto_confirm_emails
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_student_emails();

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- ---------------------------------------------------------------------------
-- 5. handle_new_user — NO hardcoded emails. Role comes from user_metadata
--    ('role'), defaulting to 'intern'. Creates profile + role + internship.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.app_role;
  v_domain uuid;
  v_duration text;
  v_internship_id uuid;
BEGIN
  v_role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role','')::public.app_role, 'intern');
  IF v_role IS NULL THEN v_role := 'intern'; END IF;

  INSERT INTO public.profiles (
    id, user_id, email, full_name, phone, college, department, year,
    avatar_url, must_change_password, role, duration, selected_domain
  )
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'college',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'year',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false),
    v_role,
    COALESCE(NEW.raw_user_meta_data->>'duration', '1 Month'),
    NULLIF(NEW.raw_user_meta_data->>'domain_id','')::uuid::text
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

  v_domain := NULLIF(NEW.raw_user_meta_data->>'domain_id','')::uuid;
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

-- ---------------------------------------------------------------------------
-- 6. has_role — strictly from user_roles (no email shortcuts)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- ---------------------------------------------------------------------------
-- 7. promote_to_admin — bootstrap RPC. Works only while NO admin exists yet,
--    or when called by an existing admin. No credentials hardcoded anywhere.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.promote_to_admin(p_email text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') OR
     EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
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

-- Safe to expose: the function only promotes when NO admin exists yet (bootstrap),
-- or when the caller is already an admin. Not callable by anon.
REVOKE ALL ON FUNCTION public.promote_to_admin(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(text) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 8. RLS — ensure user_roles self-insert on signup path works
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users insert own role on signup" ON public.user_roles;
CREATE POLICY "Users insert own role on signup" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'intern');

DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

COMMIT;
