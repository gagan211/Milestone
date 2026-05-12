use crate::db::Database;
use crate::dto::auth_dto::{SyncUserPayload, SyncUserResponse};
use crate::auth::jwt::AuthenticatedUser;
use uuid::Uuid;

const SYNC_DEVELOPER_SQL: &str = include_str!("../../queries/sync_developer.sql");
const SYNC_CLIENT_SQL: &str = include_str!("../../queries/sync_client.sql");

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
        let email = authenticated_user.email.clone().unwrap_or_else(|| "no-email@milestone.app".to_string());

        if payload.role == "developer" {
            let github_username = authenticated_user.github_username.clone()
                .unwrap_or_else(|| email.split('@').next().unwrap_or("developer").to_string());
            
            let display_name = authenticated_user.display_name.clone()
                .unwrap_or_else(|| github_username.clone());

            sqlx::query(SYNC_DEVELOPER_SQL)
                .bind(user_uuid)
                .bind(email)
                .bind(github_username)
                .bind(authenticated_user.avatar_url.clone())
                .bind(display_name)
                .execute(pool)
                .await?;

            Ok(SyncUserResponse {
                status: "success".to_string(),
                message: "Developer synchronized successfully".to_string(),
                role: "developer".to_string(),
                user_id: authenticated_user.user_id.clone(),
            })
        } else {
            let contact_name = authenticated_user.display_name.clone()
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
}
