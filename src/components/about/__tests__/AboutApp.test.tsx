import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AboutApp from '../../../apps/AboutApp';
import { aboutService } from '../../../services';
import type { AboutData } from '../../../types';

// Mock the aboutService
vi.mock('../../../services', () => ({
  aboutService: {
    getAboutData: vi.fn(),
  },
}));

// Mock the about components
vi.mock('../AboutNavigation', () => ({
  default: ({ activeSection, onSectionChange }: any) => (
    <div data-testid="about-navigation">
      <button onClick={() => onSectionChange('overview')}>Overview</button>
      <button onClick={() => onSectionChange('experience')}>Experience</button>
      <button onClick={() => onSectionChange('skills')}>Skills</button>
      <button onClick={() => onSectionChange('timeline')}>Timeline</button>
      <button onClick={() => onSectionChange('contact')}>Contact</button>
      <span data-testid="active-section">{activeSection}</span>
    </div>
  ),
}));

vi.mock('../OverviewSection', () => ({
  default: ({ data }: any) => (
    <div data-testid="overview-section">Overview: {data?.contact?.email}</div>
  ),
}));

vi.mock('../ExperienceSection', () => ({
  default: ({ companies, institutions }: any) => (
    <div data-testid="experience-section">
      Experience: {companies?.length} companies, {institutions?.length} institutions
    </div>
  ),
}));

vi.mock('../SkillsSection', () => ({
  default: ({ skills, onSkillFilter }: any) => (
    <div data-testid="skills-section">
      Skills: {skills?.length} skills
      <button onClick={() => onSkillFilter('React')}>Filter React</button>
    </div>
  ),
}));

vi.mock('../TimelineSection', () => ({
  default: ({ timeline, expandedMilestone, onMilestoneToggle }: any) => (
    <div data-testid="timeline-section">
      Timeline: {timeline?.length} milestones
      <button onClick={() => onMilestoneToggle('test-milestone')}>Toggle Milestone</button>
      <span data-testid="expanded-milestone">{expandedMilestone || 'none'}</span>
    </div>
  ),
}));

vi.mock('../ContactSection', () => ({
  default: ({ contact }: any) => (
    <div data-testid="contact-section">Contact: {contact?.email}</div>
  ),
}));

