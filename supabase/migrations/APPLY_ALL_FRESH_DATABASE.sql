-- ============================================================================
-- YR NOVATECH INTERNSHIP PORTAL â€” COMPLETE DATABASE SETUP (single file)
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

DROP POLICY IF EXISTS "Students update own internship" ON public.internships;
CREATE POLICY "Students update own internship" ON public.internships
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE OR REPLACE FUNCTION public.protect_certificate_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF NEW.certificate_code IS DISTINCT FROM OLD.certificate_code THEN
      RAISE EXCEPTION 'Students cannot modify certificate_code';
    END IF;
    IF NEW.certificate_issued_at IS DISTINCT FROM OLD.certificate_issued_at THEN
      RAISE EXCEPTION 'Students cannot modify certificate_issued_at';
    END IF;
    IF NEW.certificate_released_by IS DISTINCT FROM OLD.certificate_released_by THEN
      RAISE EXCEPTION 'Students cannot modify certificate_released_by';
    END IF;
    IF NEW.certificate_released_at IS DISTINCT FROM OLD.certificate_released_at THEN
      RAISE EXCEPTION 'Students cannot modify certificate_released_at';
    END IF;
    IF NEW.certificate_status IS DISTINCT FROM OLD.certificate_status THEN
      RAISE EXCEPTION 'Students cannot modify certificate_status';
    END IF;
    IF NEW.certificate_revoked_at IS DISTINCT FROM OLD.certificate_revoked_at THEN
      RAISE EXCEPTION 'Students cannot modify certificate_revoked_at';
    END IF;
    IF NEW.certificate_revoked_by IS DISTINCT FROM OLD.certificate_revoked_by THEN
      RAISE EXCEPTION 'Students cannot modify certificate_revoked_by';
    END IF;
    IF NEW.certificate_revoke_reason IS DISTINCT FROM OLD.certificate_revoke_reason THEN
      RAISE EXCEPTION 'Students cannot modify certificate_revoke_reason';
    END IF;
    IF NEW.progress_percent IS DISTINCT FROM OLD.progress_percent THEN
      RAISE EXCEPTION 'Students cannot modify progress_percent';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS protect_certificate_fields ON public.internships;
CREATE TRIGGER protect_certificate_fields
  BEFORE UPDATE ON public.internships
  FOR EACH ROW EXECUTE FUNCTION public.protect_certificate_fields();

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
  ADD COLUMN IF NOT EXISTS certificate_resend_message_id text,
  ADD COLUMN IF NOT EXISTS certificate_released_by uuid,
  ADD COLUMN IF NOT EXISTS certificate_released_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_flow_version text NOT NULL DEFAULT 'legacy',
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

CREATE UNIQUE INDEX IF NOT EXISTS internships_one_per_student ON public.internships(student_id);

-- ------------------------- 9. submissions -------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  task_no int NOT NULL CHECK (task_no BETWEEN 1 AND 10),
  github_url text,
  project_url text,
  drive_url text,
  notes text,
  status text NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review','pending','approved','rejected','resubmit')),
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
  WITH CHECK (EXISTS (SELECT 1 FROM public.internships i WHERE i.id = internship_id AND i.student_id = auth.uid())
    AND status = 'pending_review');
DROP POLICY IF EXISTS "Students update own pending submissions" ON public.submissions;
CREATE POLICY "Students update own pending submissions" ON public.submissions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.internships i WHERE i.id = internship_id AND i.student_id = auth.uid())
         AND status IN ('resubmit', 'rejected'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.internships i WHERE i.id = internship_id AND i.student_id = auth.uid())
    AND status = 'pending_review');
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
  v_domain_slug text;
  v_required int;
