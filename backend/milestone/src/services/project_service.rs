use crate::db::Database;
use crate::dto::project_dto::{DashboardResponse, ProjectProgress};
use sqlx::{Pool, Postgres, Row};
use uuid::Uuid;

// Load our queries at compile-time directly from our dedicated SQL files!
const CHECK_IS_DEVELOPER: &str = include_str!("../../queries/check_is_developer.sql");
const GET_DEVELOPER_DASHBOARD: &str = include_str!("../../queries/get_developer_dashboard.sql");
const GET_DEVELOPER_TRUST_SCORE: &str = include_str!("../../queries/get_developer_trust_score.sql");
const GET_CLIENT_DASHBOARD: &str = include_str!("../../queries/get_client_dashboard.sql");
const GET_CLIENT_TRUST_SCORE: &str = include_str!("../../queries/get_client_trust_score.sql");

pub struct ProjectService;

impl ProjectService {
    /// Coordinates and builds the custom dashboard feed for the authenticated user
    pub async fn get_dashboard_data(
        db: &Database,
        user_id: Uuid,
    ) -> Result<DashboardResponse, sqlx::Error> {
        let pool = db.get_conn();

        // 1. Determine user role
        let is_dev_user = Self::is_developer(pool, user_id).await?;
        let role_name = if is_dev_user { "developer" } else { "client" };

        // 2. Fetch role-specific projects and scores with explicit variables
        let (project_list, score_value) = if is_dev_user {
            let dev_id = user_id;
            let dev_projects = Self::fetch_developer_projects(pool, dev_id).await?;
            let dev_score = Self::calculate_developer_score(pool, dev_id).await?;
            (dev_projects, dev_score)
        } else {
            let client_id = user_id;
            let client_projects = Self::fetch_client_projects(pool, client_id).await?;
            let client_score = Self::calculate_client_score(pool, client_id).await?;
            (client_projects, client_score)
        };

        Ok(DashboardResponse {
            role: role_name.to_string(),
            trust_score: score_value,
            active_projects: project_list,
        })
    }

    // --- Private Helper Abstractions ---

    /// Checks if a UUID is a registered developer
    async fn is_developer(pool: &Pool<Postgres>, user_id: Uuid) -> Result<bool, sqlx::Error> {
        let row = sqlx::query(CHECK_IS_DEVELOPER)
            .bind(user_id)
            .fetch_one(pool)
            .await?;
        Ok(row.get::<bool, _>(0))
    }

    /// Fetches all projects assigned to a developer
    async fn fetch_developer_projects(
        pool: &Pool<Postgres>,
        developer_id: Uuid,
    ) -> Result<Vec<ProjectProgress>, sqlx::Error> {
        let rows = sqlx::query(GET_DEVELOPER_DASHBOARD)
            .bind(developer_id)
            .fetch_all(pool)
            .await?;

        let mut projects = Vec::with_capacity(rows.len());
        for row in rows {
            projects.push(ProjectProgress {
                id: row.get("project_id"),
                name: row.get("repo_name"),
                progress: row.get::<f64, _>("progress"),
                status: "Active".to_string(),
                client_name: row.get::<Option<String>, _>("client_name"),
                dev_name: None,
            });
        }
        Ok(projects)
    }

    /// Calculates a developer's real-time Trust Score
    async fn calculate_developer_score(
        pool: &Pool<Postgres>,
        developer_id: Uuid,
    ) -> Result<i32, sqlx::Error> {
        let row = sqlx::query(GET_DEVELOPER_TRUST_SCORE)
            .bind(developer_id)
            .fetch_one(pool)
            .await?;

        let avg_completion = row.get::<f64, _>("average_completion");
        Ok(avg_completion.round() as i32)
    }

    /// Fetches all active projects authorized for a client
    async fn fetch_client_projects(
        pool: &Pool<Postgres>,
        client_id: Uuid,
    ) -> Result<Vec<ProjectProgress>, sqlx::Error> {
        let rows = sqlx::query(GET_CLIENT_DASHBOARD)
            .bind(client_id)
            .fetch_all(pool)
            .await?;

        let mut projects = Vec::with_capacity(rows.len());
        for row in rows {
            projects.push(ProjectProgress {
                id: row.get("project_id"),
                name: row.get("repo_name"),
                progress: row.get::<f64, _>("progress"),
                status: "Active".to_string(),
                client_name: None,
                dev_name: row.get::<Option<String>, _>("dev_name"),
            });
        }
        Ok(projects)
    }

    /// Calculates a client's aggregated trust score across active developers
    async fn calculate_client_score(
        pool: &Pool<Postgres>,
        client_id: Uuid,
    ) -> Result<i32, sqlx::Error> {
        let row = sqlx::query(GET_CLIENT_TRUST_SCORE)
            .bind(client_id)
            .fetch_one(pool)
            .await?;

        let avg_score = row.get::<f64, _>("avg_score");
        Ok(avg_score.round() as i32)
    }
}
