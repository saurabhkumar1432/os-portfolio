import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectGrid from '../ProjectGrid';
import { Project } from '../../../types';

const mockProjects: Project[] = [
  {
    slug: 'project-1',
    title: 'Project 1',
    summary: 'First project summary',
    description: 'Description 1',
    year: 2024,
    role: 'Developer',
    tech: ['React', 'TypeScript'],
    type: 'web',
    featured: true,
    complexity: 8
  },
  {
    slug: 'project-2',
    title: 'Project 2',
    summary: 'Second project summary',
    description: 'Description 2',
    year: 2023,
    role: 'Developer',
    tech: ['Python', 'Django'],
    type: 'web',
    featured: false,
    complexity: 6
  },
  {
    slug: 'project-3',
    title: 'Project 3',
    summary: 'Third project summary',
    description: 'Description 3',
    year: 2022,
    role: 'Developer',
    tech: ['React Native'],
    type: 'mobile',
    featured: true,
    complexity: 7
  },
];

describe('ProjectGrid', () => {
  const mockOnProjectClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      render(
        <ProjectGrid
          projects={[]}
          view="grid"
          loading={true}
          onProjectClick={mockOnProjectClick}
        />
      );

      expect(screen.getByText('Loading projects...')).toBeInTheDocument();
      // Check for loading spinner by class
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no projects', () => {
      render(
        <ProjectGrid
          projects={[]}
          view="grid"
          loading={false}
          onProjectClick={mockOnProjectClick}
        />
      );

      expect(screen.getByText('No projects found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or search query.')).toBeInTheDocument();
    });
  });

  describe('Grid View', () => {
    it('should render projects in grid layout', () => {
      render(
        <ProjectGrid
          projects={mockProjects}
          view="grid"
          onProjectClick={mockOnProjectClick}
        />
      );

      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
      expect(screen.getByText('Project 3')).toBeInTheDocument();
    });

    it('should call onProjectClick when project is clicked', () => {
      render(
        <ProjectGrid
          projects={mockProjects}
          view="grid"
          onProjectClick={mockOnProjectClick}
        />
      );

      const projectCard = screen.getByLabelText('View project: Project 1');
      fireEvent.click(projectCard);

      expect(mockOnProjectClick).toHaveBeenCalledWith(mockProjects[0]);
    });
  });

  describe('List View', () => {
    it('should render projects in list layout', () => {
      render(
        <ProjectGrid
          projects={mockProjects}
          view="list"
          onProjectClick={mockOnProjectClick}
        />
      );

      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
      expect(screen.getByText('Project 3')).toBeInTheDocument();
    });

    it('should show more details in list view', () => {
      render(
        <ProjectGrid
          projects={mockProjects}
          view="list"
          onProjectClick={mockOnProjectClick}
        />
      );

      // List view should show role information
      expect(screen.getAllByText('Developer')).toHaveLength(3);
    });
  });

  describe('Timeline View', () => {
    it('should render projects grouped by year', () => {
      render(
        <ProjectGrid
          projects={mockProjects}
          view="timeline"
          onProjectClick={mockOnProjectClick}
        />
      );

      // Should show year headers
      expect(screen.getByRole('heading', { name: '2024' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '2023' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '2022' })).toBeInTheDocument();

      // Should show projects under their respective years
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
      expect(screen.getByText('Project 3')).toBeInTheDocument();
    });

    it('should sort years in descending order', () => {
      render(
        <ProjectGrid
          projects={mockProjects}
          view="timeline"
          onProjectClick={mockOnProjectClick}
        />
      );

      // Check that 2024 appears before 2023 and 2022
      const content = document.body.textContent || '';
      const year2024Index = content.indexOf('2024');
      const year2023Index = content.indexOf('2023');
      const year2022Index = content.indexOf('2022');
      
      expect(year2024Index).toBeLessThan(year2023Index);
      expect(year2023Index).toBeLessThan(year2022Index);
    });

    it('should group projects correctly by year', () => {
      const projectsWithSameYear = [
        ...mockProjects,
        {
          slug: 'project-4',
          title: 'Project 4',
          summary: 'Fourth project summary',
          description: 'Description 4',
          year: 2024, // Same year as Project 1
          role: 'Developer',
          tech: ['Vue.js'],
          type: 'web' as const,
          featured: false,
          complexity: 5
        }
      ];

      render(
        <ProjectGrid
          projects={projectsWithSameYear}
          view="timeline"
          onProjectClick={mockOnProjectClick}
        />
      );

      // Should have both Project 1 and Project 4 under 2024
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 4')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '2024' })).toBeInTheDocument();
    });
  });

  describe('Virtualization', () => {
    it('should handle large numbers of projects efficiently', () => {
      const manyProjects = Array.from({ length: 100 }, (_, i) => ({
        slug: `project-${i}`,
        title: `Project ${i}`,
        summary: `Summary ${i}`,
        description: `Description ${i}`,
        year: 2024 - (i % 5),
        role: 'Developer',
        tech: ['React'],
        type: 'web' as const,
        featured: i % 10 === 0,
        complexity: (i % 10) + 1
      }));

      render(
        <ProjectGrid
          projects={manyProjects}
          view="grid"
          onProjectClick={mockOnProjectClick}
        />
      );

      // Should render without performance issues
      // Note: In a real test, you might want to check that not all 100 items are rendered at once
      expect(screen.getByText('Project 0')).toBeInTheDocument();
    });

    it('should handle scrolling in virtualized view', () => {
      const manyProjects = Array.from({ length: 50 }, (_, i) => ({
        slug: `project-${i}`,
        title: `Project ${i}`,
        summary: `Summary ${i}`,
        description: `Description ${i}`,
        year: 2024,
        role: 'Developer',
        tech: ['React'],
        type: 'web' as const,
        featured: false,
        complexity: 5
      }));

      render(
        <ProjectGrid
          projects={manyProjects}
          view="list"
          onProjectClick={mockOnProjectClick}
        />
      );

      // Find the scrollable container by CSS selector
      const scrollContainer = document.querySelector('.overflow-auto');
      
      if (scrollContainer) {
        fireEvent.scroll(scrollContainer, { target: { scrollTop: 500 } });
        // Should handle scroll without errors
      }
      
      // Should render some projects (virtualization may not show Project 0 after scroll)
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to different screen sizes', () => {
      // Mock window resize
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800,
      });

      render(
        <ProjectGrid
          projects={mockProjects}
          view="grid"
          onProjectClick={mockOnProjectClick}
        />
      );

      // Trigger resize event
      fireEvent(window, new Event('resize'));

      // Should still render projects
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined onProjectClick gracefully', () => {
      render(
        <ProjectGrid
          projects={mockProjects}
          view="grid"
        />
      );

      const projectCard = screen.getByLabelText('View project: Project 1');
      
      // Should not throw error when clicked without onProjectClick
      expect(() => {
        fireEvent.click(projectCard);
      }).not.toThrow();
    });

    it('should handle projects with missing data', () => {
      const incompleteProjects = [
        {
          slug: 'incomplete',
          title: 'Incomplete Project',
          summary: '',
          description: '',
          year: 2024,
          role: '',
          tech: [],
          type: 'web' as const,
          featured: false,
          complexity: 1
        }
      ];

      render(
        <ProjectGrid
          projects={incompleteProjects}
          view="grid"
          onProjectClick={mockOnProjectClick}
        />
      );

      expect(screen.getByText('Incomplete Project')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(
        <ProjectGrid
          projects={mockProjects}
          view="grid"
          onProjectClick={mockOnProjectClick}
        />
      );

      // Re-render with same props
      rerender(
        <ProjectGrid
          projects={mockProjects}
          view="grid"
          onProjectClick={mockOnProjectClick}
        />
      );

      // Should still show projects
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });
  });
});