BEGIN
  v_iid := COALESCE(NEW.internship_id, OLD.internship_id);
  SELECT count(*) INTO v_approved FROM public.submissions WHERE internship_id = v_iid AND status = 'approved';
  SELECT i.duration, d.slug INTO v_duration, v_domain_slug
    FROM public.internships i
    LEFT JOIN public.domains d ON d.id = i.domain_id
    WHERE i.id = v_iid;

  v_required := CASE
    WHEN v_domain_slug IN ('artificial-intelligence', 'full-stack') AND v_duration = '1 Month' THEN 5
    WHEN v_domain_slug IN ('artificial-intelligence', 'full-stack') AND v_duration = '2 Months' THEN 7
    WHEN v_domain_slug IN ('artificial-intelligence', 'full-stack') AND v_duration = '3 Months' THEN 10
    WHEN v_duration = '1 Month' THEN 3
    WHEN v_duration = '2 Months' THEN 4
    ELSE 5
  END;

  UPDATE public.internships
    SET progress_percent = LEAST(ROUND((v_approved::float / v_required::float) * 100), 100),
        status = CASE
          WHEN v_approved >= v_required AND status != 'completed' THEN 'completed'::public.internship_status
          ELSE status
        END,
        completed_at = CASE
          WHEN v_approved >= v_required AND completed_at IS NULL THEN now()
          ELSE completed_at
        END
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

