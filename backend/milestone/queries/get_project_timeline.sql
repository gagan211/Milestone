SELECT 
    p.id::text as id,
    p.repo_name as name,
    p.repo_owner as owner,
    p.description,
    p.is_active,
    m.id::text as milestone_id,
    m.title as milestone_title,
    m.description as milestone_description,
    m.status as milestone_status,
    m.completed_at::text as milestone_completed_at
FROM projects p
LEFT JOIN milestones m ON m.project_id = p.id
WHERE p.id = $1 AND p.user_id = $2
ORDER BY m.created_at ASC;
