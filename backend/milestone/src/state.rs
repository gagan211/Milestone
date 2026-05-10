use crate::config::AppConfig;
use crate::db::Database;
use std::sync::Arc;
use jsonwebtoken::jwk::JwkSet;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<AppConfig>,
    pub db: Database,
    pub jwk_set: Arc<JwkSet>,
}

impl AppState {
    pub fn new(config: AppConfig, db: Database, jwk_set: JwkSet) -> Self {
        Self {
            config: Arc::new(config),
            db,
            jwk_set: Arc::new(jwk_set),
        }
    }
}
