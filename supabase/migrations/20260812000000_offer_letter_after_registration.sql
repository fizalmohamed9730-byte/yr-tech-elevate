-- ============================================================================
-- Fix: offer letter not generated after registration + missing storage buckets
-- 1) Ensure the offer-letters / resumes storage buckets exist.
-- 2) Let interns upload/update their own offer-letter file so it can be
--    generated automatically right after registration (from the client).
-- 3) Issue offer_letter_code on INSERT (not only on UPDATE to 'active') so a
--    newly registered intern immediately gets an offer code.
-- 4) Create internships as 'active' on signup so the offer letter is issued at
--    registration time, matching the existing auto-approve design.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Storage buckets (idempotent)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('offer-letters', 'offer-letters', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', false)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Storage RLS for offer-letters
-- ---------------------------------------------------------------------------
-- Admins: full access (existing migration may not have been applied).
DROP POLICY IF EXISTS "Admins manage offer letters storage" ON storage.objects;
CREATE POLICY "Admins manage offer letters storage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'offer-letters' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'offer-letters' AND public.has_role(auth.uid(), 'admin'));

-- Interns/Students: read (and download) their own offer letter.
DROP POLICY IF EXISTS "Interns read own offer letter storage" ON storage.objects;
CREATE POLICY "Interns read own offer letter storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'offer-letters' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Interns/Students: may upload/update their own offer-letter file so the app
-- can generate and store it as soon as they register.
DROP POLICY IF EXISTS "Interns upload own offer letter storage" ON storage.objects;
CREATE POLICY "Interns upload own offer letter storage" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'offer-letters' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Interns update own offer letter storage" ON storage.objects;
CREATE POLICY "Interns update own offer letter storage" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'offer-letters' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- 3. Issue offer letter code on INSERT as well as on UPDATE to 'active'
-- ---------------------------------------------------------------------------
-- Ensure the backing function exists (idempotent; APPLY_ALL defines it too).
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
CREATE TRIGGER internships_issue_offer
  BEFORE INSERT OR UPDATE ON public.internships
  FOR EACH ROW EXECUTE FUNCTION public.issue_offer_letter();

-- Students may update their own internship (status auto-activation + offer
-- code persistence from the client-side apply flow). This only lets the
-- student touch their own row.
DROP POLICY IF EXISTS "Students update own internship" ON public.internships;
CREATE POLICY "Students update own internship" ON public.internships
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. Auto-activate new interns so the offer letter is generated at
--    registration (keeps the internal "student" role for signup users).
--    Mirrors the latest handle_new_user from 20260702000000 but inserts the
--    internship with status 'active'.
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
    INSERT INTO public.internships (student_id, domain_id, duration, status)
    VALUES (NEW.id, v_domain, v_duration, 'active')
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
-- 5. Backfill: issue offer codes to existing active internships that do not
--    have one yet (and ensure the unique-one-per-student constraint).
-- ---------------------------------------------------------------------------
UPDATE public.internships
SET offer_letter_code = 'YRN-OL-' || upper(substring(gen_random_uuid()::text, 1, 8)),
    offer_issued_at = now(),
    started_at = COALESCE(started_at, now())
WHERE status = 'active' AND offer_letter_code IS NULL;

-- Legacy internships created as 'pending' before auto-activation was
-- introduced (e.g. by older handle_new_user versions) get activated and
-- receive their offer code here, so existing users can download their offer
-- letter without needing admin approval.
UPDATE public.internships
SET status = 'active',
    started_at = COALESCE(started_at, now())
WHERE status = 'pending' AND offer_letter_code IS NULL;

COMMIT;