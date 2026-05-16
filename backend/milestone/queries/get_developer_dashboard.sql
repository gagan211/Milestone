SELECT 
    p.id::text as project_id, 
    p.repo_name,
    COALESCE(
        (SELECT AVG(CASE WHEN m.status = 'completed' THEN 100.0 ELSE 0.0 END) 
         FROM milestones m WHERE m.project_id = p.id), 
        0.0
    )::FLOAT8 as progress,
    c.company_name as client_name
FROM projects p
LEFT JOIN clients c ON c.id = p.client_id
WHERE p.user_id = $1;
