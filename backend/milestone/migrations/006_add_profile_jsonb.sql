-- Add NoSQL-style flexible columns for developer profiles
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS profile_stats JSONB DEFAULT '{}'::jsonb;

-- Add a comment to explain the purpose of these columns
COMMENT ON COLUMN users.profile_data IS 'Flexible, user-defined profile sections and layout.';
COMMENT ON COLUMN users.profile_stats IS 'Cached aggregation of trust metrics (commits, stars, verified milestones).';
