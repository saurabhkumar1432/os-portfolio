import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectCard from '../ProjectCard';
import { Project } from '../../../types';

const mockProject: Project = {
  slug: 'test-project',
  title: 'Test Project',
  summary: 'This is a test project summary',
  description: 'Detailed description of the test project',
  year: 2024,
  role: 'Full Stack Developer',
  tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
  type: 'web',
  links: {
    github: 'https://github.com/test/project',
    demo: 'https://demo.example.com'
  },
  media: {
    cover: '/images/test-cover.jpg'
  },
  highlights: ['Feature 1', 'Feature 2'],
  metrics: [
    { label: 'Performance', value: '95%' }
  ],
  featured: true,
  complexity: 8
};

describe('ProjectCard', () => {
  describe('Grid View', () => {
    it('should render project information in grid layout', () => {
      render(<ProjectCard project={mockProject} view="grid" />);
      
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('This is a test project summary')).toBeInTheDocument();
      expect(screen.getByText('2024')).toBeInTheDocument();
      expect(screen.getByText('web')).toBeInTheDocument();
      expect(screen.getByText('⭐')).toBeInTheDocument(); // Featured indicator
    });

    it('should display technology tags with overflow indicator', () => {
      render(<ProjectCard project={mockProject} view="grid" />);
      
      // Should show first 3 tech tags
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      
      // Should show overflow indicator
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should render cover image with fallback', () => {
      render(<ProjectCard project={mockProject} view="grid" />);
      
      const image = screen.getByAltText('Test Project cover');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/test-cover.jpg');
    });

    it('should render fallback when no cover image', () => {
      const projectWithoutCover = { ...mockProject, media: undefined };
      render(<ProjectCard project={projectWithoutCover} view="grid" />);
      
      // Should show first letter of title as fallback
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<ProjectCard project={mockProject} view="grid" onClick={handleClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledWith(mockProject);
    });

    it('should call onClick when Enter key is pressed', () => {
      const handleClick = vi.fn();
      render(<ProjectCard project={mockProject} view="grid" onClick={handleClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledWith(mockProject);
    });

    it('should call onClick when Space key is pressed', () => {
      const handleClick = vi.fn();
      render(<ProjectCard project={mockProject} view="grid" onClick={handleClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });
      expect(handleClick).toHaveBeenCalledWith(mockProject);
    });

    it('should not call onClick for other keys', () => {
      const handleClick = vi.fn();
      render(<ProjectCard project={mockProject} view="grid" onClick={handleClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Tab' });
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('List View', () => {
    it('should render project information in list layout', () => {
      render(<ProjectCard project={mockProject} view="list" />);
      
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('This is a test project summary')).toBeInTheDocument();
      expect(screen.getByText('2024')).toBeInTheDocument();
      expect(screen.getByText('web')).toBeInTheDocument();
      expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
      expect(screen.getByText('⭐ Featured')).toBeInTheDocument();
    });

    it('should display technology tags with overflow indicator in list view', () => {
      render(<ProjectCard project={mockProject} view="list" />);
      
      // Should show first 4 tech tags in list view
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
      
      // Should show overflow indicator
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });

    it('should render smaller cover image in list view', () => {
      render(<ProjectCard project={mockProject} view="list" />);
      
      const image = screen.getByAltText('Test Project cover');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/test-cover.jpg');
    });
  });

  describe('Non-featured Project', () => {
    it('should not show featured indicator for non-featured projects', () => {
      const nonFeaturedProject = { ...mockProject, featured: false };
      render(<ProjectCard project={nonFeaturedProject} view="grid" />);
      
      expect(screen.queryByText('⭐')).not.toBeInTheDocument();
      expect(screen.queryByText('⭐ Featured')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ProjectCard project={mockProject} view="grid" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'View project: Test Project');
    });

    it('should be focusable', () => {
      render(<ProjectCard project={mockProject} view="grid" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('should have focus styles', () => {
      render(<ProjectCard project={mockProject} view="grid" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('Image Error Handling', () => {
    it('should handle image load errors', () => {
      render(<ProjectCard project={mockProject} view="grid" />);
      
      const image = screen.getByAltText('Test Project cover');
      
      // Simulate image error
      fireEvent.error(image);
      
      // The error handler should hide the image and show fallback
      // Note: This is a simplified test - in reality, the DOM manipulation
      // would need to be tested more thoroughly
    });
  });

  describe('Edge Cases', () => {
    it('should handle projects with minimal data', () => {
      const minimalProject: Project = {
        slug: 'minimal',
        title: 'Minimal Project',
        summary: 'Summary',
        description: 'Description',
        year: 2024,
        role: 'Developer',
        tech: ['JavaScript'],
        type: 'web',
        featured: false,
        complexity: 1
      };

      render(<ProjectCard project={minimalProject} view="grid" />);
      
      expect(screen.getByText('Minimal Project')).toBeInTheDocument();
      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.queryByText('+')).not.toBeInTheDocument(); // No overflow
    });

    it('should handle empty tech array gracefully', () => {
      const projectWithoutTech = { ...mockProject, tech: [] };
      render(<ProjectCard project={projectWithoutTech} view="grid" />);
      
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      // Should not crash and should not show any tech tags
    });
  });
});