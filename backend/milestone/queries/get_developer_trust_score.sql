SELECT COALESCE(AVG(CASE WHEN m.status = 'completed' THEN 100.0 ELSE 0.0 END), 100.0) as average_completion
FROM milestones m
JOIN projects p ON p.id = m.project_id
WHERE p.user_id = $1;
