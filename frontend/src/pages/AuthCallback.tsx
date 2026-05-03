import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('No authorization code found.');
      return;
    }

    // Exchange code for token with the backend
    apiClient.post('/auth/github', { code })
      .then(response => {
        const token = response.data.token;
        if (token) {
          localStorage.setItem('token', token);
          navigate('/dashboard', { replace: true });
        } else {
          setError('Invalid response from server.');
        }
      })
      .catch(err => {
        console.error('Auth error:', err);
        setError('Authentication failed. Please try again.');
      });
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-error">
        <div className="text-center">
          <p>{error}</p>
          <button onClick={() => navigate('/auth')} className="mt-4 text-primary underline">Return to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-on-surface">
      <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
      <p>Authenticating securely...</p>
    </div>
  );
}
