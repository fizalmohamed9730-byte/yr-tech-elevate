-- Create storage bucket for offer letters if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('offer-letters', 'offer-letters', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for offer-letters bucket

-- Policy for Admins: Full access to the offer-letters bucket
CREATE POLICY "Admins manage offer letters storage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'offer-letters' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'offer-letters' AND public.has_role(auth.uid(), 'admin'));

-- Policy for Interns/Students: Can read/download only their own offer letter file
-- The file path structure is expected to be: [student_id]/offer-letter.pdf
CREATE POLICY "Interns read own offer letter storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'offer-letters' AND (storage.foldername(name))[1] = auth.uid()::text);
