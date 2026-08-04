-- Create a trigger function to auto-confirm new users
CREATE OR REPLACE FUNCTION public.auto_confirm_student_emails()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Automatically confirm email for all registrations
  NEW.email_confirmed_at := now();
  NEW.confirmed_at := now();
  RETURN NEW;
END;
$$;

-- Bind the trigger BEFORE INSERT on auth.users
CREATE OR REPLACE TRIGGER tr_auto_confirm_emails
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_student_emails();
