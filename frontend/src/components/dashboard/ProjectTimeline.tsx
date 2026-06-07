import React from 'react';
import { CheckCircle2, CircleDashed, Loader2, GitCommit, ShieldAlert } from 'lucide-react';
import type { ProjectData } from '../../api/queries';

interface ProjectTimelineProps {
  milestones: ProjectData['milestones'];
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ milestones }) => {
  return (
    <div className="relative pl-6">
      {/* Vertical Dashed Line */}
      <div className="absolute top-4 bottom-4 left-6 w-px border-l-2 border-dashed border-gray-200 dark:border-gray-800" />
      
      <div className="space-y-8">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="relative flex gap-6">
            {/* Status Node */}
            <div className="absolute -left-6 flex h-full items-start justify-center pt-1.5">
              <div className="z-10 bg-white dark:bg-gray-950 p-1">
                {milestone.status === 'verified' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-900/30" />
                )}
                {milestone.status === 'in_progress' && (
                  <div className="relative flex h-5 w-5 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
                  </div>
                )}
                {milestone.status === 'pending' && (
                  <CircleDashed className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                )}
                {milestone.status === 'failed' && (
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className={`flex-1 glass p-5 rounded-2xl border transition-colors ${
              milestone.status === 'in_progress' ? 'border-blue-500/30 bg-blue-500/5' :
              milestone.status === 'verified' ? 'border-emerald-500/20' :
              milestone.status === 'failed' ? 'border-red-500/20 bg-red-500/5' :
              'border-gray-200 dark:border-gray-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h3 className={`font-bold text-lg ${
                  milestone.status === 'in_progress' ? 'text-blue-700 dark:text-blue-400' :
                  milestone.status === 'verified' ? 'text-gray-900 dark:text-gray-100' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {milestone.title}
                </h3>
                {milestone.completedAt && (
                  <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                    {new Date(milestone.completedAt).toLocaleString()}
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {milestone.description}
              </p>

              {/* Status Specific Badges */}
              {milestone.status === 'in_progress' && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Code...
                </div>
              )}
              {milestone.status === 'verified' && milestone.commitHash && (
                <a 
                  href={`#`} // In a real app, link to the commit
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 rounded-lg text-sm font-mono"
                >
                  <GitCommit className="w-4 h-4" /> {milestone.commitHash.slice(0, 7)}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
