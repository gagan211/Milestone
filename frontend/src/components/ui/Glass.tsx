import React from 'react';

interface GlassProps {
  children: React.ReactNode;
  className?: string;
}

export const Glass: React.FC<GlassProps> = ({ children, className = '' }) => (
  <div className={`glass border border-white/20 dark:border-white/10 shadow-xl backdrop-blur-md ${className}`}>
    {children}
  </div>
);
