-- FIX: "Database error saving new user" on new intern registration
-- Root cause: handle_new_user() trigger references columns that may not exist in production.
-- This migration is 100% IDEMPOTENT — safe to run on any database state.
-- Apply this in Supabase SQL Editor to fix registration immediately.

-- 1. Ensure all columns that handle_new_user() needs exist in profiles (idempotent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS discovery_source text,
  ADD COLUMN IF NOT EXISTS discovery_other text,
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS internship_id uuid,
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS selected_domain text,
  ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'intern',
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS college text,
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS year text;

COMMENT ON COLUMN public.profiles.country IS 'Country selected during registration';
COMMENT ON COLUMN public.profiles.discovery_source IS 'How the user heard about YR NOVATECH';
COMMENT ON COLUMN public.profiles.discovery_other IS 'Free-text when discovery_source is Other';

-- Backfill user_id for any rows missing it
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;

-- 2. Ensure all columns that handle_new_user() needs exist in internships (idempotent)
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS duration text NOT NULL DEFAULT '1 Month',
  ADD COLUMN IF NOT EXISTS certificate_flow_version text NOT NULL DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS offer_letter_code text,
  ADD COLUMN IF NOT EXISTS offer_issued_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_code text,
  ADD COLUMN IF NOT EXISTS certificate_issued_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_released_by uuid,
  ADD COLUMN IF NOT EXISTS certificate_released_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS certificate_revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_revoked_by uuid,
  ADD COLUMN IF NOT EXISTS certificate_revoke_reason text;

DO $$ BEGIN
  ALTER TABLE public.internships
    ADD CONSTRAINT internships_certificate_flow_version_check
    CHECK (certificate_flow_version IN ('legacy', 'payment_v1'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Ensure the app_role enum has 'intern' value
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'intern';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Ensure the internship_status enum has 'active' value
DO $$ BEGIN
  ALTER TYPE public.internship_status ADD VALUE IF NOT EXISTS 'active';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Replace handle_new_user() with the definitive version.
--    This version is SAFE for any schema state:
--    - Uses string comparison for role (no enum cast that could fail)
--    - Uses regex UUID validation (no bare ::uuid cast that could throw)
--    - Includes all columns from the latest unified migration
--    - Falls back gracefully for any missing data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.app_role;
  v_domain uuid;
  v_duration text;
  v_internship_id uuid;
BEGIN
  -- Determine role: string comparison avoids enum cast errors
  IF COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), 'intern') = 'admin' THEN
    v_role := 'admin';
  ELSE
    v_role := 'intern';
  END IF;

  -- Insert or update profile with all known columns
  INSERT INTO public.profiles (
    id, user_id, email, full_name, phone, college, department, year,
    avatar_url, must_change_password, role, duration, selected_domain,
    country, discovery_source, discovery_other
  )
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'phone',''),
    NULLIF(NEW.raw_user_meta_data->>'college',''),
    NULLIF(NEW.raw_user_meta_data->>'department',''),
    NULLIF(NEW.raw_user_meta_data->>'year',''),
    NULLIF(NEW.raw_user_meta_data->>'avatar_url',''),
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false),
    v_role,
    COALESCE(NEW.raw_user_meta_data->>'duration', '1 Month'),
    NULLIF(NEW.raw_user_meta_data->>'domain_id',''),
    NULLIF(NEW.raw_user_meta_data->>'country',''),
    NULLIF(NEW.raw_user_meta_data->>'discovery_source',''),
    NULLIF(NEW.raw_user_meta_data->>'discovery_other','')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    college = COALESCE(EXCLUDED.college, public.profiles.college),
    department = COALESCE(EXCLUDED.department, public.profiles.department),
    year = COALESCE(EXCLUDED.year, public.profiles.year),
    role = EXCLUDED.role,
    country = COALESCE(EXCLUDED.country, public.profiles.country),
    discovery_source = COALESCE(EXCLUDED.discovery_source, public.profiles.discovery_source),
    discovery_other = COALESCE(EXCLUDED.discovery_other, public.profiles.discovery_other);

  -- Assign role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Safely parse domain_id (regex guard prevents UUID cast errors)
  v_domain := NULL;
  IF NEW.raw_user_meta_data->>'domain_id'
     ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    v_domain := (NEW.raw_user_meta_data->>'domain_id')::uuid;
  END IF;

  v_duration := COALESCE(NEW.raw_user_meta_data->>'duration', '1 Month');

  -- Create internship if domain is valid and user is an intern
  IF v_domain IS NOT NULL AND v_role = 'intern' THEN
    INSERT INTO public.internships (student_id, domain_id, duration, status, certificate_flow_version)
    VALUES (NEW.id, v_domain, v_duration, 'active', 'payment_v1')
    ON CONFLICT (student_id) DO NOTHING
    RETURNING id INTO v_internship_id;

    UPDATE public.profiles
    SET internship_id = COALESCE(v_internship_id, internship_id)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END $$;

-- 6. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Refresh PostgREST schema cache so the API sees all columns immediately
NOTIFY pgrst, 'reload schema';
