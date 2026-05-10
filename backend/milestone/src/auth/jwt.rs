use crate::state::AppState;
use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{StatusCode, header, request::Parts},
};
use jsonwebtoken::{DecodingKey, Validation, Algorithm, decode};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,
    pub email: Option<String>,
    pub exp: usize,
    pub role: Option<String>,
}

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub user_id: String,
    pub email: Option<String>,
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
                // To allow testing with empty db connection, returning error message
            )
        })?;

        Ok(AuthenticatedUser {
            user_id: token_data.claims.sub,
            email: token_data.claims.email,
        })
    }
}
