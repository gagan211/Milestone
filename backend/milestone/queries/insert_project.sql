INSERT INTO public.projects (id, user_id, client_id, github_repo_id, repo_owner, repo_name, description, is_active)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING id, user_id, client_id, github_repo_id, repo_owner, repo_name, description, is_active, created_at, updated_at;
