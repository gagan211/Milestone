use crate::auth::jwt::AuthenticatedUser;
use crate::dto::profile_dto::UpdateProfilePayload;
use crate::services::user_service::UserService;
use crate::state::AppState;

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use uuid::Uuid;

fn resolve_user_id(
    user_id_str: &str,
    user: Option<AuthenticatedUser>,
) -> Result<Uuid, (StatusCode, &'static str)> {
    if user_id_str == "me" {
        match user {
            Some(u) => Uuid::parse_str(&u.user_id)
                .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid authenticated User ID")),
            None => Err((StatusCode::UNAUTHORIZED, "Sign in to view your profile")),
        }
    } else {
        Uuid::parse_str(user_id_str)
            .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid User ID format"))
    }
}

pub async fn get_profile_handler(
    State(state): State<AppState>,
    Path(user_id_str): Path<String>,
    user: Option<AuthenticatedUser>, // THIS ALREADY PASSES THE VALIDATION LAYER AND THEN COMES BACK HERE
) -> impl IntoResponse {
    // 1. Resolve and verify the ID using our helper
    let resolved_id = match resolve_user_id(&user_id_str, user) {
        Ok(uid) => uid,
        Err((status, msg)) => return (status, msg).into_response(),
    };

    // 2. Fetch the profile details from the user service layer
    match UserService::get_profile_by_id(&state.db, resolved_id).await {
        Ok(Some(profile)) => Json(profile).into_response(),
        Ok(None) => (StatusCode::NOT_FOUND, "Profile not found").into_response(),
        Err(e) => {
            eprintln!("Failed to fetch profile: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error").into_response()
        }
    }
}

/// Handler to update the authenticated user's own profile layout
pub async fn update_profile_handler(
    State(state): State<AppState>,
    Path(user_id_str): Path<String>,
    user: AuthenticatedUser,                   //  Requires a valid JWT token
    Json(payload): Json<UpdateProfilePayload>, //  Automatically parses the incoming JSON body
) -> impl IntoResponse {
    // 1. Resolve and verify the ID using our helper
    let resolved_id = match resolve_user_id(&user_id_str, Some(user.clone())) {
        Ok(uid) => uid,
        Err((status, msg)) => return (status, msg).into_response(),
    };

    // 2. Parse the user's UUID from their authenticated JWT token
    let user_uuid = match Uuid::parse_str(&user.user_id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, "Invalid User ID format").into_response(),
    };

    // 3. Validate that resolved_id == user_uuid
    if resolved_id != user_uuid {
        return (StatusCode::FORBIDDEN, "Forbidden: You can only update your own profile").into_response();
    }

    // 4. Save the new profile layout to Postgres via our service layer
    if let Err(e) = UserService::update_profile_data(&state.db, user_uuid, payload).await {
        eprintln!("Failed to update profile: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to update profile",
        )
            .into_response();
    }

    match UserService::get_profile_by_id(&state.db, user_uuid).await {
        Ok(Some(profile)) => Json(profile).into_response(), // 👈 200 OK with the fresh profile!
        Ok(None) => (StatusCode::NOT_FOUND, "Profile not found").into_response(),
        Err(e) => {
            eprintln!("Failed to fetch updated profile: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error").into_response()
        }
    }
}
