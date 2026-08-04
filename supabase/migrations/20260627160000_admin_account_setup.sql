-- Update has_role to treat admin email as admin even without user_roles entry
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
    UNION ALL
    SELECT 1 FROM auth.users WHERE id = _user_id AND email = 'fizalyrtech@gmail.com' AND _role = 'admin'
  )
$$;

-- Update handle_new_user to detect admin email and assign admin role
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

-- RPC function to upgrade admin role for existing admin users (fallback)
CREATE OR REPLACE FUNCTION public.set_role_admin()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'fizalyrtech@gmail.com') THEN
    DELETE FROM public.user_roles WHERE user_id = auth.uid();
    INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  END IF;
END;
$$;
