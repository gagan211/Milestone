use crate::dto::project_dto::GitHubRepoDetails;
use crate::verification::github::GitHubRepoInfo;
use reqwest::header::{AUTHORIZATION, USER_AGENT};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum GitHubError {
    #[error("GitHub access token expired or was revoked. Please log in again.")]
    TokenExpired,
    #[error("Insufficient permissions to access this repository. Please grant 'repo' access.")]
    InsufficientPermissions,
    #[error("Repository not found. Please verify the URL and ensure Milestone has access.")]
    NotFound,
    #[error("GitHub API error: {0}")]
    ApiError(String),
}

pub struct GitHubService;

impl GitHubService {
    pub async fn check_repo_access(
        api_base_url: &str,
        info: &GitHubRepoInfo,
        token: &str,
    ) -> Result<GitHubRepoDetails, GitHubError> {
        let client = reqwest::Client::new();
        let url = format!("{}/repos/{}/{}", api_base_url, info.owner, info.repo);

        let response = client
            .get(&url)
            .header(AUTHORIZATION, format!("Bearer {}", token))
            .header(USER_AGENT, "Milestone-App")
            .send()
            .await
            .map_err(|e| GitHubError::ApiError(e.to_string()))?;

        let scopes = response
            .headers()
            .get("x-oauth-scopes")
            .and_then(|h| h.to_str().ok())
            .unwrap_or("");

        let has_repo_scope = scopes.contains("repo");

        match response.status().as_u16() {
            200 => response
                .json::<GitHubRepoDetails>()
                .await
                .map_err(|e| GitHubError::ApiError(e.to_string())),
            401 => Err(GitHubError::TokenExpired),
            403 => Err(GitHubError::InsufficientPermissions),
            404 => {
                if !has_repo_scope {
                    // If we don't have the repo scope, a 404 likely means we can't see a private repo.
                    Err(GitHubError::InsufficientPermissions)
                } else {
                    Err(GitHubError::NotFound)
                }
            }
            status => Err(GitHubError::ApiError(format!(
                "Unexpected status: {}",
                status
            ))),
        }
    }

    /// Builds a GitHub OAuth URL with the 'repo' scope required for private repo access.
    pub fn build_reauth_url(
        login_base_url: &str,
        client_id: &str,
        redirect_uri: Option<&str>,
    ) -> String {
        let mut url = format!("{}?client_id={}&scope=repo", login_base_url, client_id);
        if let Some(uri) = redirect_uri {
            url.push_str(&format!("&redirect_uri={}", uri));
        }
        url
    }
}
