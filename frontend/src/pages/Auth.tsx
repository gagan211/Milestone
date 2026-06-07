import { Code2, Building2 } from 'lucide-react';
import { supabase } from '../api/supabase';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

export default function Auth() {
  const location = useLocation();

  const handleLogin = async (provider: 'github' | 'google', role: 'developer' | 'client') => {
    // Store the intended role so we can use it in the callback
    localStorage.setItem('intendedRole', role);
    
    // Store redirect path if it exists
    if (location.state?.from) {
      localStorage.setItem('authRedirectPath', location.state.from);
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('Error logging in:', error.message);
      toast.error('Failed to login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-8 relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">Milestone</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Are you looking to be hired, or are you looking to hire?
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => handleLogin('github', 'developer')}
            className="relative w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white transition-all rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Code2 className="w-5 h-5" />
            I am a Developer (GitHub)
          </button>

          <button 
            onClick={() => handleLogin('google', 'client')}
            className="relative w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 text-gray-900 border border-gray-200 dark:border-gray-700 transition-all rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Building2 className="w-5 h-5" />
            I am a Client (Google)
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 relative">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
