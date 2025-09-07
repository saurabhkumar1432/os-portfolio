import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
  className?: string;
}

/**
 * Breadcrumb navigation component for file explorer
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  onNavigate,
  className = ''
}) => {
  return (
    <nav 
      className={`flex items-center space-x-1 text-sm ${className}`}
      aria-label="Breadcrumb navigation"
    >
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <ChevronRight 
              className="w-4 h-4 text-gray-400" 
              aria-hidden="true"
            />
          )}
          <button
            onClick={() => onNavigate(item.path)}
            className={`
              flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${index === items.length - 1 
                ? 'text-gray-900 dark:text-gray-100 font-medium' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }
            `}
            aria-current={index === items.length - 1 ? 'page' : undefined}
          >
            {index === 0 && item.name === 'Root' ? (
              <Home className="w-4 h-4" aria-label="Home" />
            ) : (
              <span>{item.name}</span>
            )}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};