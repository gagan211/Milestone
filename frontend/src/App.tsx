import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import PublicProfile from './pages/PublicProfile';
import ProjectDetail from './pages/ProjectDetail';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if ([401, 403].includes(error?.response?.status)) return false;
        return failureCount < 2;
      },
      staleTime: 60_000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/profile/:userId" 
            element={<PublicProfile />} 
          />
          <Route 
            path="/project/:id" 
            element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} 
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
