-- Add duration column to internships table
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS duration text NOT NULL DEFAULT '1 Month' CHECK (duration IN ('1 Month', '2 Months', '3 Months'));

-- Update handle_new_user trigger function to read duration from raw user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
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
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'intern');

  v_domain := NULLIF(NEW.raw_user_meta_data->>'domain_id','')::uuid;
  v_duration := COALESCE(NEW.raw_user_meta_data->>'duration', '1 Month');
  IF v_domain IS NOT NULL THEN
    INSERT INTO public.internships (student_id, domain_id, duration) VALUES (NEW.id, v_domain, v_duration)
    ON CONFLICT (student_id) DO NOTHING;
  END IF;

  RETURN NEW;
END $$;

-- Update recalc_internship_progress trigger function to dynamically calculate progress and completion based on duration tasks (1M: 3 tasks, 2M: 4 tasks, 3M: 5 tasks)
CREATE OR REPLACE FUNCTION public.recalc_internship_progress()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_iid uuid;
  v_approved int;
  v_duration text;
  v_required int;
BEGIN
  v_iid := COALESCE(NEW.internship_id, OLD.internship_id);
  
  -- Get count of approved tasks
  SELECT count(*) INTO v_approved FROM public.submissions WHERE internship_id = v_iid AND status = 'approved';
  
  -- Get internship duration to decide total tasks required
  SELECT duration INTO v_duration FROM public.internships WHERE id = v_iid;
  
  v_required := CASE 
    WHEN v_duration = '1 Month' THEN 3
    WHEN v_duration = '2 Months' THEN 4
    ELSE 5
  END;

  UPDATE public.internships
    SET progress_percent = LEAST(ROUND((v_approved::float / v_required::float) * 100), 100),
        status = CASE WHEN v_approved >= v_required THEN 'completed'::internship_status ELSE status END,
        completed_at = CASE WHEN v_approved >= v_required AND completed_at IS NULL THEN now() ELSE completed_at END,
        certificate_code = CASE WHEN v_approved >= 1 AND certificate_code IS NULL
          THEN 'YRN-CERT-' || upper(substring(gen_random_uuid()::text,1,8)) ELSE certificate_code END,
        certificate_issued_at = CASE WHEN v_approved >= 1 AND certificate_issued_at IS NULL THEN now() ELSE certificate_issued_at END
  WHERE id = v_iid;
  
  RETURN NEW;
END $$;
