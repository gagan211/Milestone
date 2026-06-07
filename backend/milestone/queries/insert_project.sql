INSERT INTO public.projects (id, user_id, client_id, github_repo_id, repo_owner, repo_name, description, is_active)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (user_id, github_repo_id) 
DO UPDATE SET 
    client_id = EXCLUDED.client_id,
    repo_owner = EXCLUDED.repo_owner,
    repo_name = EXCLUDED.repo_name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = now()
RETURNING id;
