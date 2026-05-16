SELECT 
    p.id::text as project_id, 
    p.repo_name,
    COALESCE(
        (SELECT AVG(CASE WHEN m.status = 'completed' THEN 100.0 ELSE 0.0 END) 
         FROM milestones m WHERE m.project_id = p.id), 
        0.0
    )::FLOAT8 as progress,
    u.display_name as dev_name
FROM projects p
JOIN users u ON u.id = p.user_id
JOIN client_developer_access cda ON cda.developer_id = p.user_id AND cda.client_id = p.client_id
WHERE p.client_id = $1 AND cda.is_active = true;
