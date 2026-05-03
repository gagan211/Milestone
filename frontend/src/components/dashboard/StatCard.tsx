import React from 'react';
import { Glass } from '../ui/Glass';

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  role: 'developer' | 'client';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, description }) => {
  const dashArray = 389.5;
  const dashOffset = dashArray - (dashArray * value) / 100;

  return (
    <Glass className="rounded-2xl p-8 flex flex-col items-center justify-center space-y-6">
      <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
        {label}
      </h2>
      <div className="relative w-36 h-36 flex items-center justify-center rounded-full border-[10px] border-gray-100 dark:border-gray-800">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r="62"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-blue-600"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="text-5xl font-extrabold text-blue-600">{value}</span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium">
        {description}
      </p>
    </Glass>
  );
};
