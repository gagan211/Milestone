use crate::db::Database;
use crate::dto::project_dto::{DashboardResponse, ProjectProgress, ProjectResponse, MilestoneDetail};
use sqlx::{Pool, Postgres, Row};
use uuid::Uuid;

// Load our queries at compile-time directly from our dedicated SQL files!
const CHECK_IS_DEVELOPER: &str = include_str!("../../queries/check_is_developer.sql");
const GET_DEVELOPER_DASHBOARD: &str = include_str!("../../queries/get_developer_dashboard.sql");
const GET_DEVELOPER_TRUST_SCORE: &str = include_str!("../../queries/get_developer_trust_score.sql");
const GET_CLIENT_DASHBOARD: &str = include_str!("../../queries/get_client_dashboard.sql");
const GET_CLIENT_TRUST_SCORE: &str = include_str!("../../queries/get_client_trust_score.sql");
const INSERT_PROJECT: &str = include_str!("../../queries/insert_project.sql");
const INSERT_MILESTONE: &str = include_str!("../../queries/insert_milestone.sql");
const GET_PROJECT_TIMELINE: &str = include_str!("../../queries/get_project_timeline.sql");

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

    /// Persists a new project and seeds it with default milestones in a single transaction.
    pub async fn link_repository(
        db: &Database,
        user_id: Uuid,
        repo_info: &crate::verification::github::GitHubRepoInfo,
        repo_details: &crate::dto::project_dto::GitHubRepoDetails,
        client_id: Option<Uuid>,
    ) -> Result<Uuid, sqlx::Error> {
        let pool = db.get_conn();
        
        // 1. Check if already linked
        let existing = sqlx::query("SELECT id FROM public.projects WHERE user_id = $1 AND github_repo_id = $2")
            .bind(user_id)
            .bind(repo_details.id)
            .fetch_optional(pool)
            .await?;
            
        if let Some(row) = existing {
            return Ok(row.get("id"));
        }

        let mut tx = pool.begin().await?;

        // 1. Insert the project
        let project_id = Uuid::new_v4();
        sqlx::query(INSERT_PROJECT)
            .bind(project_id)
            .bind(user_id)
            .bind(client_id)
            .bind(repo_details.id)
            .bind(&repo_info.owner)
            .bind(&repo_info.repo)
            .bind(&repo_details.description)
            .bind(true) // is_active
            .execute(&mut *tx)
            .await?;

        // 2. Seed default milestones
        let defaults = vec![
            (
                "Project Discovery",
                "Initial planning, requirement gathering, and repository setup.",
            ),
            (
                "Core Development",
                "Implementation of the primary feature set and business logic.",
            ),
            (
                "Final Delivery & Handover",
                "Quality assurance, final review, and documentation hand-off.",
            ),
        ];

        for (title, desc) in defaults {
            sqlx::query(INSERT_MILESTONE)
                .bind(Uuid::new_v4())
                .bind(project_id)
                .bind(title)
                .bind(desc)
                .bind("pending")
                .execute(&mut *tx)
                .await?;
        }

        tx.commit().await?;
        Ok(project_id)
    }

    /// Fetches details for a specific project, validating that it belongs to the user
    pub async fn get_project_details(
        db: &Database,
        project_id: Uuid,
        user_id: Uuid,
    ) -> Result<Option<ProjectResponse>, sqlx::Error> {
        let pool = db.get_conn();
        let rows = sqlx::query(GET_PROJECT_TIMELINE)
            .bind(project_id)
            .bind(user_id)
            .fetch_all(pool)
            .await?;

        if rows.is_empty() {
            return Ok(None);
        }

        let first_row = &rows[0];
        let id: String = first_row.get("id");
        let name: String = first_row.get("name");
        let description: Option<String> = first_row.get("description");
        let is_active: bool = first_row.get("is_active");
        let status = if is_active { "Active".to_string() } else { "Inactive".to_string() };

        let mut milestones = Vec::new();
        for row in rows {
            if let Some(m_id) = row.get::<Option<String>, _>("milestone_id") {
                milestones.push(MilestoneDetail {
                    id: m_id,
                    title: row.get("milestone_title"),
                    description: row.get("milestone_description"),
                    status: row.get("milestone_status"),
                    completed_at: row.get("milestone_completed_at"),
                });
            }
        }

        Ok(Some(ProjectResponse {
            id,
            name,
            description,
            status,
            milestones,
        }))
    }
}
