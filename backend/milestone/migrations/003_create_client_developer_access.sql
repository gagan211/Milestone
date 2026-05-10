CREATE TABLE IF NOT EXISTS client_developer_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    developer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(client_id, developer_id)
);

CREATE INDEX IF NOT EXISTS idx_cda_client_id ON client_developer_access(client_id);
CREATE INDEX IF NOT EXISTS idx_cda_developer_id ON client_developer_access(developer_id);
