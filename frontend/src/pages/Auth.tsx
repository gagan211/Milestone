import { LogIn, Code2 } from 'lucide-react';

export default function Auth() {
  const handleGithubLogin = () => {
    // In production, this client_id should come from env
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'your_dev_client_id';
    const redirectUri = window.location.origin + '/auth/callback';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user user:email`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-8 relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center relative">
          <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
            <Code2 className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="relative">
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Milestone</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Sign in to access your developer portfolio and manage your trust score.
          </p>
        </div>

        <button 
          onClick={handleGithubLogin}
          className="relative w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white transition-all rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Code2 className="w-5 h-5" />
          Continue with GitHub
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 relative">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
