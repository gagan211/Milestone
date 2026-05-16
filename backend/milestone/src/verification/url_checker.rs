use thiserror::Error;

#[derive(Debug, Error)]
pub enum ValidationError {
    #[error("Invalid Url Format: {0}")]
    InvalidFormat(String),
    #[error("Unsupported platform: {0}. We currently only support GitHub.")]
    UnsupportedPlatform(String),
    #[error("Missing component in URL: {0}")]
    MissingComponent(String),
}
pub trait PlatformValidator {
    type Info;
    fn validate(url: &str) -> Result<Self::Info, ValidationError>;
}
