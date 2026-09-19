-- Add approval status to feedback table for public testimonials
-- All existing feedback defaults to 'pending' (not publicly visible until approved)

ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback (status);

-- Allow anonymous/public users to read only approved feedback
DROP POLICY IF EXISTS "Public read approved feedback" ON public.feedback;
CREATE POLICY "Public read approved feedback" ON public.feedback
  FOR SELECT TO anon
  USING (status = 'approved');

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
