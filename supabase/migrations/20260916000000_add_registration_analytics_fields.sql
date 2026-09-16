-- Add registration analytics fields to profiles table
-- country, discovery_source, discovery_other
-- Existing users will have NULL values; new registrations must provide these at the application level.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS discovery_source text,
  ADD COLUMN IF NOT EXISTS discovery_other text;

COMMENT ON COLUMN public.profiles.country IS 'Country selected during registration';
COMMENT ON COLUMN public.profiles.discovery_source IS 'How the user heard about YR NOVATECH';
COMMENT ON COLUMN public.profiles.discovery_other IS 'Free-text when discovery_source is Other';
