-- =============================================================================
-- ADMIN-ONLY TASK APPROVAL & CERTIFICATE RELEASE
-- DATE: 2026-09-12 (revised)
-- =============================================================================
-- Root cause: dashboard.tsx sends status = 'pending_review' on INSERT/UPDATE,
-- but the original CHECK constraint only allows
--   IN ('pending','approved','rejected','resubmit').
-- This causes: new row for relation "submissions" violates check constraint
--              "submissions_status_check"
--
-- Fixes:
--   1. Adds 'pending_review' to the CHECK constraint (keeps 'pending' for legacy rows)
--   2. Changes default from 'pending' to 'pending_review'
--   3. Migrates any remaining 'pending' rows → 'pending_review'
--   4. Tightens student INSERT policy to ONLY allow status = 'pending_review'
--   5. Tightens student UPDATE policy: only resubmit/rejected → pending_review
--   6. Adds certificate audit columns to internships
--
-- Security model:
--   - Student INSERT: only status = 'pending_review' (cannot self-approve)
--   - Student UPDATE: only from 'resubmit'/'rejected' → 'pending_review'
--   - Admin: full control (FOR ALL policy with has_role('admin'))
--   - Certificate release: admin-only via certificate_code column
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CHECK constraint: add 'pending_review'
-- ─────────────────────────────────────────────────────────────────────────────
-- Drop and recreate in a single transaction so the constraint is never absent.
ALTER TABLE public.submissions
  DROP CONSTRAINT IF EXISTS submissions_status_check;

ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_status_check
  CHECK (status IN ('pending_review','pending','approved','rejected','resubmit'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Default status → 'pending_review'
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.submissions
  ALTER COLUMN status SET DEFAULT 'pending_review';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Migrate any remaining 'pending' rows to 'pending_review'
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE public.submissions
  SET status = 'pending_review'
  WHERE status = 'pending';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Certificate audit columns on internships
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS certificate_released_by uuid;
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS certificate_released_at timestamptz;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Student INSERT policy: ONLY allow status = 'pending_review'
--    Without this, a student could call the REST API directly and insert
--    status = 'approved', bypassing admin review entirely.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Students insert own submissions" ON public.submissions;
CREATE POLICY "Students insert own submissions" ON public.submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_id AND i.student_id = auth.uid()
    )
    AND status = 'pending_review'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Student UPDATE policy: only resubmit/rejected → pending_review
--    USING = rows the student is allowed to see for update (old row state)
--    WITH CHECK = what the new row must look like after the update
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Students update own pending submissions" ON public.submissions;
CREATE POLICY "Students update own pending submissions" ON public.submissions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_id AND i.student_id = auth.uid()
    )
    AND status IN ('resubmit', 'rejected')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_id AND i.student_id = auth.uid()
    )
    AND status = 'pending_review'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Admin policy: unchanged (FOR ALL with has_role('admin'))
--    Admin can set any status: approved, rejected, resubmit.
--    Admin can issue certificates via certificate_code on internships.
-- ─────────────────────────────────────────────────────────────────────────────
-- No change needed — "Admins manage submissions" policy already covers ALL.

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Confirm trigger — recalc_internship_progress counts only 'approved'
--    Certificate issuance is manual via admin (certificate_code column).
--    No changes needed to the trigger function.
-- ─────────────────────────────────────────────────────────────────────────────
