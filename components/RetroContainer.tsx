import React from 'react';

interface ContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

// Renamed internally to Container to reflect modern style, though file is RetroContainer
export const RetroContainer: React.FC<ContainerProps> = ({ 
  title, 
  children, 
  className = "",
  action
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          {title && <h2 className="font-semibold text-slate-800 text-lg">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};
