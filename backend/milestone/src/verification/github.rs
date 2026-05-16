use crate::verification::url_checker::{PlatformValidator, ValidationError};

pub struct GitHubRepoInfo {
    pub owner: String,
    pub repo: String,
}
pub struct GitHubValidator;
impl PlatformValidator for GitHubValidator {
    type Info = GitHubRepoInfo;
    fn validate(url: &str) -> Result<Self::Info, ValidationError> {
        let sanitized = url.trim().trim_end_matches('/');
        if !sanitized.contains("github.com/") {
            return Err(ValidationError::UnsupportedPlatform("Github".into()));
        }
        let parts: Vec<&str> = sanitized.split("github.com/").collect();
        let path = parts
            .get(1)
            .ok_or_else(|| ValidationError::InvalidFormat("No Path".into()))?;

        let path_parts: Vec<&str> = path.split('/').collect();
        if path_parts.len() < 2 {
            return Err(ValidationError::MissingComponent("Owner/Repo".into()));
        }
        Ok(GitHubRepoInfo {
            owner: path_parts[0].to_string(),
            repo: path_parts[1]
                .split('?')
                .next()
                .unwrap_or(path_parts[1])
                .to_string(),
        })
    }
}
