use sqlx::postgres::{PgPool, PgPoolOptions};
use std::time::Duration;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum DataBaseError {
    #[error("FALIED TO CONNECT TO PSQL: {0}")]
    ConnectionFailed(#[source] sqlx::Error),
    #[error("Database Query Failed: {0}")]
    QueryFailed(#[source] sqlx::Error),
    #[error("Failed to Run Database Migration: {0}")]
    MigrationFailed(#[source] sqlx::migrate::MigrateError),
}

#[derive(Debug, Clone)]
pub struct Database {
    pool: PgPool,
}

impl Database {
    pub async fn new(url: &str, max_conn: u32) -> Result<Self, DataBaseError> {
        let db = Self::connect(url, max_conn).await?;
        // db.run_migrations().await?;
        Ok(db)
    }

    async fn connect(url: &str, max_conn: u32) -> Result<Self, DataBaseError> {
        let pool = PgPoolOptions::new()
            .max_connections(max_conn)
            .min_connections(2)
            .acquire_timeout(Duration::from_secs(3))
            .idle_timeout(Duration::from_secs(600))
            .connect(url)
            .await
            .map_err(DataBaseError::ConnectionFailed)?;
        Ok(Self { pool })
    }

    pub fn get_conn(&self) -> &PgPool {
        &self.pool
    }

    pub async fn health_check(&self) -> Result<(), DataBaseError> {
        sqlx::query("SELECT 1")
            .execute(&self.pool)
            .await
            .map_err(DataBaseError::QueryFailed)?;
        Ok(())
    }

    async fn run_migrations(&self) -> Result<(), DataBaseError> {
        sqlx::migrate!("./migrations")
            .run(&self.pool)
            .await
            .map_err(DataBaseError::MigrationFailed)?;
        Ok(())
    }
}
