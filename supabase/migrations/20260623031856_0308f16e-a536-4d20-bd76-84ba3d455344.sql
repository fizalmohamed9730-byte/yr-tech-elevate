
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_domain uuid;
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
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');

  v_domain := NULLIF(NEW.raw_user_meta_data->>'domain_id','')::uuid;
  IF v_domain IS NOT NULL THEN
    INSERT INTO public.internships (student_id, domain_id) VALUES (NEW.id, v_domain)
    ON CONFLICT (student_id) DO NOTHING;
  END IF;

  RETURN NEW;
END $$;
