pub mod billing;
pub mod integrations;
pub mod milestones;
pub mod projects;
pub mod users;

use crate::{auth::jwt::AuthenticatedUser, config::AppConfig, state::AppState};
use axum::{
    Json, Router,
    extract::State,
    response::IntoResponse,
    routing::{get, post},
};
use serde_json::json;

pub fn app_router(config: &AppConfig) -> Router<AppState> {
    // We group all auth-related endpoints
    let auth_routes = Router::new()
        .route("/me", get(me_handler))
        .route("/sync", post(users::sync_user_handler));

    // We group all project-related endpoints (handlers to be implemented)
    let project_routes = Router::new()
        .route("/dashboard", get(projects::get_dashboard_handler))
        .route("/link", post(projects::link_repo_handler))
        .route("/:id", get(projects::get_project_handler));

    // Main API router
    let api_routes = Router::new()
        .route("/health", get(health_check_handler))
        .nest("/auth", auth_routes)
        .nest("/projects", project_routes);

    // Nest the API router under the dynamically configured base path
    Router::new().nest(config.base_path(), api_routes)
}

async fn health_check_handler(State(state): State<AppState>) -> impl IntoResponse {
    println!("🔍 [BACKEND] Received Health Check request");
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
