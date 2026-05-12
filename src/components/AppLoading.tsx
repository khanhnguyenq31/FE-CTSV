import React from 'react';

interface AppLoadingProps {
  loading?: boolean;
  children?: React.ReactNode;
  tip?: string;
  className?: string;
  overlay?: boolean;
}

const AppLoading: React.FC<AppLoadingProps> = ({ 
  loading, 
  children, 
  tip, 
  className = '',
  overlay = true 
}) => {
  if (!loading) return <>{children}</>;

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="premium-spinner" />
      {tip && <span className="text-blue-500 font-medium animate-pulse">{tip}</span>}
    </div>
  );

  if (!children || !overlay) return spinner;

  return (
    <div className="relative w-full h-full min-h-[100px]">
      {children}
      <div className="premium-loading-overlay">
        {spinner}
      </div>
    </div>
  );
};

export default AppLoading;
