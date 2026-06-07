use crate::auth::jwt::AuthenticatedUser;
use crate::db::Database;
use crate::dto::auth_dto::{SyncUserPayload, SyncUserResponse};
use crate::models::user;
use sqlx::database;
use uuid::Uuid;

use crate::dto::profile_dto::{
    ProfileLayoutData, ProfileResponse, ProfileStats, UpdateProfilePayload,
};
const SYNC_DEVELOPER_SQL: &str = include_str!("../../queries/sync_developer.sql");
const SYNC_CLIENT_SQL: &str = include_str!("../../queries/sync_client.sql");
const GET_DEVELOPER_PROFILE: &str = include_str!("../../queries/get_developer_profile_full.sql");
const UPDATE_DEVELOPER_PROFILE: &str = include_str!("../../queries/update_developer_profile.sql");
pub struct UserService;

impl UserService {
    /// Synchronizes OAuth login identities with their respective postgres target tables
    pub async fn sync_user(
        db: &Database,
        authenticated_user: &AuthenticatedUser,
        payload: SyncUserPayload,
    ) -> Result<SyncUserResponse, sqlx::Error> {
        let pool = db.get_conn();
        let user_uuid = Uuid::parse_str(&authenticated_user.user_id).unwrap_or_default();
        let email = authenticated_user
            .email
            .clone()
            .unwrap_or_else(|| "no-email@milestone.app".to_string());

        if payload.role == "developer" {
            let github_username = authenticated_user
                .github_username
                .clone()
                .unwrap_or_else(|| email.split('@').next().unwrap_or("developer").to_string());

            let display_name = authenticated_user
                .display_name
                .clone()
                .unwrap_or_else(|| github_username.clone());

            sqlx::query(SYNC_DEVELOPER_SQL)
                .bind(user_uuid)
                .bind(email)
                .bind(github_username)
                .bind(authenticated_user.avatar_url.clone())
                .bind(display_name)
                .bind(payload.github_access_token)
                .execute(pool)
                .await?;

            Ok(SyncUserResponse {
                status: "success".to_string(),
                message: "Developer synchronized successfully".to_string(),
                role: "developer".to_string(),
                user_id: authenticated_user.user_id.clone(),
            })
        } else {
            let contact_name = authenticated_user
                .display_name
                .clone()
                .unwrap_or_else(|| email.split('@').next().unwrap_or("client").to_string());

            sqlx::query(SYNC_CLIENT_SQL)
                .bind(user_uuid)
                .bind(email)
                .bind(contact_name)
                .bind(authenticated_user.avatar_url.clone())
                .execute(pool)
                .await?;

            Ok(SyncUserResponse {
                status: "success".to_string(),
                message: "Client synchronized successfully".to_string(),
                role: "client".to_string(),
                user_id: authenticated_user.user_id.clone(),
            })
        }
    }
    pub async fn get_profile_by_id(
        db: &Database,
        user_id: Uuid,
    ) -> Result<Option<ProfileResponse>, sqlx::Error> {
        let pool = db.get_conn();
        let row = sqlx::query(GET_DEVELOPER_PROFILE)
            .bind(user_id)
            .fetch_optional(pool)
            .await?;
        if let Some(r) = row {
            use sqlx::Row;
            let profile_data_val: serde_json::Value = r.try_get("profile_data").unwrap_or_default();
            let profile_stats_val: serde_json::Value =
                r.try_get("profile_stats").unwrap_or_default();
            let profile_layout: ProfileLayoutData = serde_json::from_value(profile_data_val)
                .unwrap_or_else(|_| ProfileLayoutData { layout: vec![] });
            let stats: ProfileStats =
                serde_json::from_value(profile_stats_val).unwrap_or_else(|_| ProfileStats {
                    commits: 0,
                    stars: 0,
                    total_milestones_verified: 0,
                    active_projects: 0,
                });
            let name: String = r
                .try_get("display_name")
                .unwrap_or_else(|_| "Developer".to_string());
            let title: String = r
                .try_get("skills")
                .unwrap_or_else(|_| "Full-Stack Developer".to_string());
            let score_f: f64 = r.try_get("trust_score").unwrap_or(100.0);
            let score = score_f.round() as i32;
            Ok(Some(ProfileResponse {
                id: user_id.to_string(),
                name,
                title,
                score,
                stats,
                profile_data: profile_layout,
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn update_profile_data(
        db: &Database,
        user_id: Uuid,
        payload: UpdateProfilePayload,
    ) -> Result<(), sqlx::Error> {
        let pool = db.get_conn();
        let profile_json = serde_json::to_value(&payload.profile_data).unwrap_or_default();
        sqlx::query(UPDATE_DEVELOPER_PROFILE)
            .bind(profile_json)
            .bind(user_id)
            .execute(pool)
            .await?;
        Ok(())
    }
}
