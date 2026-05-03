import React from 'react';
import { Target, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

interface ProjectItemProps {
  project: {
    id: string;
    name: string;
    progress: number;
    status: string;
    clientName?: string;
    devName?: string;
    verificationStatus?: 'pending' | 'verified' | 'failed';
  };
  role: 'developer' | 'client';
}

export const ProjectItem: React.FC<ProjectItemProps> = ({ project, role }) => {
  const getStatusIcon = () => {
    if (project.verificationStatus === 'pending') return <Clock className="w-6 h-6 text-yellow-500" />;
    if (project.status === 'On Track') return <Target className="w-6 h-6 text-blue-600" />;
    return <AlertCircle className="w-6 h-6 text-orange-500" />;
  };

  const getStatusColor = () => {
    if (project.verificationStatus === 'pending') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (project.status === 'On Track') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  };

  return (
    <div className="group p-5 bg-white/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-500/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/10 rounded-xl">
            {getStatusIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{project.name}</h3>
              {project.verificationStatus === 'verified' && <ShieldCheck className="w-4 h-4 text-blue-500" />}
            </div>
            <p className="text-sm text-gray-500">
              {role === 'developer' 
                ? `Client: ${project.clientName}` 
                : `Developer: ${project.devName || 'Assigned'}`}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor()}`}>
          {project.verificationStatus === 'pending' ? 'Verifying...' : project.status}
        </span>
      </div>
      
      <ProgressBar progress={project.progress} status={project.status} />
      
      {project.verificationStatus === 'pending' && (
        <p className="text-[10px] text-yellow-600 dark:text-yellow-400 mt-2 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Background verification in progress...
        </p>
      )}
    </div>
  );
};
