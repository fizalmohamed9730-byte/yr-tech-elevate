-- Insert NEXORA AI project
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  proj_id uuid;
BEGIN
  -- Insert the project (skip if title already exists)
  INSERT INTO public.projects (title, description, difficulty, active)
  VALUES (
    'NEXORA — AI Assistant Platform',
    'Full-stack AI assistant platform with 12 integrated modules: live dashboard with telemetry widgets, streaming chat via Ollama LLM (qwen2.5:3b) with markdown and code highlighting, wake-word voice assistant with progressive sentence-by-sentence TTS, procedural holographic SVG image generator with instant download, animated SVG video generator with live preview, LLM-powered website generator rendered in a live iframe, PowerPoint deck generator (3/5/8/10 slides) with downloadable .pptx, persistent memory storage and search, calendar scheduler, file manager with chat context injection, model switching at runtime, and full offline/local operation.',
    'Advanced',
    true
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO proj_id;

  -- If project was inserted, link it to domains
  IF proj_id IS NOT NULL THEN
    -- Link to artificial-intelligence domain
    INSERT INTO public.project_domains (project_id, domain_id)
    SELECT proj_id, id FROM public.domains WHERE slug = 'artificial-intelligence';

    -- Link to full-stack domain
    INSERT INTO public.project_domains (project_id, domain_id)
    SELECT proj_id, id FROM public.domains WHERE slug = 'full-stack';

    -- Link to python domain
    INSERT INTO public.project_domains (project_id, domain_id)
    SELECT proj_id, id FROM public.domains WHERE slug = 'python';
  END IF;
END $$;
