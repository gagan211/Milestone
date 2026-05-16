SELECT 
    u.id::text as id,
    u.github_username,
    u.github_avatar_url,
    u.display_name,
    u.bio,
    u.skills,
    u.location,
    u.website_url,
    u.profile_data,
    u.profile_stats,
    COALESCE(
        (SELECT AVG(CASE WHEN m.status = 'completed' THEN 100.0 ELSE 0.0 END)
         FROM milestones m 
         JOIN projects p ON p.id = m.project_id
         WHERE p.user_id = u.id),
        100.0
    ) as trust_score
FROM users u
WHERE u.id = $1;
