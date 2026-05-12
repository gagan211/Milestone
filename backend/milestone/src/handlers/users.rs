use crate::{auth::jwt::AuthenticatedUser, state::AppState};
use crate::dto::auth_dto::SyncUserPayload;
use crate::services::user_service::UserService;
use axum::{Json, extract::State, response::IntoResponse, http::StatusCode};

pub async fn sync_user_handler(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Json(payload): Json<SyncUserPayload>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // Basic defensive validation
    if payload.role != "developer" && payload.role != "client" {
        return Err((
            StatusCode::BAD_REQUEST,
            "Invalid role provided (must be 'developer' or 'client')".to_string(),
        ));
    }

    // Call our business logic service layer
    let response = UserService::sync_user(&state.db, &user, payload)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to synchronize user profile: {}", e),
            )
        })?;

    Ok(Json(response))
}
