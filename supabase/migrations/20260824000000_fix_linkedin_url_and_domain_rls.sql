-- =============================================================================
-- FIX: submissions.linkedin_url + domains anon read access
-- DATE: 2026-08-24
-- =============================================================================
-- Issue 1: submissions table missing linkedin_url column (needed for Task 1)
-- Issue 2: domains table RLS/grants not allowing anon role to read active domains
--
-- HOW TO APPLY: Run this SQL in the Supabase Dashboard > SQL Editor
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ISSUE 1: Add linkedin_url to submissions
-- ---------------------------------------------------------------------------
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS linkedin_url text;

-- Update task_no CHECK to allow 1-6 (Task 1 is LinkedIn, Tasks 2-6 are domain-specific)
ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_task_no_check;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_task_no_check CHECK (task_no BETWEEN 1 AND 6);

-- ---------------------------------------------------------------------------
-- ISSUE 2: Ensure domains are readable by anonymous (unauthenticated) users
-- ---------------------------------------------------------------------------

-- Grant USAGE on public schema to anon (required to access any table in the schema)
GRANT USAGE ON SCHEMA public TO anon;

-- Grant SELECT on domains to both anon and authenticated
GRANT SELECT ON public.domains TO anon;
GRANT SELECT ON public.domains TO authenticated;

-- Drop and recreate the SELECT policy to ensure it exists and is correct
-- The policy allows ANY role to read active domains (no TO clause = all roles)
DROP POLICY IF EXISTS "Anyone can view active domains" ON public.domains;
CREATE POLICY "Anyone can view active domains" ON public.domains
  FOR SELECT
  USING (active = true);

-- Ensure all active domains exist (upsert so we never duplicate)
INSERT INTO public.domains (slug, name, description, icon) VALUES
  ('full-stack',        'Full Stack Development',                'MERN, Next.js, Postgres, deployments.', 'Code'),
  ('ui-ux',             'UI/UX Design',                          'Figma, design systems, user research.', 'Palette'),
  ('python',            'Python Programming',                    'Scripting, automation, backend with FastAPI.', 'Terminal'),
  ('cpp',               'C++ Programming',                       'DSA, OOP, competitive problem solving.', 'Cpu'),
  ('artificial-intelligence', 'Artificial Intelligence & Machine Learning',
                          'Data analysis, prediction models, spam email detection, chatbots.', 'Cpu')
ON CONFLICT (slug) DO NOTHING;
