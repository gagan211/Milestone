pub mod billing;
pub mod integrations;
pub mod milestones;
pub mod projects;
pub mod users;

use crate::{auth::jwt::AuthenticatedUser, state::AppState};
use axum::{Json, Router, extract::State, response::IntoResponse, routing::get};
use serde_json::json;

pub fn app_router() -> Router<AppState> {
    Router::new()
        .route("/health", get(health_check_handler))
        .route("/auth/me", get(me_handler))
}

async fn health_check_handler(State(state): State<AppState>) -> impl IntoResponse {
    if let Err(e) = state.db.health_check().await {
        eprintln!("Database health check failed {}", e);
        return "DB conn error";
    }
    "database connected backend ready"
}

async fn me_handler(user: AuthenticatedUser) -> impl IntoResponse {
    Json(json!({
        "status": "success",
        "message": "Welcome to Milestone backend! Cryptographic token verified.",
        "user_id": user.user_id,
        "email": user.email
    }))
}