CREATE OR REPLACE FUNCTION public.issue_certificate(p_internship_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
  v_domain_slug text;
  v_approved int;
  v_required int;
  v_code text;
BEGIN
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can issue certificates';
  END IF;

  SELECT i.*, d.slug AS domain_slug INTO v_internship
    FROM public.internships i
    LEFT JOIN public.domains d ON d.id = i.domain_id
    WHERE i.id = p_internship_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Internship not found';
  END IF;

  IF v_internship.certificate_code IS NOT NULL AND v_internship.certificate_status = 'issued' THEN
    RETURN jsonb_build_object('error', 'Certificate already issued: ' || v_internship.certificate_code);
  END IF;

  SELECT count(*) INTO v_approved
    FROM public.submissions
    WHERE internship_id = p_internship_id AND status = 'approved';

  v_required := CASE
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '1 Month' THEN 5
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '2 Months' THEN 7
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '3 Months' THEN 10
    WHEN v_internship.duration = '1 Month' THEN 3
    WHEN v_internship.duration = '2 Months' THEN 4
    ELSE 5
  END;

  IF v_approved < v_required THEN
    RAISE EXCEPTION 'Cannot issue certificate: % of % required tasks approved', v_approved, v_required;
  END IF;

  IF v_internship.certificate_flow_version = 'payment_v1' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.certificate_payments
      WHERE internship_id = p_internship_id AND status = 'paid'
    ) THEN
      RETURN jsonb_build_object('error', 'Certificate payment not verified');
    END IF;
  END IF;

  v_code := 'YRNT-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8));

  UPDATE public.internships
    SET certificate_code     = v_code,
        certificate_issued_at = now(),
        certificate_released_by = v_admin_id,
        certificate_released_at = now(),
        certificate_status    = 'issued'
  WHERE id = p_internship_id;

  INSERT INTO public.certificate_audit_log (internship_id, action, admin_id, old_certificate_code, new_certificate_code, reason)
  VALUES (p_internship_id, 'issued', v_admin_id, v_internship.certificate_code, v_code, 'Initial issue');

  RETURN jsonb_build_object(
    'success', true,
    'certificate_code', v_code,
    'issued_at', now()::text,
    'released_by', v_admin_id::text
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.issue_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_certificate(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.revoke_certificate(p_internship_id uuid, p_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
BEGIN
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can revoke certificates';
  END IF;
  IF p_reason IS NULL OR trim(p_reason) = '' THEN
    RAISE EXCEPTION 'Revocation reason is required';
  END IF;
  SELECT * INTO v_internship FROM public.internships WHERE id = p_internship_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Internship not found';
  END IF;
  IF v_internship.certificate_status != 'issued' THEN
    RETURN jsonb_build_object('error', 'Certificate is not in issued status (current: ' || v_internship.certificate_status || ')');
  END IF;
  UPDATE public.internships
    SET certificate_status    = 'revoked',
        certificate_revoked_at  = now(),
        certificate_revoked_by  = v_admin_id,
        certificate_revoke_reason = trim(p_reason),
        certificate_code       = NULL,
        certificate_issued_at  = NULL,
        certificate_released_by = NULL,
        certificate_released_at = NULL
  WHERE id = p_internship_id;
  INSERT INTO public.certificate_audit_log (internship_id, action, admin_id, old_certificate_code, new_certificate_code, reason)
  VALUES (p_internship_id, 'revoked', v_admin_id, v_internship.certificate_code, NULL, trim(p_reason));
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Certificate revoked',
    'revoked_at', now()::text,
    'revoked_by', v_admin_id::text,
    'reason', trim(p_reason)
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.revoke_certificate(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_certificate(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.reissue_certificate(p_internship_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
  v_domain_slug text;
  v_approved int;
  v_required int;
  v_code text;
BEGIN
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can reissue certificates';
  END IF;

  SELECT i.*, d.slug AS domain_slug INTO v_internship
    FROM public.internships i
    LEFT JOIN public.domains d ON d.id = i.domain_id
    WHERE i.id = p_internship_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Internship not found';
  END IF;
  IF v_internship.certificate_status != 'revoked' THEN
    RETURN jsonb_build_object('error', 'Certificate is not in revoked status (current: ' || v_internship.certificate_status || ')');
  END IF;

  SELECT count(*) INTO v_approved
    FROM public.submissions
    WHERE internship_id = p_internship_id AND status = 'approved';

  v_required := CASE
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '1 Month' THEN 5
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '2 Months' THEN 7
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '3 Months' THEN 10
    WHEN v_internship.duration = '1 Month' THEN 3
    WHEN v_internship.duration = '2 Months' THEN 4
    ELSE 5
  END;

  IF v_approved < v_required THEN
    RAISE EXCEPTION 'Cannot reissue: only % of % required tasks are approved', v_approved, v_required;
  END IF;

  IF v_internship.certificate_flow_version = 'payment_v1' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.certificate_payments
      WHERE internship_id = p_internship_id AND status = 'paid'
    ) THEN
      RETURN jsonb_build_object('error', 'Certificate payment not verified');
    END IF;
  END IF;

  v_code := 'YRNT-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8));

  UPDATE public.internships
    SET certificate_code     = v_code,
        certificate_issued_at = now(),
        certificate_released_by = v_admin_id,
        certificate_released_at = now(),
        certificate_status    = 'issued',
        certificate_revoked_at  = NULL,
        certificate_revoked_by  = NULL,
        certificate_revoke_reason = NULL
  WHERE id = p_internship_id;

  INSERT INTO public.certificate_audit_log (internship_id, action, admin_id, old_certificate_code, new_certificate_code, reason)
  VALUES (p_internship_id, 'reissued', v_admin_id, NULL, v_code, 'Re-issued after revocation');

  RETURN jsonb_build_object(
    'success', true,
    'certificate_code', v_code,
    'issued_at', now()::text,
    'released_by', v_admin_id::text
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.reissue_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reissue_certificate(uuid) TO authenticated;

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
    INSERT INTO public.internships (student_id, domain_id, duration, certificate_flow_version)
    VALUES (NEW.id, v_domain, v_duration, 'payment_v1')
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
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback (status);
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
DROP POLICY IF EXISTS "Public read approved feedback" ON public.feedback;
CREATE POLICY "Public read approved feedback" ON public.feedback
  FOR SELECT TO anon
  USING (status = 'approved');
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
REVOKE EXECUTE ON FUNCTION public.issue_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_certificate(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.revoke_certificate(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_certificate(uuid, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.reissue_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reissue_certificate(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_internship_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_confirm_student_emails() FROM PUBLIC, anon, authenticated;

-- ------------------------- 19. Certificate payments table -------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read app settings" ON public.app_settings;
CREATE POLICY "Anyone can read app settings" ON public.app_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage app settings" ON public.app_settings;
CREATE POLICY "Admins manage app settings" ON public.app_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_settings (key, value) VALUES ('certificate_fee', to_jsonb(99))
  ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.certificate_payments (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id         uuid NOT NULL UNIQUE REFERENCES public.internships(id) ON DELETE CASCADE,
  amount                numeric NOT NULL,
  currency              text NOT NULL DEFAULT 'INR',
  upi_id                text NOT NULL DEFAULT 'fizalabbas@sbi',
  transaction_id        text NOT NULL,
  payment_screenshot_url text,
  status                text NOT NULL DEFAULT 'pending_verification'
                          CHECK (status IN ('pending_verification', 'paid', 'rejected', 'refunded')),
  submitted_at          timestamptz NOT NULL DEFAULT now(),
  paid_at               timestamptz,
  verified_at           timestamptz,
  verified_by           uuid REFERENCES auth.users(id),
  rejection_reason      text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_certificate_payments_internship ON public.certificate_payments (internship_id);
ALTER TABLE public.certificate_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own payments" ON public.certificate_payments;
CREATE POLICY "Students view own payments" ON public.certificate_payments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.internships i WHERE i.id = certificate_payments.internship_id AND i.student_id = auth.uid()));
DROP POLICY IF EXISTS "Students submit own payments" ON public.certificate_payments;
CREATE POLICY "Students submit own payments" ON public.certificate_payments
  FOR INSERT TO authenticated
  WITH CHECK (status = 'pending_verification' AND EXISTS (SELECT 1 FROM public.internships i WHERE i.id = certificate_payments.internship_id AND i.student_id = auth.uid()));
DROP POLICY IF EXISTS "Students retry own rejected payments" ON public.certificate_payments;
CREATE POLICY "Students retry own rejected payments" ON public.certificate_payments
  FOR UPDATE TO authenticated
  USING (status = 'rejected' AND EXISTS (SELECT 1 FROM public.internships i WHERE i.id = certificate_payments.internship_id AND i.student_id = auth.uid()))
  WITH CHECK (status = 'pending_verification' AND EXISTS (SELECT 1 FROM public.internships i WHERE i.id = certificate_payments.internship_id AND i.student_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage certificate payments" ON public.certificate_payments;
CREATE POLICY "Admins manage certificate payments" ON public.certificate_payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS certificate_payments_set_updated_at ON public.certificate_payments;
CREATE TRIGGER certificate_payments_set_updated_at
  BEFORE UPDATE ON public.certificate_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------- 20. Certificate audit log -------------------------
CREATE TABLE IF NOT EXISTS public.certificate_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  action text NOT NULL,
  admin_id uuid NOT NULL,
  old_certificate_code text,
  new_certificate_code text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_certificate_audit_log_internship ON public.certificate_audit_log (internship_id);
ALTER TABLE public.certificate_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read certificate audit log" ON public.certificate_audit_log;
CREATE POLICY "Admins read certificate audit log" ON public.certificate_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Service inserts certificate audit log" ON public.certificate_audit_log;
CREATE POLICY "Service inserts certificate audit log" ON public.certificate_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';

-- =============================================================================
-- 21. SEPTEMBER 2026 CERTIFICATE PAYMENT EXEMPTION + PAYMENT HARDENING
--      Mirrors 20261005000000_september_2026_certificate_exemption.sql
-- =============================================================================
-- =============================================================================
-- SEPTEMBER 2026 CERTIFICATE PAYMENT EXEMPTION + PAYMENT HARDENING
-- DATE: 2026-10-05
-- =============================================================================
-- ROOT CAUSES:
--   1. issue_certificate() / reissue_certificate() gate certificate release on a
--      paid certificate_payments row whenever certificate_flow_version =
--      'payment_v1'. handle_new_user() assigns 'payment_v1' to EVERY new intern,
--      so interns who registered during September 2026 are blocked from getting
--      their certificate unless they pay.
--   2. The exemption cannot be derived from certificate_flow_version: it must be
--      a RUNTIME check of the real registration timestamp
--      (profiles.created_at), so no mass data update is required and future
--      registrations are handled automatically.
--   3. app_settings.certificate_fee was seeded as 99 while the product fee is
--      100, so the dashboard could display a different amount than expected.
--   4. Students could INSERT any amount / upi_id / status they liked, because
--      the INSERT RLS policy only constrained status and ownership.
--   5. reissue_certificate() still hardcoded required tasks as 3/4/5 by
--      duration, ignoring the domain-aware 5/7/10 counts, so reissue was
--      stricter/looser than issue for AI & FullStack internships.
--
-- FIXES:
--   1. Single source of truth helper is_september_2026_certificate_exempt().
--   2. issue_certificate() and reissue_certificate() skip the payment gate for
--      exempt internships (task approval + admin release still required).
--   3. certificate_fee default corrected 99 -> 100 (only when still stale).
--   4. New BEFORE INSERT/UPDATE trigger locks amount/currency/upi_id/status for
--      non-admin actors and blocks payment rows for exempt internships.
--   5. reissue_certificate() now uses the shared domain-aware task count helper.
--
-- SAFETY:
--   - Purely additive + CREATE OR REPLACE. Idempotent.
--   - NO existing certificate_payments rows, internships, or profiles are
--     modified or deleted. No mass UPDATE of user data.
--   - Exempt users keep working certificates through the normal admin flow; only
--     the payment requirement is bypassed.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. September 2026 exemption helper (single source of truth)
--    Registration timestamp = profiles.created_at (written by the
--    on_auth_user_created / handle_new_user() trigger at signup).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_september_2026_certificate_exempt(p_internship_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT (
      p.created_at >= TIMESTAMPTZ '2026-09-01 00:00:00+00'
      AND p.created_at <  TIMESTAMPTZ '2026-10-01 00:00:00+00'
    )
    FROM public.internships i
    JOIN public.profiles p ON p.id = i.student_id
    WHERE i.id = p_internship_id
  ), false);
$$;

REVOKE EXECUTE ON FUNCTION public.is_september_2026_certificate_exempt(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_september_2026_certificate_exempt(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 2. Domain-aware required task count helper (shared by issue + reissue)
--    AI / FullStack: 1M=5, 2M=7, 3M=10
--    Other domains : 1M=3, 2M=4, 3M=5
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.certificate_required_task_count(p_domain_slug text, p_duration text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_domain_slug IN ('artificial-intelligence', 'full-stack') AND p_duration = '1 Month' THEN 5
    WHEN p_domain_slug IN ('artificial-intelligence', 'full-stack') AND p_duration = '2 Months' THEN 7
    WHEN p_domain_slug IN ('artificial-intelligence', 'full-stack') AND p_duration = '3 Months' THEN 10
    WHEN p_duration = '1 Month' THEN 3
    WHEN p_duration = '2 Months' THEN 4
    ELSE 5
  END;
$$;

REVOKE EXECUTE ON FUNCTION public.certificate_required_task_count(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.certificate_required_task_count(text, text) TO authenticated;

-- -----------------------------------------------------------------------------
-- 3. Correct stale default fee 99 -> 100
--    Only updates the row while it still holds the stale seeded value, so a
--    fee an admin customised through app_settings is never overwritten.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_current numeric;
BEGIN
  SELECT (value #>> '{}')::numeric INTO v_current
    FROM public.app_settings WHERE key = 'certificate_fee';

  IF v_current IS NULL THEN
    INSERT INTO public.app_settings (key, value) VALUES ('certificate_fee', to_jsonb(100))
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  ELSIF v_current = 99 THEN
    UPDATE public.app_settings
      SET value = to_jsonb(100), updated_at = now()
      WHERE key = 'certificate_fee';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. Payment row guard
--    - Exempt internships can never have a payment row created by a student.
--    - Non-admin actors cannot choose amount / currency / upi_id / status;
--      these are always taken from the server-side configuration.
--    - Trusted server contexts (auth.uid() IS NULL, e.g. service_role /
--      SQL editor / migrations) are left untouched.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.certificate_payments_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_fee numeric;
  v_actor_is_admin boolean := false;
BEGIN
  -- Trusted server-side context: do not rewrite anything.
  IF v_actor IS NULL THEN
    RETURN NEW;
  END IF;

  v_actor_is_admin := COALESCE(public.has_role(v_actor, 'admin'), false);

  IF NOT v_actor_is_admin THEN
    IF public.is_september_2026_certificate_exempt(NEW.internship_id) THEN
      RAISE EXCEPTION
        'September 2026 registered interns are exempt from the certificate payment and cannot submit one.'
        USING ERRCODE = 'check_violation';
    END IF;

    -- Server-side configuration is authoritative.
    SELECT COALESCE((value #>> '{}')::numeric, 100) INTO v_fee
      FROM public.app_settings WHERE key = 'certificate_fee';

    NEW.amount   := COALESCE(v_fee, 100);
    NEW.currency := 'INR';
    NEW.upi_id   := 'fizalabbas@sbi';

    IF TG_OP = 'INSERT' THEN
      NEW.status       := 'pending_verification';
      NEW.submitted_at := now();
    ELSE
      -- Students may only move a rejected payment back into verification.
      IF NEW.status IS DISTINCT FROM 'pending_verification' THEN
        RAISE EXCEPTION 'Students cannot set payment status to %', NEW.status
          USING ERRCODE = 'insufficient_privilege';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS certificate_payments_guard ON public.certificate_payments;
CREATE TRIGGER certificate_payments_guard
  BEFORE INSERT OR UPDATE ON public.certificate_payments
  FOR EACH ROW EXECUTE FUNCTION public.certificate_payments_guard();

-- -----------------------------------------------------------------------------
-- 5. issue_certificate() - exempt batch bypasses the payment gate
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.issue_certificate(p_internship_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
  v_approved int;
  v_required int;
  v_code text;
BEGIN
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can issue certificates';
  END IF;

  SELECT i.*, d.slug AS domain_slug INTO v_internship
    FROM public.internships i
    LEFT JOIN public.domains d ON d.id = i.domain_id
    WHERE i.id = p_internship_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Internship not found';
  END IF;

  IF v_internship.certificate_code IS NOT NULL AND v_internship.certificate_status = 'issued' THEN
    RETURN jsonb_build_object('error', 'Certificate already issued: ' || v_internship.certificate_code);
  END IF;

  SELECT count(*) INTO v_approved
    FROM public.submissions
    WHERE internship_id = p_internship_id AND status = 'approved';

  v_required := public.certificate_required_task_count(v_internship.domain_slug, v_internship.duration);
  IF v_approved < v_required THEN
    RAISE EXCEPTION 'Cannot issue certificate: % of % required tasks approved', v_approved, v_required;
  END IF;

  -- Payment gate: applies to payment_v1 EXCEPT the September 2026 batch.
  IF v_internship.certificate_flow_version = 'payment_v1'
     AND NOT public.is_september_2026_certificate_exempt(p_internship_id) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.certificate_payments
      WHERE internship_id = p_internship_id AND status = 'paid'
    ) THEN
      RETURN jsonb_build_object('error', 'Certificate payment not verified');
    END IF;
  END IF;

  v_code := 'YRNT-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8));

  UPDATE public.internships
    SET certificate_code     = v_code,
        certificate_issued_at = now(),
        certificate_released_by = v_admin_id,
        certificate_released_at = now(),
        certificate_status    = 'issued'
  WHERE id = p_internship_id;

  INSERT INTO public.certificate_audit_log (internship_id, action, admin_id, old_certificate_code, new_certificate_code, reason)
  VALUES (p_internship_id, 'issued', v_admin_id, v_internship.certificate_code, v_code,
          CASE WHEN public.is_september_2026_certificate_exempt(p_internship_id)
               THEN 'Initial issue (September 2026 batch - payment exempt)'
               ELSE 'Initial issue' END);

  RETURN jsonb_build_object(
    'success', true,
    'certificate_code', v_code,
    'issued_at', now()::text,
    'released_by', v_admin_id::text
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.issue_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_certificate(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 6. reissue_certificate() - exempt batch bypasses the payment gate,
--    and required task count is now domain-aware (was hardcoded 3/4/5).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reissue_certificate(p_internship_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
  v_approved int;
  v_required int;
  v_code text;
BEGIN
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can reissue certificates';
  END IF;

  SELECT i.*, d.slug AS domain_slug INTO v_internship
    FROM public.internships i
    LEFT JOIN public.domains d ON d.id = i.domain_id
    WHERE i.id = p_internship_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Internship not found';
  END IF;

  IF v_internship.certificate_status <> 'revoked' THEN
    RETURN jsonb_build_object('error', 'Certificate is not in revoked status (current: ' || v_internship.certificate_status || ')');
  END IF;

  SELECT count(*) INTO v_approved
    FROM public.submissions
    WHERE internship_id = p_internship_id AND status = 'approved';

  v_required := public.certificate_required_task_count(v_internship.domain_slug, v_internship.duration);
  IF v_approved < v_required THEN
    RAISE EXCEPTION 'Cannot reissue: only % of % required tasks are approved', v_approved, v_required;
  END IF;

  IF v_internship.certificate_flow_version = 'payment_v1'
     AND NOT public.is_september_2026_certificate_exempt(p_internship_id) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.certificate_payments
      WHERE internship_id = p_internship_id AND status = 'paid'
    ) THEN
      RETURN jsonb_build_object('error', 'Certificate payment not verified');
    END IF;
  END IF;

  v_code := 'YRNT-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8));

  UPDATE public.internships
    SET certificate_code     = v_code,
        certificate_issued_at = now(),
        certificate_released_by = v_admin_id,
        certificate_released_at = now(),
        certificate_status    = 'issued',
        certificate_revoked_at  = NULL,
        certificate_revoked_by  = NULL,
        certificate_revoke_reason = NULL
  WHERE id = p_internship_id;

  INSERT INTO public.certificate_audit_log (internship_id, action, admin_id, old_certificate_code, new_certificate_code, reason)
  VALUES (p_internship_id, 'reissued', v_admin_id, NULL, v_code, 'Re-issued after revocation');

  RETURN jsonb_build_object(
    'success', true,
    'certificate_code', v_code,
    'issued_at', now()::text,
    'released_by', v_admin_id::text
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.reissue_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reissue_certificate(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 7. Recalculate progress using the shared domain-aware helper
--    (identical values to the previous inline CASE, now single-sourced)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recalc_internship_progress()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_iid uuid;
  v_approved int;
  v_duration text;
  v_domain_slug text;
  v_required int;
BEGIN
  v_iid := COALESCE(NEW.internship_id, OLD.internship_id);

  SELECT count(*) INTO v_approved
    FROM public.submissions WHERE internship_id = v_iid AND status = 'approved';

  SELECT i.duration, d.slug INTO v_duration, v_domain_slug
    FROM public.internships i
    LEFT JOIN public.domains d ON d.id = i.domain_id
    WHERE i.id = v_iid;

  v_required := public.certificate_required_task_count(v_domain_slug, v_duration);

  UPDATE public.internships
    SET progress_percent = LEAST(ROUND((v_approved::float / v_required::float) * 100), 100),
        status = CASE
          WHEN v_approved >= v_required AND status <> 'completed'
            THEN 'completed'::public.internship_status
          ELSE status
        END,
        completed_at = CASE
          WHEN v_approved >= v_required AND completed_at IS NULL THEN now()
          ELSE completed_at
        END
    WHERE id = v_iid;
  RETURN NEW;
END $$;

-- -----------------------------------------------------------------------------
-- 8. Notify PostgREST to reload schema
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- =============================================================================
-- 22. REMOVE CERTIFICATE PAYMENT SYSTEM
--      Mirrors 20261009000000_remove_certificate_payment_system.sql
-- =============================================================================
-- GOAL:
--   Make the internship certificate completely free for every intern and every
--   batch. Certificate release requires only approved required tasks + an admin
--   release. certificate_payments / app_settings / certificate_flow_version are
--   intentionally left in place, unused; no data is deleted or mass-modified.
-- =============================================================================

-- 1. Ensure certificate lifecycle columns exist (idempotent)
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS certificate_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS certificate_revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_revoked_by uuid,
  ADD COLUMN IF NOT EXISTS certificate_revoke_reason text;

UPDATE public.internships
SET certificate_status = 'issued'
WHERE certificate_code IS NOT NULL AND certificate_status = 'none';

-- 2. Ensure the certificate audit log exists (idempotent)
CREATE TABLE IF NOT EXISTS public.certificate_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  action text NOT NULL,
  admin_id uuid NOT NULL,
  old_certificate_code text,
  new_certificate_code text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificate_audit_log_internship
  ON public.certificate_audit_log(internship_id);

ALTER TABLE public.certificate_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read certificate audit log" ON public.certificate_audit_log;
CREATE POLICY "Admins read certificate audit log" ON public.certificate_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Service inserts certificate audit log" ON public.certificate_audit_log;
CREATE POLICY "Service inserts certificate audit log" ON public.certificate_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 3. Remove the payment guard (trigger + function) if present
DO $$
BEGIN
  IF to_regclass('public.certificate_payments') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS certificate_payments_guard ON public.certificate_payments;
  END IF;
END $$;
DROP FUNCTION IF EXISTS public.certificate_payments_guard();

-- 4. handle_new_user(): never assign a payment flow to new interns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.app_role;
  v_domain uuid;
  v_duration text;
  v_internship_id uuid;
BEGIN
  IF COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), 'intern') = 'admin' THEN
    v_role := 'admin';
  ELSE
    v_role := 'intern';
  END IF;

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

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  v_domain := NULL;
  IF NEW.raw_user_meta_data->>'domain_id'
     ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    v_domain := (NEW.raw_user_meta_data->>'domain_id')::uuid;
  END IF;

  v_duration := COALESCE(NEW.raw_user_meta_data->>'duration', '1 Month');

  -- certificate_flow_version is intentionally NOT written anymore.
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

-- 5. issue_certificate(): admin-only, domain-aware, NO payment gate
CREATE OR REPLACE FUNCTION public.issue_certificate(p_internship_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
  v_approved int;
  v_required int;
  v_code text;
BEGIN
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can issue certificates';
  END IF;

  SELECT i.*, d.slug AS domain_slug INTO v_internship
    FROM public.internships i
    LEFT JOIN public.domains d ON d.id = i.domain_id
    WHERE i.id = p_internship_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Internship not found';
  END IF;

  IF v_internship.certificate_code IS NOT NULL AND v_internship.certificate_status = 'issued' THEN
    RETURN jsonb_build_object('error', 'Certificate already issued: ' || v_internship.certificate_code);
  END IF;

  SELECT count(*) INTO v_approved
    FROM public.submissions
    WHERE internship_id = p_internship_id AND status = 'approved';

  v_required := CASE
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '1 Month' THEN 5
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '2 Months' THEN 7
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '3 Months' THEN 10
    WHEN v_internship.duration = '1 Month' THEN 3
    WHEN v_internship.duration = '2 Months' THEN 4
    ELSE 5
  END;

  IF v_approved < v_required THEN
    RAISE EXCEPTION 'Cannot issue certificate: % of % required tasks approved', v_approved, v_required;
  END IF;

  v_code := 'YRNT-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8));

  UPDATE public.internships
    SET certificate_code     = v_code,
        certificate_issued_at = now(),
        certificate_released_by = v_admin_id,
        certificate_released_at = now(),
        certificate_status    = 'issued'
  WHERE id = p_internship_id;

  INSERT INTO public.certificate_audit_log (internship_id, action, admin_id, old_certificate_code, new_certificate_code, reason)
  VALUES (p_internship_id, 'issued', v_admin_id, v_internship.certificate_code, v_code, 'Initial issue');

  RETURN jsonb_build_object(
    'success', true,
    'certificate_code', v_code,
    'issued_at', now()::text,
    'released_by', v_admin_id::text
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.issue_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_certificate(uuid) TO authenticated;

-- 6. reissue_certificate(): admin-only, domain-aware, NO payment gate
CREATE OR REPLACE FUNCTION public.reissue_certificate(p_internship_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
  v_approved int;
  v_required int;
  v_code text;
BEGIN
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can reissue certificates';
  END IF;

  SELECT i.*, d.slug AS domain_slug INTO v_internship
    FROM public.internships i
    LEFT JOIN public.domains d ON d.id = i.domain_id
    WHERE i.id = p_internship_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Internship not found';
  END IF;

  IF v_internship.certificate_status <> 'revoked' THEN
    RETURN jsonb_build_object('error', 'Certificate is not in revoked status (current: ' || v_internship.certificate_status || ')');
  END IF;

  SELECT count(*) INTO v_approved
    FROM public.submissions
    WHERE internship_id = p_internship_id AND status = 'approved';

  v_required := CASE
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '1 Month' THEN 5
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '2 Months' THEN 7
    WHEN v_internship.domain_slug IN ('artificial-intelligence', 'full-stack') AND v_internship.duration = '3 Months' THEN 10
    WHEN v_internship.duration = '1 Month' THEN 3
    WHEN v_internship.duration = '2 Months' THEN 4
    ELSE 5
  END;

  IF v_approved < v_required THEN
    RAISE EXCEPTION 'Cannot reissue: only % of % required tasks are approved', v_approved, v_required;
  END IF;

  v_code := 'YRNT-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8));

  UPDATE public.internships
    SET certificate_code     = v_code,
        certificate_issued_at = now(),
        certificate_released_by = v_admin_id,
        certificate_released_at = now(),
        certificate_status    = 'issued',
        certificate_revoked_at  = NULL,
        certificate_revoked_by  = NULL,
        certificate_revoke_reason = NULL
  WHERE id = p_internship_id;

  INSERT INTO public.certificate_audit_log (internship_id, action, admin_id, old_certificate_code, new_certificate_code, reason)
  VALUES (p_internship_id, 'reissued', v_admin_id, NULL, v_code, 'Re-issued after revocation');

  RETURN jsonb_build_object(
    'success', true,
    'certificate_code', v_code,
    'issued_at', now()::text,
    'released_by', v_admin_id::text
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.reissue_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reissue_certificate(uuid) TO authenticated;

-- 7. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';