UPDATE users 
SET profile_data = $1, 
    updated_at = NOW() 
WHERE id = $2;
