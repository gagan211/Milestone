import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDashboardData } from '../api/queries';
import { StatCard } from '../components/dashboard/StatCard';
import { ProjectItem } from '../components/dashboard/ProjectItem';
import { LinkRepoModal } from '../components/dashboard/LinkRepoModal';
import { Loader2, FolderGit2 } from 'lucide-react';
import { supabase } from '../api/supabase';
import Navbar from '../components/layout/Navbar';

export default function Dashboard() {
  const { data, isLoading, error } = useDashboardData();
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [initialRepoUrl, setInitialRepoUrl] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (location.state?.action === 'link_repo') {
      setIsLinkModalOpen(true);
      if (location.state?.repoUrl) {
        setInitialRepoUrl(location.state.repoUrl);
      }
      // Clear the state so it doesn't reopen on refresh
      navigate('.', { replace: true, state: {} });
    }
  }, [location, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 font-semibold p-6 glass max-w-md rounded-2xl border border-red-500/20 text-center">
          Failed to load dashboard. Please try again.
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black/20 pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              {data.role === 'developer' ? 'Developer Dashboard' : 'Client Dashboard'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              {data.role === 'developer' 
                ? 'Manage your assignments and verify contributions.' 
                : 'Track progress across your active contracts.'}
            </p>
          </div>
          {data.role === 'developer' && (
            <button 
              onClick={() => setIsLinkModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-2"
            >
              Link Repository
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Column */}
          <div className="flex flex-col gap-4">
            <StatCard 
              label={data.role === 'developer' ? 'Your Trust Score' : 'Overall Project Health'}
              value={data.trustScore}
              description={data.role === 'developer' ? 'Top 15% of Contributors' : 'Verified completion rate'}
            />
            {data.role === 'developer' && userId && (
              <Link 
                to={`/profile/${userId}`}
                className="text-sm text-blue-600 hover:underline font-medium self-end px-2"
              >
                View Public Profile →
              </Link>
            )}
          </div>

          {/* Active Projects List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {data.role === 'developer' ? 'Assigned Projects' : 'Active Contracts'}
              </h2>
              <span className="px-4 py-1.5 bg-white dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-400 border border-gray-100 dark:border-gray-800">
                {data.activeProjects.length} ACTIVE
              </span>
            </div>
            
            {data.activeProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-3xl text-center space-y-6 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                  <FolderGit2 className="h-8 w-8" />
                </div>
                <div className="max-w-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">No active projects</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {data.role === 'developer' 
                      ? "Get started by linking your first GitHub repository to track and verify your milestones."
                      : "You don't have any active project contracts with developers yet."}
                  </p>
                </div>
                {data.role === 'developer' && (
                  <button
                    onClick={() => setIsLinkModalOpen(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    Link First Repository
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {data.activeProjects.map((project) => (
                  <ProjectItem 
                    key={project.id} 
                    project={project} 
                    role={data.role} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <LinkRepoModal 
        isOpen={isLinkModalOpen} 
        onClose={() => {
          setIsLinkModalOpen(false);
          setInitialRepoUrl('');
        }}
        onSuccess={() => {
          setIsLinkModalOpen(false);
          setInitialRepoUrl('');
        }}
        initialRepoUrl={initialRepoUrl}
      />
    </div>
  );
}

