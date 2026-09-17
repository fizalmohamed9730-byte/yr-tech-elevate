-- CERTIFICATE PAYMENT (UPI / QR) — payment_v1 flow
-- ONLY new interns get certificate_flow_version = 'payment_v1'.
-- Existing interns keep certificate_flow_version = 'legacy' (default).
-- This migration is purely additive. No existing data is modified.

-- 1. Add certificate_flow_version to internships
--    Existing rows default to 'legacy'. New registrations will get 'payment_v1' via handle_new_user().
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS certificate_flow_version text NOT NULL DEFAULT 'legacy';

-- Safety CHECK: only allow known values
DO $$ BEGIN
  ALTER TABLE public.internships
    ADD CONSTRAINT internships_certificate_flow_version_check
    CHECK (certificate_flow_version IN ('legacy', 'payment_v1'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. App settings table (configurable fee)
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

-- Seed default certificate fee (₹99 INR)
INSERT INTO public.app_settings (key, value) VALUES ('certificate_fee', to_jsonb(99))
  ON CONFLICT (key) DO NOTHING;

-- 3. Certificate payments table
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

-- Index for quick lookups by internship
CREATE INDEX IF NOT EXISTS idx_certificate_payments_internship ON public.certificate_payments (internship_id);

ALTER TABLE public.certificate_payments ENABLE ROW LEVEL SECURITY;

-- Students can read their own payments
DROP POLICY IF EXISTS "Students view own payments" ON public.certificate_payments;
CREATE POLICY "Students view own payments" ON public.certificate_payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = certificate_payments.internship_id
        AND i.student_id = auth.uid()
    )
  );

-- Students can insert pending_verification payments for their own internship
DROP POLICY IF EXISTS "Students submit own payments" ON public.certificate_payments;
CREATE POLICY "Students submit own payments" ON public.certificate_payments
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'pending_verification'
    AND EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = certificate_payments.internship_id
        AND i.student_id = auth.uid()
    )
  );

-- Students can update only their own rejected payments (retry after rejection)
DROP POLICY IF EXISTS "Students retry own rejected payments" ON public.certificate_payments;
CREATE POLICY "Students retry own rejected payments" ON public.certificate_payments
  FOR UPDATE TO authenticated
  USING (
    status = 'rejected'
    AND EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = certificate_payments.internship_id
        AND i.student_id = auth.uid()
    )
  )
  WITH CHECK (
    status = 'pending_verification'
    AND EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = certificate_payments.internship_id
        AND i.student_id = auth.uid()
    )
  );

-- Admins full access
DROP POLICY IF EXISTS "Admins manage certificate payments" ON public.certificate_payments;
CREATE POLICY "Admins manage certificate payments" ON public.certificate_payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS certificate_payments_set_updated_at ON public.certificate_payments;
CREATE TRIGGER certificate_payments_set_updated_at
  BEFORE UPDATE ON public.certificate_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Update handle_new_user() — new interns get certificate_flow_version = 'payment_v1'
--    Existing internships are NOT touched (WHERE clause ensures only new inserts).
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
    avatar_url, must_change_password, role, duration, selected_domain,
    country, discovery_source, discovery_other
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
    NULLIF(NEW.raw_user_meta_data->>'domain_id','')::uuid::text,
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

  v_domain := NULLIF(NEW.raw_user_meta_data->>'domain_id','')::uuid;
  v_duration := COALESCE(NEW.raw_user_meta_data->>'duration', '1 Month');

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

-- 5. Update issue_certificate() — checks payment for payment_v1 interns
CREATE OR REPLACE FUNCTION public.issue_certificate(p_internship_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
  v_internship record;
  v_approved int;
  v_required int;
  v_code text;
  v_payment record;
BEGIN
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can issue certificates';
  END IF;

  SELECT * INTO v_internship FROM public.internships WHERE id = p_internship_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Internship not found';
  END IF;

  IF v_internship.certificate_code IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'Certificate already issued: ' || v_internship.certificate_code);
  END IF;

  -- Only check payment for payment_v1 interns. Legacy interns are unaffected.
  IF v_internship.certificate_flow_version = 'payment_v1' THEN
    SELECT * INTO v_payment FROM public.certificate_payments
      WHERE internship_id = p_internship_id AND status = 'paid';
    IF v_payment IS NULL THEN
      RAISE EXCEPTION 'Cannot issue certificate: payment not verified. Payment must be confirmed before issuing certificate for payment_v1 interns.';
    END IF;
  END IF;

  SELECT count(*) INTO v_approved
    FROM public.submissions
    WHERE internship_id = p_internship_id AND status = 'approved';
  v_required := CASE
    WHEN v_internship.duration = '1 Month' THEN 3
    WHEN v_internship.duration = '2 Months' THEN 4
    ELSE 5
  END;
  IF v_approved < v_required THEN
    RAISE EXCEPTION 'Cannot issue certificate: % of % required tasks approved', v_approved, v_required;
  END IF;

  v_code := 'YRNT-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8));
  UPDATE public.internships
    SET certificate_code      = v_code,
        certificate_issued_at = now(),
        certificate_released_by = v_admin_id,
        certificate_released_at = now()
  WHERE id = p_internship_id;

  RETURN jsonb_build_object(
    'success', true,
    'certificate_code', v_code,
    'issued_at', now()::text,
    'released_by', v_admin_id::text
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.issue_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_certificate(uuid) TO authenticated;

-- 6. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
