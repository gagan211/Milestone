import React from 'react';

interface ProgressBarProps {
  progress: number;
  status?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, status, className = '' }) => {
  const isAtRisk = status === 'At Risk';
  
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${isAtRisk ? 'bg-orange-500' : 'bg-blue-600'}`} 
          style={{ width: `${progress}%` }} 
        />
      </div>
      <span className="text-sm font-bold min-w-[3rem] text-right">{progress}%</span>
    </div>
  );
};
