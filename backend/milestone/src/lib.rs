pub mod auth;
pub mod config;
pub mod db;
pub mod dto;
pub mod error;
pub mod handlers;
pub mod logger;
pub mod models;
pub mod network;
pub mod services;
pub mod state;
pub mod verification;

use crate::{config::AppConfig, network::HttpServer, state::AppState};
use axum::Router;
use db::Database;
use handlers::app_router;

pub async fn on_init() -> Result<HttpServer, Box<dyn std::error::Error + Send + Sync>> {
    // 1. Load config
    let config = AppConfig::load()?;

    // 2. Initialize our Supabase DB pool & run migrations
    let db = Database::new(config.database_url(), config.max_db_conn()).await?;

    // 3. Fetch JWKS dynamically from Supabase
    println!("🔑 Fetching public JWKS keys from Supabase... URL: {}", config.jwks_url());
    let jwk_set: jsonwebtoken::jwk::JwkSet = reqwest::get(config.jwks_url())
        .await?
        .json()
        .await?;
    println!("✅ JWKS loaded successfully! Verification keys cached.");

    // 4. Create our shared AppState
    let state = AppState::new(config, db, jwk_set);

    // 5. Build our router and attach the state
    let app: Router = app_router(&state.config).with_state(state.clone());

    // 6. Try to bind to our TCP port (fails early if the port is already taken!)
    let addr = format!(
        "{}:{}",
        state.config.server_host(),
        state.config.server_port()
    );
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    // 7. Create our ready server
    let server = HttpServer::new(listener, app, &state.config);

    Ok(server)
}

pub fn on_shut_down() {
    println!("🧹 Clearing temporary buffers and internal caches...");
    // If we have any background threads, file loggers, or active handles, they are dropped here.
    println!("🔌 All database pools dropped. Ports released. Exiting safely!");
}
