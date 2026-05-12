use crate::state::AppState;
use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{StatusCode, header, request::Parts},
};
use jsonwebtoken::{DecodingKey, Validation, Algorithm, decode};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserMetadata {
    pub avatar_url: Option<String>,
    pub user_name: Option<String>,
    pub preferred_username: Option<String>,
    pub full_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,
    pub email: Option<String>,
    pub exp: usize,
    pub role: Option<String>,
    pub user_metadata: Option<UserMetadata>,
}

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub user_id: String,
    pub email: Option<String>,
    pub avatar_url: Option<String>,
    pub github_username: Option<String>,
    pub display_name: Option<String>,
}

#[async_trait]
impl FromRequestParts<AppState> for AuthenticatedUser {
    type Rejection = (StatusCode, String);
    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get(header::AUTHORIZATION)
            .and_then(|value| value.to_str().ok())
            .ok_or_else(|| {
                (
                    StatusCode::UNAUTHORIZED,
                    "Missing Authorization header".to_string(),
                )
            })?;

        if !auth_header.starts_with("Bearer ") {
            return Err((
                StatusCode::UNAUTHORIZED,
                "Invalid authorization scheme (must be Bearer)".to_string(),
            ));
        }
        let token = &auth_header[7..];

        // Find the first verification key in our cached JWK set
        let jwk = state.jwk_set.keys.first().ok_or_else(|| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "No public verification keys cached in state".to_string(),
            )
        })?;

        let decoding_key = DecodingKey::from_jwk(jwk).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to build decoding key from JWK: {}", e),
            )
        })?;

        // Use ES256 validation with default audience check for Supabase ('authenticated')
        let mut validation = Validation::new(Algorithm::ES256);
        validation.set_audience(&["authenticated"]);

        let token_data = decode::<Claims>(token, &decoding_key, &validation).map_err(|e| {
            (
                StatusCode::UNAUTHORIZED,
                format!("Invalid or expired token: {}", e),
            )
        })?;

        let metadata = token_data.claims.user_metadata;
        let github_username = metadata.as_ref().and_then(|m| {
            m.preferred_username.clone().or_else(|| m.user_name.clone())
        });
        let avatar_url = metadata.as_ref().and_then(|m| m.avatar_url.clone());
        let display_name = metadata.as_ref().and_then(|m| m.full_name.clone());

        Ok(AuthenticatedUser {
            user_id: token_data.claims.sub,
            email: token_data.claims.email,
            avatar_url,
            github_username,
            display_name,
        })
    }
}
