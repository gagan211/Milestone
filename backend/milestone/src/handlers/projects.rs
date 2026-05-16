use crate::dto::project_dto::LinkRepoPayload;
use crate::services::github::{GitHubError, GitHubService};
use crate::services::project_service::ProjectService;
use crate::verification::github::GitHubValidator;
use crate::verification::url_checker::PlatformValidator;

use crate::{auth::jwt::AuthenticatedUser, state::AppState};

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::json;

use uuid::Uuid;

pub async fn get_dashboard_handler(
    State(state): State<AppState>,
    user: AuthenticatedUser,
) -> impl IntoResponse {
    let user_uuid = match Uuid::parse_str(&user.user_id) {
        Ok(uuid) => uuid,
        Err(e) => {
            return (StatusCode::BAD_REQUEST, format!("Invalid user ID: {}", e)).into_response();
        }
    };

    match ProjectService::get_dashboard_data(&state.db, user_uuid).await {
        Ok(data) => Json(json!(data)).into_response(),
        Err(e) => {
            eprintln!("Failed to get dashboard data: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error").into_response()
        }
    }
}

pub async fn get_project_handler(
    State(_state): State<AppState>,
    Path(_id): Path<String>,
    _user: AuthenticatedUser,
) -> impl IntoResponse {
    (StatusCode::NOT_IMPLEMENTED, "Not implemented yet").into_response()
}

pub async fn link_repo_handler(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Json(payload): Json<LinkRepoPayload>,
) -> impl IntoResponse {
    println!("🔗 [BACKEND] Received Link Repo request for: {}", payload.repo_url);
    // 1. URL validations (Local)
    let repo_info = match GitHubValidator::validate(&payload.repo_url) {
        Ok(info) => info,
        Err(e) => return (StatusCode::BAD_REQUEST, e.to_string()).into_response(),
    };

    // 2. Fetch user's github token from DB
    let user_uuid = match Uuid::parse_str(&user.user_id) {
        Ok(uuid) => uuid,
        Err(_) => return (StatusCode::BAD_REQUEST, "Invalid User ID format").into_response(),
    };

    let token_res: Result<Option<String>, _> =
        sqlx::query_scalar("SELECT github_access_token FROM users WHERE id = $1")
            .bind(user_uuid)
            .fetch_optional(state.db.get_conn())
            .await;

    let token = match token_res {
        Ok(Some(t)) => t,
        _ => {
            return (
                StatusCode::UNAUTHORIZED,
                "GitHub access token missing. Please re-login with GitHub.",
            )
                .into_response();
        }
    };

    // 3. Verify access via GitHub API (Network)
    match GitHubService::check_repo_access(state.config.github_api_url(), &repo_info, &token).await {
        Ok(details) => {
            // Success! Repository exists and is accessible.

            // Convert optional client_id string to Uuid
            let client_uuid = payload.client_id.and_then(|id| Uuid::parse_str(&id).ok());

            // 4. Persist to Database
            match ProjectService::link_repository(
                &state.db,
                user_uuid,
                &repo_info,
                &details,
                client_uuid,
            )
            .await
            {
                Ok(project_id) => Json(crate::dto::project_dto::LinkRepoResponse {
                    project_id: project_id.to_string(),
                    repo_name: repo_info.repo,
                    repo_owner: repo_info.owner,
                    message: "Repository linked successfully and milestones seeded!".to_string(),
                })
                .into_response(),
                Err(e) => {
                    eprintln!("Database error during repo linking: {:?}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Failed to save project to database",
                    )
                        .into_response()
                }
            }
        }
        Err(e) => {
            let (status, error_code, action, redirect_url) = match e {
                GitHubError::TokenExpired => (
                    StatusCode::UNAUTHORIZED,
                    "TOKEN_EXPIRED",
                    Some("reauthorize".to_string()),
                    Some(GitHubService::build_reauth_url(
                        state.config.github_login_url(),
                        state.config.github_client_id(),
                        None,
                    )),
                ),
                GitHubError::InsufficientPermissions => (
                    StatusCode::FORBIDDEN,
                    "INSUFFICIENT_SCOPE",
                    Some("reauthorize".to_string()),
                    Some(GitHubService::build_reauth_url(
                        state.config.github_login_url(),
                        state.config.github_client_id(),
                        None,
                    )),
                ),
                GitHubError::NotFound => (StatusCode::NOT_FOUND, "REPO_NOT_FOUND", None, None),
                GitHubError::ApiError(_) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "GITHUB_API_ERROR",
                    None,
                    None,
                ),
            };

            (
                status,
                Json(crate::dto::project_dto::ApiError {
                    error: error_code.to_string(),
                    message: e.to_string(),
                    action,
                    redirect_url,
                }),
            )
                .into_response()
        }
    }
}
