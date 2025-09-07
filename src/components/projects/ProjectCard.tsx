import React from 'react';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  view: 'grid' | 'list';
  onClick?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, view, onClick }) => {
  const handleClick = () => {
    onClick?.(project);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  if (view === 'list') {
    return (
      <div
        className="flex items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View project: ${project.title}`}
      >
        {project.media?.cover && (
          <div className="flex-shrink-0 w-16 h-16 mr-4">
            <img
              src={project.media.cover}
              alt={`${project.title} cover`}
              className="w-full h-full object-cover rounded-md"
              onError={(e) => {
                // Fallback to colored placeholder
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const placeholder = target.nextElementSibling as HTMLElement;
                if (placeholder) {
                  placeholder.style.display = 'flex';
                }
              }}
            />
            <div
              className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-md items-center justify-center text-white font-bold text-xl hidden"
              style={{ display: 'none' }}
            >
              {project.title.charAt(0)}
            </div>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {project.title}
            </h3>
            <div className="flex items-center gap-2 ml-4">
              {project.featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  ⭐ Featured
                </span>
              )}
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {project.year}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {project.summary}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {project.tech.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tech}
                </span>
              ))}
              {project.tech.length > 4 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{project.tech.length - 4} more
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="capitalize">{project.type}</span>
              <span>•</span>
              <span>{project.role}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View project: ${project.title}`}
    >
      {project.media?.cover ? (
        <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700">
          <img
            src={project.media.cover}
            alt={`${project.title} cover`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to colored placeholder
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const placeholder = target.nextElementSibling as HTMLElement;
              if (placeholder) {
                placeholder.style.display = 'flex';
              }
            }}
          />
          <div
            className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center text-white font-bold text-4xl hidden"
            style={{ display: 'none' }}
          >
            {project.title.charAt(0)}
          </div>
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl">
          {project.title.charAt(0)}
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {project.title}
          </h3>
          {project.featured && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 ml-2">
              ⭐
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {project.summary}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tech.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {tech}
            </span>
          ))}
          {project.tech.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{project.tech.length - 3}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="capitalize">{project.type}</span>
          <span>{project.year}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;