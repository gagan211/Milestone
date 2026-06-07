use serde::{Deserialize, Serialize};
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProfileStats {
    pub commits: i32,
    pub stars: i32,
    #[serde(rename = "totalMilestonesVerified")]
    pub total_milestones_verified: i32,
    #[serde(rename = "activeProjects")]
    pub active_projects: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProfileLayoutBlock {
    pub id: String,
    #[serde(rename = "type")]
    pub block_type: String, // Matches "hero" | "markdown" | "project_showcase"
    pub content: serde_json::Value, // Flexible JSON value for custom layouts
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProfileLayoutData {
    pub layout: Vec<ProfileLayoutBlock>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProfileResponse {
    pub id: String,
    pub name: String,
    pub title: String,
    pub score: i32,
    pub stats: ProfileStats,
    pub profile_data: ProfileLayoutData,
}

#[derive(Debug, Deserialize, Clone)]
pub struct UpdateProfilePayload {
    pub profile_data: ProfileLayoutData,
}
