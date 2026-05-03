import { ExternalLink, GitBranch, Star, Loader2 } from 'lucide-react';
import { useProfileData } from '../api/queries';

export default function PublicProfile() {
  const { data, isLoading } = useProfileData('1'); // Mock ID

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen pb-12">
      {/* Banner / Header */}
      <div className="h-64 bg-gradient-to-br from-blue-600/10 via-gray-100 dark:via-gray-900 to-gray-50 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-end p-8">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-900 flex flex-col items-center justify-center border-2 border-blue-600 shadow-lg">
            <span className="text-2xl font-bold text-blue-600">{data.score}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">Score</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold">{data.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">{data.title}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column (Stats & Skills) */}
        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <h3 className="font-semibold mb-4 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">GitHub Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><GitBranch className="w-4 h-4 text-emerald-500" /> <span>Commits (1yr)</span></div>
                <span className="font-mono font-medium">{data.stats.commits.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> <span>Stars Earned</span></div>
                <span className="font-mono font-medium">{data.stats.stars.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Projects & Milestones) */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Verified Projects</h2>
          
          {data.verifiedProjects.map(project => (
            <div key={project.id} className="glass rounded-xl p-6 group cursor-pointer hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    {project.name} <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-full text-xs font-semibold">100% Verified</span>
              </div>
              <div className="flex gap-2">
                {project.stack.map(tech => (
                  <span key={tech} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{tech}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
