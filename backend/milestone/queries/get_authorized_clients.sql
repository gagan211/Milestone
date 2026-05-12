SELECT 
    c.id::text as id,
    c.company_name,
    c.contact_name
FROM clients c
JOIN client_developer_access cda ON cda.client_id = c.id
WHERE cda.developer_id = $1 AND cda.is_active = true;
