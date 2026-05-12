INSERT INTO users (id, email, github_username, github_avatar_url, display_name)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    github_avatar_url = EXCLUDED.github_avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = CURRENT_TIMESTAMP;
