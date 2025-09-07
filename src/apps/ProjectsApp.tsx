import React, { useState, useEffect, useMemo } from 'react';
import type { AppProps, Project, ProjectsAppState } from '../types';
import { projectService } from '../services';
import { useAppFramework } from '../hooks/useAppFramework';
import ProjectFilters from '../components/projects/ProjectFilters';
import ProjectGrid from '../components/projects/ProjectGrid';
import ProjectDetail from '../components/projects/ProjectDetail';

/**
 * Projects application component
 * Displays portfolio projects with filtering, sorting, and multiple view modes
 */
const ProjectsApp: React.FC<AppProps> = ({ 
  windowId, 
  onTitleChange, 
  onUnsavedStateChange 
}) => {
  const appFramework = useAppFramework({
    appId: 'projects',
    windowId,
    onTitleChange,
    onUnsavedStateChange
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // App state
  const [appState, setAppState] = useState<ProjectsAppState>({
    view: 'grid',
    filters: {
      tech: [],
      type: [],
      year: [],
    },
    sort: 'recent',
    selectedProject: null,
    searchQuery: '',
  });

  // Available filter options
  const [availableTech, setAvailableTech] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<Project['type'][]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Update title based on current view
  useEffect(() => {
    let title = 'Projects';
    
    if (appState.selectedProject) {
      const selectedProjectObj = projects.find(p => p.slug === appState.selectedProject);
      title = selectedProjectObj ? `${selectedProjectObj.title} - Projects` : 'Projects';
    } else if (appState.searchQuery) {
      title = `Search: ${appState.searchQuery} - Projects`;
    } else if (appState.filters.tech.length > 0) {
      title = `${appState.filters.tech[0]} Projects`;
    }
    
    appFramework.handleTitleChange(title);
  }, [appState.selectedProject, appState.searchQuery, appState.filters.tech, appFramework.handleTitleChange]);

  // Load projects and filter options
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [
          allProjects,
          tech,
          types,
          years,
        ] = await Promise.all([
          projectService.getAllProjects(),
          projectService.getAllTechnologies(),
          projectService.getProjectTypes(),
          projectService.getProjectYears(),
        ]);
        
        setProjects(allProjects);
        setAvailableTech(tech);
        setAvailableTypes(types);
        setAvailableYears(years);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Update window title
  useEffect(() => {
    const filteredCount = filteredAndSortedProjects.length;
    const totalCount = projects.length;
    
    if (filteredCount === totalCount) {
      onTitleChange(`Projects (${totalCount})`);
    } else {
      onTitleChange(`Projects (${filteredCount}/${totalCount})`);
    }
  }, [onTitleChange, projects.length, appState.filters, appState.searchQuery]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Apply search filter
    if (appState.searchQuery.trim()) {
      const query = appState.searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.summary.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tech.some(tech => tech.toLowerCase().includes(query)) ||
        project.highlights?.some(highlight => highlight.toLowerCase().includes(query))
      );
    }

    // Apply technology filters
    if (appState.filters.tech.length > 0) {
      filtered = filtered.filter(project =>
        appState.filters.tech.some(tech =>
          project.tech.some(projectTech =>
            projectTech.toLowerCase().includes(tech.toLowerCase())
          )
        )
      );
    }

    // Apply type filters
    if (appState.filters.type.length > 0) {
      filtered = filtered.filter(project =>
        appState.filters.type.includes(project.type)
      );
    }

    // Apply year filters
    if (appState.filters.year.length > 0) {
      filtered = filtered.filter(project =>
        appState.filters.year.includes(project.year)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (appState.sort) {
        case 'recent':
          return b.year - a.year;
        case 'complexity':
          return b.complexity - a.complexity;
        case 'stars':
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.year - a.year; // Secondary sort by year
        default:
          return 0;
      }
    });

    return sorted;
  }, [projects, appState.filters, appState.sort, appState.searchQuery]);

  const handleFiltersChange = (filters: ProjectsAppState['filters']) => {
    setAppState(prev => ({ ...prev, filters }));
  };

  const handleSortChange = (sort: ProjectsAppState['sort']) => {
    setAppState(prev => ({ ...prev, sort }));
  };

  const handleViewChange = (view: ProjectsAppState['view']) => {
    setAppState(prev => ({ ...prev, view }));
  };

  const handleSearchChange = (searchQuery: string) => {
    setAppState(prev => ({ ...prev, searchQuery }));
  };

  const handleProjectClick = (project: Project) => {
    setAppState(prev => ({ ...prev, selectedProject: project.slug }));
    
    // Update URL to reflect selected project
    const url = new URL(window.location.href);
    url.searchParams.set('project', project.slug);
    window.history.pushState({}, '', url.toString());
  };

  const handleCloseProject = () => {
    setAppState(prev => ({ ...prev, selectedProject: null }));
    
    // Remove project from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    window.history.pushState({}, '', url.toString());
  };

  const handleNavigateToProject = (slug: string) => {
    const project = projects.find(p => p.slug === slug);
    if (project) {
      handleProjectClick(project);
    }
  };

  // Handle URL changes (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const projectSlug = url.searchParams.get('project');
      
      if (projectSlug && projectSlug !== appState.selectedProject) {
        setAppState(prev => ({ ...prev, selectedProject: projectSlug }));
      } else if (!projectSlug && appState.selectedProject) {
        setAppState(prev => ({ ...prev, selectedProject: null }));
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Check initial URL on mount
    const url = new URL(window.location.href);
    const initialProjectSlug = url.searchParams.get('project');
    if (initialProjectSlug && initialProjectSlug !== appState.selectedProject) {
      setAppState(prev => ({ ...prev, selectedProject: initialProjectSlug }));
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [appState.selectedProject]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Projects
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get selected project
  const selectedProject = appState.selectedProject 
    ? projects.find(p => p.slug === appState.selectedProject)
    : null;

  // Show project detail view if a project is selected
  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onClose={handleCloseProject}
        onNavigateToProject={handleNavigateToProject}
      />
    );
  }

  // Handle focus for keyboard navigation
  const handleContainerFocus = () => {
    if (appFramework.isFocused) {
      appFramework.handleFocus();
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-gray-50 dark:bg-gray-900"
      onFocus={handleContainerFocus}
      tabIndex={-1}
    >
      <ProjectFilters
        filters={appState.filters}
        sort={appState.sort}
        view={appState.view}
        searchQuery={appState.searchQuery}
        availableTech={availableTech}
        availableTypes={availableTypes}
        availableYears={availableYears}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
        onViewChange={handleViewChange}
        onSearchChange={handleSearchChange}
      />
      
      <div className="flex-1 overflow-hidden">
        <ProjectGrid
          projects={filteredAndSortedProjects}
          view={appState.view}
          onProjectClick={handleProjectClick}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ProjectsApp;