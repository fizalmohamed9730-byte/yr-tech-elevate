-- Add Artificial Intelligence & Machine Learning domain to public.domains table
INSERT INTO public.domains (slug, name, description, icon)
VALUES ('artificial-intelligence', 'Artificial Intelligence & Machine Learning', 'Data analysis, prediction models, spam email detection, chatbots.', 'Cpu')
ON CONFLICT (slug) DO NOTHING;
