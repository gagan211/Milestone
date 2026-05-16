INSERT INTO users (id, email, github_username, github_avatar_url, display_name, github_access_token)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    github_avatar_url = EXCLUDED.github_avatar_url,
    display_name = EXCLUDED.display_name,
    github_access_token = COALESCE(EXCLUDED.github_access_token, users.github_access_token),
    updated_at = CURRENT_TIMESTAMP;
