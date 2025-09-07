import React from 'react';
import type { Project, ProjectsAppState } from '../../types';

interface ProjectFiltersProps {
  filters: ProjectsAppState['filters'];
  sort: ProjectsAppState['sort'];
  view: ProjectsAppState['view'];
  searchQuery: string;
  availableTech: string[];
  availableTypes: Project['type'][];
  availableYears: number[];
  onFiltersChange: (filters: ProjectsAppState['filters']) => void;
  onSortChange: (sort: ProjectsAppState['sort']) => void;
  onViewChange: (view: ProjectsAppState['view']) => void;
  onSearchChange: (query: string) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  sort,
  view,
  searchQuery,
  availableTech,
  availableTypes,
  availableYears,
  onFiltersChange,
  onSortChange,
  onViewChange,
  onSearchChange,
}) => {
  const handleTechToggle = (tech: string) => {
    const newTech = filters.tech.includes(tech)
      ? filters.tech.filter(t => t !== tech)
      : [...filters.tech, tech];
    
    onFiltersChange({ ...filters, tech: newTech });
  };

  const handleTypeToggle = (type: Project['type']) => {
    const newType = filters.type.includes(type)
      ? filters.type.filter(t => t !== type)
      : [...filters.type, type];
    
    onFiltersChange({ ...filters, type: newType });
  };

  const handleYearToggle = (year: number) => {
    const newYear = filters.year.includes(year)
      ? filters.year.filter(y => y !== year)
      : [...filters.year, year];
    
    onFiltersChange({ ...filters, year: newYear });
  };

  const clearAllFilters = () => {
    onFiltersChange({ tech: [], type: [], year: [] });
    onSearchChange('');
  };

  const hasActiveFilters = filters.tech.length > 0 || filters.type.length > 0 || filters.year.length > 0 || searchQuery.trim() !== '';

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      {/* Search and View Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 ml-4">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort:
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => onSortChange(e.target.value as ProjectsAppState['sort'])}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="recent">Most Recent</option>
              <option value="complexity">Complexity</option>
              <option value="stars">Featured First</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
            <button
              onClick={() => onViewChange('grid')}
              className={`p-2 rounded text-sm font-medium transition-colors ${
                view === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              aria-label="Grid view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={`p-2 rounded text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              aria-label="List view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => onViewChange('timeline')}
              className={`p-2 rounded text-sm font-medium transition-colors ${
                view === 'timeline'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              aria-label="Timeline view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Technology Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Technologies</h4>
          <div className="flex flex-wrap gap-2">
            {availableTech.map((tech) => (
              <button
                key={tech}
                onClick={() => handleTechToggle(tech)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.tech.includes(tech)
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tech}
                {filters.tech.includes(tech) && (
                  <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Types</h4>
          <div className="flex flex-wrap gap-2">
            {availableTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
                  filters.type.includes(type)
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type}
                {filters.type.includes(type) && (
                  <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Year Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Years</h4>
          <div className="flex flex-wrap gap-2">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => handleYearToggle(year)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.year.includes(year)
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {year}
                {filters.year.includes(year) && (
                  <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectFilters;