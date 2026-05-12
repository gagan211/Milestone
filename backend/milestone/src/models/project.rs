use chrono::NaiveDateTime;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct Project {
    pub id: Uuid,
    pub user_id: Uuid,
    pub client_id: Option<Uuid>,
    pub github_repo_id: i64,
    pub repo_owner: String,
    pub repo_name: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}
