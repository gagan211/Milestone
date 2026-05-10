import { useState } from 'react';
import { useDashboardData } from '../api/queries';
import { StatCard } from '../components/dashboard/StatCard';
import { ProjectItem } from '../components/dashboard/ProjectItem';
import { LinkRepoModal } from '../components/dashboard/LinkRepoModal';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { data, isLoading } = useDashboardData();
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen p-8 bg-gray-50/50 dark:bg-black/20">
      <div className="max-w-7xl mx-auto space-y-8">
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
          {/* Stats Card */}
          <StatCard 
            label={data.role === 'developer' ? 'Your Trust Score' : 'Overall Project Health'}
            value={data.trustScore}
            description={data.role === 'developer' ? 'Top 15% of Contributors' : 'Verified completion rate'}
            role={data.role}
          />

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
            
            <div className="grid grid-cols-1 gap-4">
              {data.activeProjects.map((project) => (
                <ProjectItem 
                  key={project.id} 
                  project={project} 
                  role={data.role} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <LinkRepoModal 
        isOpen={isLinkModalOpen} 
        onClose={() => setIsLinkModalOpen(false)}
        onSuccess={(url) => {
          console.log('Linked repo:', url);
          // In real app, we would refetch queries here
        }}
      />
    </div>
  );
}
