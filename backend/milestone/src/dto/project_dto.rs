use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectProgress {
    pub id: String,
    pub name: String,
    pub progress: f64,
    pub status: String,
    #[serde(rename = "clientName")] //what does this mean?
    pub client_name: Option<String>,
    #[serde(rename = "devName")]
    pub dev_name: Option<String>,
}
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DashboardResponse {
    pub role: String,
    #[serde(rename = "trustScore")]
    pub trust_score: i32,
    #[serde(rename = "activeProjects")]
    pub active_projects: Vec<ProjectProgress>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct LinkRepoPayload {
    #[serde(rename = "repoUrl")]
    pub repo_url: String,
}
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MilestoneDetail {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    #[serde(rename = "completedAt")]
    pub completed_at: Option<String>,
}
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectResponse {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub status: String,
    pub logs: Vec<MilestoneDetail>,
}
