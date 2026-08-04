-- Create a sequence for the internship codes
CREATE SEQUENCE IF NOT EXISTS public.internship_code_seq START WITH 1;

-- Create or replace the function to format the internship_code
CREATE OR REPLACE FUNCTION public.generate_internship_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- If internship_code is null or starts with 'YR-', override it with the sequential YRN25xxxx format
  IF NEW.internship_code IS NULL OR NEW.internship_code LIKE 'YR-%' THEN
    NEW.internship_code := 'YRN25' || lpad(nextval('public.internship_code_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Create the BEFORE INSERT trigger to auto-assign the internship code
CREATE OR REPLACE TRIGGER tr_generate_internship_code
  BEFORE INSERT ON public.internships
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_internship_code();
