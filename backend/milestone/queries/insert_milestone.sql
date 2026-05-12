INSERT INTO public.milestones (id, project_id, title, description, status)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, project_id, title, description, status, completed_at, created_at, updated_at;
