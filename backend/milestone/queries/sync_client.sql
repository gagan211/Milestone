INSERT INTO clients (id, email, contact_name, google_avatar_url)
VALUES ($1, $2, $3, $4)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    google_avatar_url = EXCLUDED.google_avatar_url,
    contact_name = EXCLUDED.contact_name,
    updated_at = CURRENT_TIMESTAMP;
