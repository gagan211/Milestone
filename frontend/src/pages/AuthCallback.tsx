import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase client automatically handles the OAuth callback hash in the URL
    // We just need to wait for the session to be established
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error.message);
      } else if (session) {
        // Once logged in, redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Fallback: listen for auth state change if session isn't immediately ready
        const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (event === 'SIGNED_IN' && newSession) {
            navigate('/dashboard', { replace: true });
          }
        });
        
        // Timeout
        setTimeout(() => {
           setError("Authentication timeout or no session established. Please try again.");
        }, 5000);

        return () => {
          authListener.subscription.unsubscribe();
        };
      }
    });
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-red-500">
        <div className="text-center">
          <p>{error}</p>
          <button onClick={() => navigate('/auth')} className="mt-4 text-blue-500 underline">Return to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-gray-800 dark:text-gray-200">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
      <p>Authenticating securely...</p>
    </div>
  );
}
