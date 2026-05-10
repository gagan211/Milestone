CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    github_username VARCHAR(100) NOT NULL,
    github_avatar_url VARCHAR(512),
    github_access_token VARCHAR(255),
    display_name VARCHAR(100),
    bio TEXT,
    skills TEXT,
    website_url VARCHAR(512),
    location VARCHAR(255),
    profile_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
