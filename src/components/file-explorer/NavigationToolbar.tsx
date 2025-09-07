import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  RotateCcw,
  List,
  Grid3X3,

} from 'lucide-react';

interface NavigationToolbarProps {
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  canNavigateUp: boolean;
  viewMode: 'list' | 'grid';
  sortBy: 'name' | 'type' | 'modified';
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onNavigateUp: () => void;
  onRefresh: () => void;
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onSortChange: (sort: 'name' | 'type' | 'modified') => void;
  className?: string;
}

/**
 * Navigation toolbar for file explorer
 */
export const NavigationToolbar: React.FC<NavigationToolbarProps> = ({
  canNavigateBack,
  canNavigateForward,
  canNavigateUp,
  viewMode,
  sortBy,
  onNavigateBack,
  onNavigateForward,
  onNavigateUp,
  onRefresh,
  onViewModeChange,
  onSortChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Navigation buttons */}
      <div className="flex items-center space-x-1">
        <button
          onClick={onNavigateBack}
          disabled={!canNavigateBack}
          className={`
            p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
            transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${!canNavigateBack 
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
              : 'text-gray-700 dark:text-gray-300'
            }
          `}
          title="Back"
          aria-label="Navigate back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onNavigateForward}
          disabled={!canNavigateForward}
          className={`
            p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
            transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${!canNavigateForward 
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
              : 'text-gray-700 dark:text-gray-300'
            }
          `}
          title="Forward"
          aria-label="Navigate forward"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onNavigateUp}
          disabled={!canNavigateUp}
          className={`
            p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
            transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${!canNavigateUp 
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
              : 'text-gray-700 dark:text-gray-300'
            }
          `}
          title="Up"
          aria-label="Navigate up"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

        <button
          onClick={onRefresh}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
                   transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
                   text-gray-700 dark:text-gray-300"
          title="Refresh"
          aria-label="Refresh"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* View and sort options */}
      <div className="flex items-center space-x-1">
        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as 'name' | 'type' | 'modified')}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 
                   rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Sort by"
          aria-label="Sort files by"
        >
          <option value="name">Name</option>
          <option value="type">Type</option>
          <option value="modified">Modified</option>
        </select>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

        {/* View mode buttons */}
        <button
          onClick={() => onViewModeChange('list')}
          className={`
            p-2 rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${viewMode === 'list'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }
          `}
          title="List view"
          aria-label="Switch to list view"
          aria-pressed={viewMode === 'list'}
        >
          <List className="w-4 h-4" />
        </button>

        <button
          onClick={() => onViewModeChange('grid')}
          className={`
            p-2 rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${viewMode === 'grid'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }
          `}
          title="Grid view"
          aria-label="Switch to grid view"
          aria-pressed={viewMode === 'grid'}
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};