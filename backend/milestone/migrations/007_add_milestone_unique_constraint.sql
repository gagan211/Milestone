ALTER TABLE public.milestones 
ADD CONSTRAINT milestones_project_id_title_key UNIQUE (project_id, title);
