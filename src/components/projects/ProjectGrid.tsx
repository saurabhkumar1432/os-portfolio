import React, { useMemo, useState, useEffect } from 'react';
import type { Project, ProjectsAppState } from '../../types';
import ProjectCard from './ProjectCard';

interface ProjectGridProps {
  projects: Project[];
  view: ProjectsAppState['view'];
  onProjectClick?: (project: Project) => void;
  loading?: boolean;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  view,
  onProjectClick,
  loading = false,
}) => {
  const [containerHeight, setContainerHeight] = useState(600);
  const [scrollTop, setScrollTop] = useState(0);

  // Convert timeline view to grid for ProjectCard compatibility
  const cardView: 'grid' | 'list' = view === 'timeline' ? 'grid' : view;

  // Calculate grid dimensions based on view
  const gridConfig = useMemo(() => {
    if (view === 'list') {
      return {
        itemHeight: 120, // Height of each list item
        itemsPerRow: 1,
        gap: 8,
      };
    } else if (view === 'grid') {
      return {
        itemHeight: 320, // Height of each grid item
        itemsPerRow: 3, // Responsive: could be 1, 2, or 3 based on screen size
        gap: 16,
      };
    } else {
      // Timeline view
      return {
        itemHeight: 200,
        itemsPerRow: 1,
        gap: 16,
      };
    }
  }, [view]);

  // Simple virtualization for performance
  const virtualizedItems = useMemo(() => {
    const { itemHeight, itemsPerRow, gap } = gridConfig;
    const rowHeight = itemHeight + gap;
    const totalRows = Math.ceil(projects.length / itemsPerRow);
    
    // Calculate visible range with some buffer
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
    const endRow = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / rowHeight) + 2);
    
    const visibleItems: Array<{ project: Project; index: number; row: number; col: number }> = [];
    
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col;
        if (index < projects.length) {
          visibleItems.push({
            project: projects[index],
            index,
            row,
            col,
          });
        }
      }
    }
    
    return {
      visibleItems,
      totalHeight: totalRows * rowHeight,
      startRow,
    };
  }, [projects, gridConfig, scrollTop, containerHeight]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      setContainerHeight(window.innerHeight - 200); // Approximate height minus header/filters
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading projects...</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No projects found</h3>
        <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  if (view === 'timeline') {
    // Timeline view - group by year
    const projectsByYear = projects.reduce((acc, project) => {
      if (!acc[project.year]) {
        acc[project.year] = [];
      }
      acc[project.year].push(project);
      return acc;
    }, {} as Record<number, Project[]>);

    const years = Object.keys(projectsByYear)
      .map(Number)
      .sort((a, b) => b - a);

    return (
      <div className="p-6">
        <div className="space-y-8">
          {years.map((year) => (
            <div key={year} className="relative">
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 py-2 mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{year}</h3>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projectsByYear[year].map((project) => (
                  <ProjectCard
                    key={project.slug}
                    project={project}
                    view="grid"
                    onClick={onProjectClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid or List view with virtualization
  return (
    <div
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        style={{ height: virtualizedItems.totalHeight }}
        className="relative"
      >
        <div
          style={{
            transform: `translateY(${virtualizedItems.startRow * (gridConfig.itemHeight + gridConfig.gap)}px)`,
          }}
          className={`absolute inset-x-0 ${
            view === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6'
              : 'space-y-2 p-4'
          }`}
        >
          {virtualizedItems.visibleItems.map(({ project, index }) => (
            <div
              key={`${project.slug}-${index}`}
              style={{
                gridColumn: view === 'grid' ? `${(index % gridConfig.itemsPerRow) + 1}` : undefined,
              }}
            >
              <ProjectCard
                project={project}
                view={cardView}
                onClick={onProjectClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectGrid;