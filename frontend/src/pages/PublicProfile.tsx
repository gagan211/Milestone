import { GitBranch, Star, Loader2, Globe, Mail, MessageSquare } from 'lucide-react';
import { useProfileData } from '../api/queries';
import { useParams } from 'react-router-dom';
import { ProfileRenderer } from '../components/profile/ProfileRenderer';
import { TrustScoreGauge } from '../components/profile/TrustScoreGauge';
import { MilestoneStats } from '../components/profile/MilestoneStats';

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { data, isLoading, error } = useProfileData(userId ?? '');

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
          Failed to load public profile. Please try again.
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen pb-12">
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column / Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Avatar and Basic Info */}
          <div className="glass rounded-3xl p-8 border border-white/20 dark:border-white/10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-4 border-white dark:border-gray-950 shadow-xl mb-6 flex items-center justify-center overflow-hidden">
                <span className="text-4xl font-bold text-gray-400">
                  {data.name.charAt(0)}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{data.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">{data.title}</p>
              
              <div className="flex gap-4 mt-8">
                <a href="#" className="p-3 bg-gray-50 dark:bg-gray-900 rounded-full hover:scale-110 transition-transform text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-800">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="p-3 bg-gray-50 dark:bg-gray-900 rounded-full hover:scale-110 transition-transform text-blue-600 hover:text-blue-700 border border-blue-100 dark:border-gray-800">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="#" className="p-3 bg-gray-50 dark:bg-gray-900 rounded-full hover:scale-110 transition-transform text-sky-500 hover:text-sky-600 border border-sky-100 dark:border-gray-800">
                  <MessageSquare className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bento Stats */}
          <TrustScoreGauge score={data.score} />
          <MilestoneStats 
            totalMilestonesVerified={data.stats.totalMilestonesVerified} 
            activeProjects={data.stats.activeProjects} 
          />

          <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10">
            <h3 className="font-semibold mb-4 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">GitHub Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><GitBranch className="w-4 h-4 text-emerald-500" /> <span className="font-medium text-gray-700 dark:text-gray-300">Commits (1yr)</span></div>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{data.stats.commits.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><Star className="w-4 h-4 text-amber-500" /> <span className="font-medium text-gray-700 dark:text-gray-300">Stars Earned</span></div>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{data.stats.stars.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column / Main Dynamic Content */}
        <div className="lg:col-span-8">
          {data.profile_data?.layout ? (
            <ProfileRenderer layout={data.profile_data.layout} />
          ) : (
            <div className="py-20 text-center space-y-4">
              <p className="text-gray-500 dark:text-gray-400">Profile layout has not been configured yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
