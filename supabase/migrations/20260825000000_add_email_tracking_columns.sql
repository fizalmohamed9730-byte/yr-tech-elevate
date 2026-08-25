-- Migration: Add email delivery tracking columns to internships table
-- Run this in Supabase Dashboard > SQL Editor

-- Email tracking columns for offer letters
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS offer_letter_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS offer_letter_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS offer_letter_email_error text,
  ADD COLUMN IF NOT EXISTS offer_letter_resend_message_id text;

-- Email tracking columns for certificates
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS certificate_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS certificate_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_email_error text,
  ADD COLUMN IF NOT EXISTS certificate_resend_message_id text;
