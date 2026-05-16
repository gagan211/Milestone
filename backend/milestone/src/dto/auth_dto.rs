use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SyncUserPayload {
    pub role: String, // "developer" or "client"
    #[serde(rename = "githubAccessToken")]
    pub github_access_token: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SyncUserResponse {
    pub status: String,
    pub message: String,
    pub role: String,
    #[serde(rename = "userId")]
    pub user_id: String,
}
