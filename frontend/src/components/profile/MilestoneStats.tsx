import React from 'react';
import { Target, FolderKanban } from 'lucide-react';

interface MilestoneStatsProps {
  totalMilestonesVerified: number;
  activeProjects: number;
}

export const MilestoneStats: React.FC<MilestoneStatsProps> = ({ totalMilestonesVerified, activeProjects }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Total Milestones */}
      <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10 flex flex-col justify-between">
        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Target className="w-6 h-6" />
          </div>
          <span className="font-semibold text-sm uppercase tracking-wider">Milestones Verified</span>
        </div>
        <div>
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {totalMilestonesVerified.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Active Projects */}
      <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10 flex flex-col justify-between">
        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FolderKanban className="w-6 h-6" />
          </div>
          <span className="font-semibold text-sm uppercase tracking-wider">Active Projects</span>
        </div>
        <div>
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {activeProjects.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
