use crate::dto::project_dto::LinkRepoPayload;
use crate::services::project_service::ProjectService;
use crate::{auth::jwt::AuthenticatedUser, state::AppState};
use axum::{
    Json,
    extract::{Path, State},
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
            return (
                axum::http::StatusCode::BAD_REQUEST,
                format!("Invalid user ID: {}", e),
            )
                .into_response();
        }
    };

    match ProjectService::get_dashboard_data(&state.db, user_uuid).await {
        Ok(data) => Json(json!(data)).into_response(),
        Err(e) => {
            eprintln!("Failed to get dashboard data: {:?}", e);
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error",
            )
                .into_response()
        }
    }
}

pub async fn get_project_handler(
    State(_state): State<AppState>,
    Path(_id): Path<String>,
    _user: AuthenticatedUser,
) -> impl IntoResponse {
    // Placeholder implementation
    (
        axum::http::StatusCode::NOT_IMPLEMENTED,
        "Not implemented yet",
    )
        .into_response()
}

pub async fn link_repo_handler(
    State(_state): State<AppState>,
    _user: AuthenticatedUser,
    Json(_payload): Json<LinkRepoPayload>,
) -> impl IntoResponse {
    (
        axum::http::StatusCode::NOT_IMPLEMENTED,
        "Not implemented yet",
    )
        .into_response()
}
