-- Update recalc_internship_progress trigger function to award certificate after ANY ONE approved project submission
CREATE OR REPLACE FUNCTION public.recalc_internship_progress()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_iid uuid;
  v_approved int;
BEGIN
  v_iid := COALESCE(NEW.internship_id, OLD.internship_id);
  SELECT count(*) INTO v_approved FROM public.submissions WHERE internship_id = v_iid AND status = 'approved';
  
  UPDATE public.internships
    SET progress_percent = LEAST(v_approved * 20, 100),
        status = CASE WHEN v_approved >= 1 THEN 'completed'::internship_status ELSE status END,
        completed_at = CASE WHEN v_approved >= 1 AND completed_at IS NULL THEN now() ELSE completed_at END,
        certificate_code = CASE WHEN v_approved >= 1 AND certificate_code IS NULL
          THEN 'YRN-CERT-' || upper(substring(gen_random_uuid()::text,1,8)) ELSE certificate_code END,
        certificate_issued_at = CASE WHEN v_approved >= 1 AND certificate_issued_at IS NULL THEN now() ELSE certificate_issued_at END
  WHERE id = v_iid;
  RETURN NEW;
END $$;
