import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef(false);

  useEffect(() => {
    let active = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const syncUserAndRedirect = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (session) {
          if (!active) return;
          const intendedRole = localStorage.getItem('intendedRole') || 'developer';
          
          const handleSuccessRedirect = () => {
            const pendingLink = sessionStorage.getItem("pending_repo_link");
            if (pendingLink) {
              sessionStorage.removeItem("pending_repo_link");
              navigate('/dashboard', { replace: true, state: { action: 'link_repo', repoUrl: pendingLink } });
            } else {
              navigate('/dashboard', { replace: true });
            }
          };
          
          // Call backend to sync profile
          await apiClient.post(API_ENDPOINTS.auth.sync, { 
            role: intendedRole,
            githubAccessToken: session.provider_token 
          });
          
          localStorage.removeItem('intendedRole');
          handleSuccessRedirect();
        } else {
          // Listen for session completion
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (event === 'SIGNED_IN' && newSession && active) {
              try {
                const intendedRole = localStorage.getItem('intendedRole') || 'developer';
                await apiClient.post(API_ENDPOINTS.auth.sync, { 
                  role: intendedRole,
                  githubAccessToken: newSession.provider_token
                });
                localStorage.removeItem('intendedRole');
                
                const pendingLink = sessionStorage.getItem("pending_repo_link");
                if (pendingLink) {
                  sessionStorage.removeItem("pending_repo_link");
                  navigate('/dashboard', { replace: true, state: { action: 'link_repo', repoUrl: pendingLink } });
                } else {
                  navigate('/dashboard', { replace: true });
                }
              } catch (err: any) {
                if (active) {
                  errorRef.current = true;
                  setError(err.response?.data || err.message || "Failed to synchronize profile.");
                }
              }
            }
          });
          authSubscription = subscription;

          // Timeout 
          setTimeout(() => {
            if (active && !errorRef.current) {
              errorRef.current = true;
              setError("Authentication timeout. Please try logging in again.");
            }
          }, 8000);
        }
      } catch (err: any) {
        if (active) {
          errorRef.current = true;
          setError(err.response?.data || err.message || "Failed to synchronize user.");
        }
      }
    };

    syncUserAndRedirect();

    return () => {
      active = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-red-500">
        <div className="text-center p-6 glass max-w-md rounded-2xl border border-red-500/20">
          <p className="font-semibold text-lg mb-2">Sync Error</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <button 
            onClick={() => navigate('/auth')} 
            className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-all"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-gray-800 dark:text-gray-200">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
      <p className="text-lg font-semibold">Creating your secure workspace...</p>
      <p className="text-sm text-gray-500 mt-1">Synchronizing profile credentials...</p>
    </div>
  );
}
