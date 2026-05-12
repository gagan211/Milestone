SELECT COALESCE(AVG(CASE WHEN m.status = 'completed' THEN 100.0 ELSE 0.0 END), 100.0) as avg_score
FROM projects p
JOIN milestones m ON m.project_id = p.id
JOIN client_developer_access cda ON cda.developer_id = p.user_id AND cda.client_id = p.client_id
WHERE p.client_id = $1 AND cda.is_active = true;
