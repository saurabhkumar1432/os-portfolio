import { useReduceMotion } from '../../hooks/useReduceMotion';

interface AppLoadingSpinnerProps {
  appName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AppLoadingSpinner({ appName = 'Application', size = 'md' }: AppLoadingSpinnerProps) {
  const reduceMotion = useReduceMotion();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          border-2 border-gray-300 border-t-blue-600 rounded-full
          ${reduceMotion ? '' : 'animate-spin'}
        `}
        role="status"
        aria-label={`Loading ${appName}`}
      />
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Loading {appName}...
      </p>
    </div>
  );
}

export default AppLoadingSpinner;