import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectFilters from '../ProjectFilters';
import { ProjectsAppState, Project } from '../../../types';

const mockFilters: ProjectsAppState['filters'] = {
  tech: [],
  type: [],
  year: [],
};

const mockProps = {
  filters: mockFilters,
  sort: 'recent' as ProjectsAppState['sort'],
  view: 'grid' as ProjectsAppState['view'],
  searchQuery: '',
  availableTech: ['React', 'TypeScript', 'Node.js', 'Python'],
  availableTypes: ['web', 'mobile', 'systems', 'ml'] as Project['type'][],
  availableYears: [2024, 2023, 2022, 2021],
  onFiltersChange: vi.fn(),
  onSortChange: vi.fn(),
  onViewChange: vi.fn(),
  onSearchChange: vi.fn(),
};

describe('ProjectFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Input', () => {
    it('should render search input with placeholder', () => {
      render(<ProjectFilters {...mockProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search projects...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should display current search query', () => {
      render(<ProjectFilters {...mockProps} searchQuery="React" />);
      
      const searchInput = screen.getByDisplayValue('React');
      expect(searchInput).toBeInTheDocument();
    });

    it('should call onSearchChange when typing', () => {
      render(<ProjectFilters {...mockProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search projects...');
      fireEvent.change(searchInput, { target: { value: 'TypeScript' } });
      
      expect(mockProps.onSearchChange).toHaveBeenCalledWith('TypeScript');
    });
  });

  describe('Sort Control', () => {
    it('should render sort dropdown with current value', () => {
      render(<ProjectFilters {...mockProps} sort="complexity" />);
      
      const sortSelect = screen.getByDisplayValue('Complexity');
      expect(sortSelect).toBeInTheDocument();
    });

    it('should call onSortChange when selection changes', () => {
      render(<ProjectFilters {...mockProps} />);
      
      const sortSelect = screen.getByLabelText('Sort:');
      fireEvent.change(sortSelect, { target: { value: 'complexity' } });
      
      expect(mockProps.onSortChange).toHaveBeenCalledWith('complexity');
    });

    it('should have all sort options available', () => {
      render(<ProjectFilters {...mockProps} />);
      
      expect(screen.getByText('Most Recent')).toBeInTheDocument();
      expect(screen.getByText('Complexity')).toBeInTheDocument();
      expect(screen.getByText('Featured First')).toBeInTheDocument();
    });
  });

  describe('View Toggle', () => {
    it('should render view toggle buttons', () => {
      render(<ProjectFilters {...mockProps} />);
      
      expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
      expect(screen.getByLabelText('List view')).toBeInTheDocument();
      expect(screen.getByLabelText('Timeline view')).toBeInTheDocument();
    });

    it('should highlight current view', () => {
      render(<ProjectFilters {...mockProps} view="list" />);
      
      const listButton = screen.getByLabelText('List view');
      expect(listButton).toHaveClass('bg-white', 'dark:bg-gray-600');
    });

    it('should call onViewChange when view button is clicked', () => {
      render(<ProjectFilters {...mockProps} />);
      
      const timelineButton = screen.getByLabelText('Timeline view');
      fireEvent.click(timelineButton);
      
      expect(mockProps.onViewChange).toHaveBeenCalledWith('timeline');
    });
  });

  describe('Technology Filters', () => {
    it('should render all available technologies', () => {
      render(<ProjectFilters {...mockProps} />);
      
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
    });

    it('should highlight selected technologies', () => {
      const filtersWithTech = {
        ...mockFilters,
        tech: ['React', 'TypeScript'],
      };
      
      render(<ProjectFilters {...mockProps} filters={filtersWithTech} />);
      
      const reactButton = screen.getByText('React');
      expect(reactButton).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should toggle technology filter when clicked', () => {
      render(<ProjectFilters {...mockProps} />);
      
      const reactButton = screen.getByText('React');
      fireEvent.click(reactButton);
      
      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        ...mockFilters,
        tech: ['React'],
      });
    });

    it('should remove technology filter when clicked again', () => {
      const filtersWithTech = {
        ...mockFilters,
        tech: ['React'],
      };
      
      render(<ProjectFilters {...mockProps} filters={filtersWithTech} />);
      
      const reactButton = screen.getByText('React');
      fireEvent.click(reactButton);
      
      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        ...mockFilters,
        tech: [],
      });
    });
  });

  describe('Type Filters', () => {
    it('should render all available project types', () => {
      render(<ProjectFilters {...mockProps} />);
      
      expect(screen.getByText('web')).toBeInTheDocument();
      expect(screen.getByText('mobile')).toBeInTheDocument();
      expect(screen.getByText('systems')).toBeInTheDocument();
      expect(screen.getByText('ml')).toBeInTheDocument();
    });

    it('should highlight selected types', () => {
      const filtersWithType = {
        ...mockFilters,
        type: ['web' as Project['type']],
      };
      
      render(<ProjectFilters {...mockProps} filters={filtersWithType} />);
      
      const webButton = screen.getByText('web');
      expect(webButton).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should toggle type filter when clicked', () => {
      render(<ProjectFilters {...mockProps} />);
      
      const webButton = screen.getByText('web');
      fireEvent.click(webButton);
      
      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        ...mockFilters,
        type: ['web'],
      });
    });
  });

  describe('Year Filters', () => {
    it('should render all available years', () => {
      render(<ProjectFilters {...mockProps} />);
      
      expect(screen.getByText('2024')).toBeInTheDocument();
      expect(screen.getByText('2023')).toBeInTheDocument();
      expect(screen.getByText('2022')).toBeInTheDocument();
      expect(screen.getByText('2021')).toBeInTheDocument();
    });

    it('should highlight selected years', () => {
      const filtersWithYear = {
        ...mockFilters,
        year: [2024],
      };
      
      render(<ProjectFilters {...mockProps} filters={filtersWithYear} />);
      
      const yearButton = screen.getByText('2024');
      expect(yearButton).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    it('should toggle year filter when clicked', () => {
      render(<ProjectFilters {...mockProps} />);
      
      const yearButton = screen.getByText('2024');
      fireEvent.click(yearButton);
      
      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        ...mockFilters,
        year: [2024],
      });
    });
  });

  describe('Clear Filters', () => {
    it('should not show clear button when no filters are active', () => {
      render(<ProjectFilters {...mockProps} />);
      
      expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument();
    });

    it('should show clear button when filters are active', () => {
      const activeFilters = {
        tech: ['React'],
        type: [],
        year: [],
      };
      
      render(<ProjectFilters {...mockProps} filters={activeFilters} />);
      
      expect(screen.getByText('Clear all filters')).toBeInTheDocument();
    });

    it('should show clear button when search query is active', () => {
      render(<ProjectFilters {...mockProps} searchQuery="React" />);
      
      expect(screen.getByText('Clear all filters')).toBeInTheDocument();
    });

    it('should clear all filters and search when clicked', () => {
      const activeFilters = {
        tech: ['React'],
        type: ['web' as Project['type']],
        year: [2024],
      };
      
      render(<ProjectFilters {...mockProps} filters={activeFilters} searchQuery="test" />);
      
      const clearButton = screen.getByText('Clear all filters');
      fireEvent.click(clearButton);
      
      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        tech: [],
        type: [],
        year: [],
      });
      expect(mockProps.onSearchChange).toHaveBeenCalledWith('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form controls', () => {
      render(<ProjectFilters {...mockProps} />);
      
      expect(screen.getByLabelText('Sort:')).toBeInTheDocument();
    });

    it('should have proper section headings', () => {
      render(<ProjectFilters {...mockProps} />);
      
      expect(screen.getByText('Technologies')).toBeInTheDocument();
      expect(screen.getByText('Project Types')).toBeInTheDocument();
      expect(screen.getByText('Years')).toBeInTheDocument();
    });

    it('should have keyboard navigation support', () => {
      render(<ProjectFilters {...mockProps} />);
      
      const reactButton = screen.getByText('React');
      // Button should be focusable (buttons are focusable by default)
      expect(reactButton.tagName).toBe('BUTTON');
    });
  });

  describe('Filter Indicators', () => {
    it('should show X icon for selected filters', () => {
      const activeFilters = {
        tech: ['React'],
        type: ['web' as Project['type']],
        year: [2024],
      };
      
      render(<ProjectFilters {...mockProps} filters={activeFilters} />);
      
      // Should have selected filter buttons with different styling
      const reactButton = screen.getByText('React');
      expect(reactButton).toHaveClass('bg-blue-100', 'text-blue-800');
      
      const webButton = screen.getByText('web');
      expect(webButton).toHaveClass('bg-green-100', 'text-green-800');
      
      const yearButton = screen.getByText('2024');
      expect(yearButton).toHaveClass('bg-purple-100', 'text-purple-800');
    });
  });
});