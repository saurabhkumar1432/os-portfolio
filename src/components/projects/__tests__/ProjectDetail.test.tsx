import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectDetail from '../ProjectDetail';
import { Project } from '../../../types';

const mockProject: Project = {
  slug: 'test-project',
  title: 'Test Project',
  summary: 'This is a test project summary that describes what the project does.',
  description: `This is a detailed description of the test project.

It includes multiple paragraphs and explains the technical implementation,
challenges faced, and solutions implemented.

The project demonstrates various skills and technologies.`,
  year: 2024,
  role: 'Full Stack Developer',
  tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
  type: 'web',
  links: {
    github: 'https://github.com/test/project',
    demo: 'https://demo.example.com',
    documentation: 'https://docs.example.com'
  },
  media: {
    cover: '/images/test-cover.jpg',
    gallery: [
      '/images/test-1.jpg',
      '/images/test-2.jpg',
      '/images/test-3.jpg'
    ]
  },
  highlights: [
    'Implemented real-time features',
    'Achieved 95% test coverage',
    'Optimized for performance'
  ],
  metrics: [
    { label: 'Performance Score', value: '95%' },
    { label: 'Users', value: '10K+' },
    { label: 'Uptime', value: '99.9%' }
  ],
  featured: true,
  complexity: 8
};

describe('ProjectDetail', () => {
  const mockOnClose = vi.fn();
  const mockOnNavigateToProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Header', () => {
    it('should render project title and metadata', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('2024 • Full Stack Developer')).toBeInTheDocument();
      expect(screen.getByText('⭐ Featured')).toBeInTheDocument();
      expect(screen.getByText('web')).toBeInTheDocument();
      expect(screen.getByText('Complexity: 8/10')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      const closeButton = screen.getByLabelText('Close project detail');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not show featured badge for non-featured projects', () => {
      const nonFeaturedProject = { ...mockProject, featured: false };
      
      render(
        <ProjectDetail
          project={nonFeaturedProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      expect(screen.queryByText('⭐ Featured')).not.toBeInTheDocument();
    });
  });

  describe('Media Gallery', () => {
    it('should render main image and thumbnails', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      // Main image
      expect(screen.getByAltText('Test Project - Image 1')).toBeInTheDocument();
      
      // Thumbnails
      expect(screen.getByAltText('Test Project thumbnail 1')).toBeInTheDocument();
      expect(screen.getByAltText('Test Project thumbnail 2')).toBeInTheDocument();
      expect(screen.getByAltText('Test Project thumbnail 3')).toBeInTheDocument();
      
      // Image counter
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('should navigate between images using arrow buttons', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      const nextButton = screen.getByLabelText('Next image');
      fireEvent.click(nextButton);

      expect(screen.getByText('2 / 3')).toBeInTheDocument();

      const prevButton = screen.getByLabelText('Previous image');
      fireEvent.click(prevButton);

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('should navigate to specific image when thumbnail is clicked', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      const thirdThumbnail = screen.getByAltText('Test Project thumbnail 3');
      fireEvent.click(thirdThumbnail);

      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });

    it('should handle projects with only cover image', () => {
      const projectWithCoverOnly = {
        ...mockProject,
        media: { cover: '/images/cover.jpg' }
      };

      render(
        <ProjectDetail
          project={projectWithCoverOnly}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      expect(screen.getByAltText('Test Project - Image 1')).toBeInTheDocument();
      expect(screen.queryByText('1 / 1')).not.toBeInTheDocument(); // No counter for single image
      expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument(); // No navigation
    });

    it('should handle projects with no media', () => {
      const projectWithoutMedia = {
        ...mockProject,
        media: undefined
      };

      render(
        <ProjectDetail
          project={projectWithoutMedia}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      expect(screen.queryByText('Media')).not.toBeInTheDocument();
    });
  });

  describe('Content Sections', () => {
    it('should render summary section', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByText(mockProject.summary)).toBeInTheDocument();
    });

    it('should render description section', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText(/This is a detailed description/)).toBeInTheDocument();
    });

    it('should render technologies section', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      expect(screen.getByText('Technologies Used')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    });

    it('should render highlights section', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      expect(screen.getByText('Key Highlights')).toBeInTheDocument();
      expect(screen.getByText('Implemented real-time features')).toBeInTheDocument();
      expect(screen.getByText('Achieved 95% test coverage')).toBeInTheDocument();
      expect(screen.getByText('Optimized for performance')).toBeInTheDocument();
    });

    it('should render metrics section', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      expect(screen.getByText('Project Metrics')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('Performance Score')).toBeInTheDocument();
      expect(screen.getByText('10K+')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('should render links section', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      expect(screen.getByText('Project Links')).toBeInTheDocument();
      
      const githubLink = screen.getByText('View on GitHub');
      expect(githubLink.closest('a')).toHaveAttribute('href', 'https://github.com/test/project');
      
      const demoLink = screen.getByText('Live Demo');
      expect(demoLink.closest('a')).toHaveAttribute('href', 'https://demo.example.com');
      
      const docsLink = screen.getByText('Documentation');
      expect(docsLink.closest('a')).toHaveAttribute('href', 'https://docs.example.com');
    });

    it('should not render optional sections when data is missing', () => {
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

      render(
        <ProjectDetail
          project={minimalProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      expect(screen.queryByText('Key Highlights')).not.toBeInTheDocument();
      expect(screen.queryByText('Project Metrics')).not.toBeInTheDocument();
      expect(screen.queryByText('Project Links')).not.toBeInTheDocument();
      expect(screen.queryByText('Media')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close on Escape key', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      const container = document.querySelector('[tabIndex="0"]') as HTMLElement;
      fireEvent.keyDown(container, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should navigate images with arrow keys', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      const container = document.querySelector('[tabIndex="0"]') as HTMLElement;
      
      // Navigate to next image
      fireEvent.keyDown(container, { key: 'ArrowRight' });
      expect(screen.getByText('2 / 3')).toBeInTheDocument();

      // Navigate to previous image
      fireEvent.keyDown(container, { key: 'ArrowLeft' });
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('should not navigate images when only one image exists', () => {
      const projectWithOneImage = {
        ...mockProject,
        media: { cover: '/images/cover.jpg' }
      };

      render(
        <ProjectDetail
          project={projectWithOneImage}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      const container = document.querySelector('[tabIndex="0"]') as HTMLElement;
      
      // Should not crash or change anything
      fireEvent.keyDown(container, { key: 'ArrowRight' });
      fireEvent.keyDown(container, { key: 'ArrowLeft' });
      
      // Should still show the single image
      expect(screen.getByAltText('Test Project - Image 1')).toBeInTheDocument();
    });
  });

  describe('Image Error Handling', () => {
    it('should show fallback when image fails to load', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      const mainImage = screen.getByAltText('Test Project - Image 1');
      fireEvent.error(mainImage);

      expect(screen.getByText('T')).toBeInTheDocument(); // Fallback shows first letter
      expect(screen.getByText('Image not available')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      expect(screen.getByLabelText('Close project detail')).toBeInTheDocument();
      expect(screen.getByLabelText('Next image')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    });

    it('should be focusable for keyboard navigation', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      const container = document.querySelector('[tabIndex="0"]');
      expect(container).toBeInTheDocument();
    });

    it('should have proper link attributes for external links', () => {
      render(
        <ProjectDetail
          project={mockProject}
          onClose={mockOnClose}
          onNavigateToProject={mockOnNavigateToProject}
        />
      );

      const githubLink = screen.getByText('View on GitHub').closest('a');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});