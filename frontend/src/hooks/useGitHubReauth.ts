export function useGitHubReauth() {
  const reauthorize = (redirectUrl: string, pendingRepoUrl: string) => {
    // Store the original repo URL in sessionStorage so we can retry after OAuth callback
    sessionStorage.setItem('pending_repo_link', pendingRepoUrl);
    // Redirect to GitHub OAuth
    window.location.href = redirectUrl;
  };
  return { reauthorize };
}
