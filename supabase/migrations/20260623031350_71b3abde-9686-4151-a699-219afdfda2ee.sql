
-- Extend profiles for student registration fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS college text,
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS year text,
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

-- Internship: offer letter & certificate
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS offer_letter_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS offer_issued_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS certificate_issued_at timestamptz;

-- Only one internship per student
CREATE UNIQUE INDEX IF NOT EXISTS internships_one_per_student ON public.internships(student_id);

-- Submissions table: 5 fixed tasks per internship
CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  task_no int NOT NULL CHECK (task_no BETWEEN 1 AND 5),
  github_url text,
  project_url text,
  drive_url text,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','resubmit')),
  feedback text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(internship_id, task_no)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own submissions" ON public.submissions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.internships i WHERE i.id = internship_id AND i.student_id = auth.uid()));
CREATE POLICY "Students insert own submissions" ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.internships i WHERE i.id = internship_id AND i.student_id = auth.uid()));
CREATE POLICY "Students update own pending submissions" ON public.submissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.internships i WHERE i.id = internship_id AND i.student_id = auth.uid()) AND status IN ('pending','resubmit','rejected'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.internships i WHERE i.id = internship_id AND i.student_id = auth.uid()));
CREATE POLICY "Admins manage submissions" ON public.submissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER submissions_set_updated_at BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto progress + auto certificate when all 5 approved
CREATE OR REPLACE FUNCTION public.recalc_internship_progress()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_iid uuid;
  v_approved int;
BEGIN
  v_iid := COALESCE(NEW.internship_id, OLD.internship_id);
  SELECT count(*) INTO v_approved FROM public.submissions WHERE internship_id = v_iid AND status = 'approved';
  UPDATE public.internships
    SET progress_percent = v_approved * 20,
        status = CASE WHEN v_approved >= 5 THEN 'completed'::internship_status ELSE status END,
        completed_at = CASE WHEN v_approved >= 5 AND completed_at IS NULL THEN now() ELSE completed_at END,
        certificate_code = CASE WHEN v_approved >= 5 AND certificate_code IS NULL
          THEN 'YRN-CERT-' || upper(substring(gen_random_uuid()::text,1,8)) ELSE certificate_code END,
        certificate_issued_at = CASE WHEN v_approved >= 5 AND certificate_issued_at IS NULL THEN now() ELSE certificate_issued_at END
  WHERE id = v_iid;
  RETURN NEW;
END $$;

CREATE TRIGGER submissions_recalc AFTER INSERT OR UPDATE OR DELETE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.recalc_internship_progress();

-- Issue offer letter automatically when internship becomes active
CREATE OR REPLACE FUNCTION public.issue_offer_letter()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.offer_letter_code IS NULL THEN
    NEW.offer_letter_code := 'YRN-OL-' || upper(substring(gen_random_uuid()::text,1,8));
    NEW.offer_issued_at := now();
    IF NEW.started_at IS NULL THEN NEW.started_at := now(); END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER internships_issue_offer BEFORE UPDATE ON public.internships
  FOR EACH ROW EXECUTE FUNCTION public.issue_offer_letter();

-- Public avatars bucket created via separate tool call afterwards
