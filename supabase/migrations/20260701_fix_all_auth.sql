-- ============================================================
-- FIX ALL AUTH ISSUES — Run this in Supabase Dashboard SQL Editor
-- https://supabase.com/dashboard/project/wthzrnzbctvixqorwpky/sql/new
-- ============================================================

-- 1. CONFIRM ALL EXISTING UNCONFIRMED USERS
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- 2. ENSURE EXISTING ADMIN HAS PROFILE + ROLE
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'S. FIZAL MOHAMED')
FROM auth.users WHERE email = 'fizalyrtech@gmail.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'fizalyrtech@gmail.com'
ON CONFLICT DO NOTHING;

-- 3. CREATE AUTO-CONFIRM TRIGGER (auto-confirms all future signups)
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

-- 4. UPDATE handle_new_user to detect admin email + create profile + role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.app_role;
  v_domain uuid;
  v_duration text;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, college, department, year, avatar_url, must_change_password)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'college',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'year',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, true)
  );

  IF NEW.email = 'fizalyrtech@gmail.com' THEN
    v_role := 'admin';
  ELSE
    v_role := 'intern';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role);

  v_domain := NULLIF(NEW.raw_user_meta_data->>'domain_id','')::uuid;
  v_duration := COALESCE(NEW.raw_user_meta_data->>'duration', '1 Month');
  IF v_domain IS NOT NULL AND v_role = 'intern' THEN
    INSERT INTO public.internships (student_id, domain_id, duration) VALUES (NEW.id, v_domain, v_duration)
    ON CONFLICT (student_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. UPDATE has_role to treat admin email as admin (enables RLS for admin)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
    UNION ALL
    SELECT 1 FROM auth.users WHERE id = _user_id AND email = 'fizalyrtech@gmail.com' AND _role = 'admin'
  )
$$;

-- 6. CREATE set_role_admin RPC for fallback
CREATE OR REPLACE FUNCTION public.set_role_admin()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'fizalyrtech@gmail.com') THEN
    DELETE FROM public.user_roles WHERE user_id = auth.uid();
    INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  END IF;
END;
$$;