describe('AboutApp', () => {
  const mockAboutData: AboutData = {
    institutions: [
      {
        name: 'Test University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startYear: 2018,
        endYear: 2022,
      },
    ],
    companies: [
      {
        name: 'Test Company',
        position: 'Developer',
        startDate: '2022-01',
        location: 'Test City',
        description: 'Test description',
        achievements: ['Test achievement'],
        technologies: ['React', 'TypeScript'],
      },
    ],
    skills: [
      {
        name: 'React',
        category: 'frontend',
        proficiency: 5,
        yearsOfExperience: 3,
        relatedProjects: ['test-project'],
      },
    ],
    timeline: [
      {
        id: 'test-milestone',
        date: '2022-01',
        title: 'Test Milestone',
        type: 'work',
        description: 'Test description',
      },
    ],
    contact: {
      email: 'test@example.com',
      linkedin: 'https://linkedin.com/in/test',
      github: 'https://github.com/test',
      location: 'Test City',
    },
  };

  const mockProps = {
    windowId: 'test-window',
    focused: true,
    onTitleChange: vi.fn(),
    onUnsavedStateChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(aboutService.getAboutData).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<AboutApp {...mockProps} />);

    expect(screen.getByText('Loading about information...')).toBeInTheDocument();
  });

  it('should render error state when data loading fails', async () => {
    const errorMessage = 'Failed to load data';
    vi.mocked(aboutService.getAboutData).mockRejectedValue(new Error(errorMessage));

    render(<AboutApp {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Error Loading About Data')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should render about app with navigation and overview section by default', async () => {
    vi.mocked(aboutService.getAboutData).mockResolvedValue(mockAboutData);

    render(<AboutApp {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('about-navigation')).toBeInTheDocument();
      expect(screen.getByTestId('overview-section')).toBeInTheDocument();
      expect(screen.getByTestId('active-section')).toHaveTextContent('overview');
    });
  });

  it('should update window title when section changes', async () => {
    vi.mocked(aboutService.getAboutData).mockResolvedValue(mockAboutData);

    render(<AboutApp {...mockProps} />);

    await waitFor(() => {
      expect(mockProps.onTitleChange).toHaveBeenCalledWith('About - Overview');
    });

    // Change to experience section
    fireEvent.click(screen.getByText('Experience'));

    await waitFor(() => {
      expect(mockProps.onTitleChange).toHaveBeenCalledWith('About - Experience');
    });
  });

  it('should switch between sections correctly', async () => {
    vi.mocked(aboutService.getAboutData).mockResolvedValue(mockAboutData);

    render(<AboutApp {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('overview-section')).toBeInTheDocument();
    });

    // Switch to experience section
    fireEvent.click(screen.getByText('Experience'));
    expect(screen.getByTestId('experience-section')).toBeInTheDocument();
    expect(screen.queryByTestId('overview-section')).not.toBeInTheDocument();

    // Switch to skills section
    fireEvent.click(screen.getByText('Skills'));
    expect(screen.getByTestId('skills-section')).toBeInTheDocument();
    expect(screen.queryByTestId('experience-section')).not.toBeInTheDocument();

    // Switch to timeline section
    fireEvent.click(screen.getByText('Timeline'));
    expect(screen.getByTestId('timeline-section')).toBeInTheDocument();
    expect(screen.queryByTestId('skills-section')).not.toBeInTheDocument();

    // Switch to contact section
    fireEvent.click(screen.getByText('Contact'));
    expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    expect(screen.queryByTestId('timeline-section')).not.toBeInTheDocument();
  });

  it('should handle timeline milestone toggle', async () => {
    vi.mocked(aboutService.getAboutData).mockResolvedValue(mockAboutData);

    render(<AboutApp {...mockProps} />);

    // Switch to timeline section
    await waitFor(() => {
      fireEvent.click(screen.getByText('Timeline'));
    });

    expect(screen.getByTestId('expanded-milestone')).toHaveTextContent('none');

    // Toggle milestone
    fireEvent.click(screen.getByText('Toggle Milestone'));
    expect(screen.getByTestId('expanded-milestone')).toHaveTextContent('test-milestone');
  });

  it('should handle skill filtering', async () => {
    vi.mocked(aboutService.getAboutData).mockResolvedValue(mockAboutData);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<AboutApp {...mockProps} />);

    // Switch to skills section
    await waitFor(() => {
      fireEvent.click(screen.getByText('Skills'));
    });

    // Filter by React skill
    fireEvent.click(screen.getByText('Filter React'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Filtering projects by skill: React',
      ['test-project']
    );

    consoleSpy.mockRestore();
  });

  it('should reset section-specific state when changing sections', async () => {
    vi.mocked(aboutService.getAboutData).mockResolvedValue(mockAboutData);

    render(<AboutApp {...mockProps} />);

    // Go to timeline and expand a milestone
    await waitFor(() => {
      fireEvent.click(screen.getByText('Timeline'));
    });

    fireEvent.click(screen.getByText('Toggle Milestone'));
    expect(screen.getByTestId('expanded-milestone')).toHaveTextContent('test-milestone');

    // Switch to another section
    fireEvent.click(screen.getByText('Overview'));

    // Go back to timeline - milestone should be reset
    fireEvent.click(screen.getByText('Timeline'));
    expect(screen.getByTestId('expanded-milestone')).toHaveTextContent('none');
  });

  it('should pass correct props to section components', async () => {
    vi.mocked(aboutService.getAboutData).mockResolvedValue(mockAboutData);

    render(<AboutApp {...mockProps} />);

    await waitFor(() => {
      // Overview section should show email
      expect(screen.getByText('Overview: test@example.com')).toBeInTheDocument();
    });

    // Experience section should show counts
    fireEvent.click(screen.getByText('Experience'));
    expect(screen.getByText('Experience: 1 companies, 1 institutions')).toBeInTheDocument();

    // Skills section should show count
    fireEvent.click(screen.getByText('Skills'));
    expect(screen.getByText('Skills: 1 skills')).toBeInTheDocument();

    // Timeline section should show count
    fireEvent.click(screen.getByText('Timeline'));
    expect(screen.getByText('Timeline: 1 milestones')).toBeInTheDocument();

    // Contact section should show email
    fireEvent.click(screen.getByText('Contact'));
    expect(screen.getByText('Contact: test@example.com')).toBeInTheDocument();
  });

  it('should handle retry button in error state', async () => {
    vi.mocked(aboutService.getAboutData).mockRejectedValue(new Error('Network error'));

    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(<AboutApp {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Error Loading About Data')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Retry'));
    expect(mockReload).toHaveBeenCalled();
  });
});