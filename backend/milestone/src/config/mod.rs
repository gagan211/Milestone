use serde::Deserialize;
use std::fs;
use std::path::Path;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("Failed to read config file: {0}")]
    ReadFailed(#[source] std::io::Error),
    #[error("Failed to parse config YAML: {0}")]
    ParseFailed(#[source] serde_yaml::Error),
}

// Keep these helper structs completely PRIVATE (no `pub`)
#[derive(Debug, Deserialize, Clone)]
struct ServerConfig {
    host: String,
    port: u16,
    base_path: String,
    cors_allowed_origins: Vec<String>,
}

#[derive(Debug, Deserialize, Clone)]
struct DatabaseConfig {
    url: String,
    max_connections: u32,
}

#[derive(Debug, Deserialize, Clone)]
struct RedisConfig {
    url: String,
}

#[derive(Debug, Deserialize, Clone)]
struct JwtConfig {
    secret: String,
    expiration_hours: u64,
}

#[derive(Debug, Deserialize, Clone)]
struct GitHubConfig {
    client_id: String,
    client_secret: String,
    api_url: String,
    login_url: String,
}

#[derive(Debug, Deserialize, Clone)]
struct AuthConfig {
    jwks_url: String,
    jwt: JwtConfig,
    github: GitHubConfig,
}

#[derive(Debug, Deserialize, Clone)]
struct EmailConfig {
    resend_api_key: String,
    from_email: String,
}

// AppConfig is the ONLY public struct exposed by this module
#[derive(Debug, Deserialize, Clone)]
pub struct AppConfig {
    server: ServerConfig,
    database: DatabaseConfig,
    redis: RedisConfig,
    auth: AuthConfig,
    email: EmailConfig,
}

impl AppConfig {
    // Public constructor to load the YAML file
    pub fn load() -> Result<Self, ConfigError> {
        let config_path = Path::new("config.yaml");
        let content = fs::read_to_string(config_path).map_err(ConfigError::ReadFailed)?;
        let config: AppConfig = serde_yaml::from_str(&content).map_err(ConfigError::ParseFailed)?;
        Ok(config)
    }

    // --- Clean Public Getters ---

    pub fn server_host(&self) -> &str {
        &self.server.host
    }

    pub fn server_port(&self) -> u16 {
        self.server.port
    }

    pub fn base_path(&self) -> &str {
        &self.server.base_path
    }

    pub fn cors_allowed_origins(&self) -> &[String] {
        &self.server.cors_allowed_origins
    }

    pub fn database_url(&self) -> &str {
        &self.database.url
    }

    pub fn max_db_conn(&self) -> u32 {
        self.database.max_connections
    }

    pub fn redis_url(&self) -> &str {
        &self.redis.url
    }

    pub fn jwks_url(&self) -> &str {
        &self.auth.jwks_url
    }

    pub fn jwt_secret(&self) -> &str {
        &self.auth.jwt.secret
    }

    pub fn jwt_expiration_hours(&self) -> u64 {
        self.auth.jwt.expiration_hours
    }

    pub fn github_client_id(&self) -> &str {
        &self.auth.github.client_id
    }

    pub fn github_client_secret(&self) -> &str {
        &self.auth.github.client_secret
    }
    
    pub fn github_api_url(&self) -> &str {
        &self.auth.github.api_url
    }

    pub fn github_login_url(&self) -> &str {
        &self.auth.github.login_url
    }


    pub fn resend_api_key(&self) -> &str {
        &self.email.resend_api_key
    }

    pub fn from_email(&self) -> &str {
        &self.email.from_email
    }
}
