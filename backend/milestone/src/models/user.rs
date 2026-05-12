use uuid::Uuid;
use chrono::NaiveDateTime;

#[derive(Debug, Clone)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub github_username: String,
    pub github_avatar_url: Option<String>,
    pub display_name: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Clone)]
pub struct Client {
    pub id: Uuid,
    pub email: String,
    pub contact_name: String,
    pub google_avatar_url: Option<String>,
    pub company_name: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}
