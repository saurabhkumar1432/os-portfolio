import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimelineSection from '../TimelineSection';
import type { TimelineMilestone } from '../../../types';

describe('TimelineSection', () => {
  const mockTimeline: TimelineMilestone[] = [
    {
      id: 'graduation',
      date: '2022-05',
      title: 'Graduated with Computer Science Degree',
      type: 'education',
      description: 'Completed Bachelor of Science in Computer Science',
      details: ['GPA: 3.8/4.0', 'Relevant coursework: Data Structures'],
      icon: '🎓',
      company: 'University of Technology',
      location: 'Boston, MA',
    },
    {
      id: 'senior-dev',
      date: '2022-06',
      title: 'Promoted to Senior Developer',
      type: 'work',
      description: 'Joined Tech Solutions Inc. as Senior Developer',
      details: ['Leading team of 5 developers', 'Architecting microservices'],
      icon: '💼',
      company: 'Tech Solutions Inc.',
      location: 'San Francisco, CA',
    },
    {
      id: 'aws-cert',
      date: '2023-03',
      title: 'AWS Solutions Architect Certification',
      type: 'certification',
      description: 'Achieved AWS Solutions Architect Associate certification',
      icon: '☁️',
    },
    {
      id: 'portfolio-project',
      date: '2024-01',
      title: 'Launched Portfolio OS Project',
      type: 'project',
      description: 'Created innovative portfolio website',
      icon: '🚀',
    },
    {
      id: 'hackathon-win',
      date: '2023-09',
      title: 'Won Best Technical Innovation Award',
      type: 'achievement',
      description: 'First place at TechCrunch Hackathon',
      details: ['Built in 48 hours', 'Received $10,000 prize'],
      icon: '🏆',
    },
  ];

  const defaultProps = {
    timeline: mockTimeline,
    expandedMilestone: null,
    onMilestoneToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render timeline section with title and filter', () => {
    render(<TimelineSection {...defaultProps} />);

    expect(screen.getByText('Career Timeline')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Events')).toBeInTheDocument();
  });

  it('should display all timeline milestones', () => {
    render(<TimelineSection {...defaultProps} />);

    expect(screen.getByText('Graduated with Computer Science Degree')).toBeInTheDocument();
    expect(screen.getByText('Promoted to Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('AWS Solutions Architect Certification')).toBeInTheDocument();
    expect(screen.getByText('Launched Portfolio OS Project')).toBeInTheDocument();
    expect(screen.getByText('Won Best Technical Innovation Award')).toBeInTheDocument();
  });

  it('should display milestone types and icons', () => {
    render(<TimelineSection {...defaultProps} />);

    // Check that milestone type badges are present (not the select options)
    const typeBadges = screen.getAllByText('Education').filter(el => 
      el.className.includes('px-2 py-1 rounded')
    );
    expect(typeBadges).toHaveLength(1);

    // Check icons are present
    expect(screen.getByText('🎓')).toBeInTheDocument();
    expect(screen.getByText('💼')).toBeInTheDocument();
    expect(screen.getByText('☁️')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('should display company and location information', () => {
    render(<TimelineSection {...defaultProps} />);

    expect(screen.getByText('University of Technology • Boston, MA')).toBeInTheDocument();
    expect(screen.getByText('Tech Solutions Inc. • San Francisco, CA')).toBeInTheDocument();
  });

  it('should display formatted dates and relative times', () => {
    render(<TimelineSection {...defaultProps} />);

    // Check formatted dates (May 2022, June 2022, etc.)
    expect(screen.getByText('May 2022')).toBeInTheDocument();
    expect(screen.getByText('June 2022')).toBeInTheDocument();
    expect(screen.getByText('March 2023')).toBeInTheDocument();
    expect(screen.getByText('January 2024')).toBeInTheDocument();
    expect(screen.getByText('September 2023')).toBeInTheDocument();

    // Relative times will depend on current date, but should show "years ago" or "months ago"
    expect(screen.getAllByText(/\d+ year[s]? ago/)).toHaveLength(5); // All 5 milestones should have relative times
  });

  it('should filter milestones by type', () => {
    render(<TimelineSection {...defaultProps} />);

    // Filter by education
    const filterSelect = screen.getByDisplayValue('All Events');
    fireEvent.change(filterSelect, { target: { value: 'education' } });

    // Should only show education milestone
    expect(screen.getByText('Graduated with Computer Science Degree')).toBeInTheDocument();
    expect(screen.queryByText('Promoted to Senior Developer')).not.toBeInTheDocument();
    expect(screen.queryByText('AWS Solutions Architect Certification')).not.toBeInTheDocument();
  });

  it('should expand and collapse milestone details', () => {
    const mockOnMilestoneToggle = vi.fn();
    render(<TimelineSection {...defaultProps} onMilestoneToggle={mockOnMilestoneToggle} />);

    // Initially, details should not be visible
    expect(screen.queryByText('GPA: 3.8/4.0')).not.toBeInTheDocument();

    // Click on graduation milestone
    const graduationMilestone = screen.getByText('Graduated with Computer Science Degree').closest('[class*="cursor-pointer"]');
    fireEvent.click(graduationMilestone!);

    expect(mockOnMilestoneToggle).toHaveBeenCalledWith('graduation');
  });

  it('should show expanded milestone details when milestone is expanded', () => {
    render(<TimelineSection {...defaultProps} expandedMilestone="graduation" />);

    // Details should be visible
    expect(screen.getByText('Details:')).toBeInTheDocument();
    expect(screen.getByText('GPA: 3.8/4.0')).toBeInTheDocument();
    expect(screen.getByText('Relevant coursework: Data Structures')).toBeInTheDocument();
  });

  it('should show collapse hint when milestone is expanded', () => {
    render(<TimelineSection {...defaultProps} expandedMilestone="graduation" />);

    expect(screen.getByText('Click to collapse details')).toBeInTheDocument();
  });

  it('should show expand hint when milestone is collapsed', () => {
    render(<TimelineSection {...defaultProps} />);

    // Should show expand hints for milestones with details
    expect(screen.getAllByText('Click to expand details')).toHaveLength(3); // graduation, senior-dev, hackathon-win have details
  });

  it('should handle milestone toggle to collapse', () => {
    const mockOnMilestoneToggle = vi.fn();
    render(<TimelineSection {...defaultProps} expandedMilestone="graduation" onMilestoneToggle={mockOnMilestoneToggle} />);

    // Click on expanded milestone to collapse
    const graduationMilestone = screen.getByText('Graduated with Computer Science Degree').closest('[class*="cursor-pointer"]');
    fireEvent.click(graduationMilestone!);

    expect(mockOnMilestoneToggle).toHaveBeenCalledWith(null);
  });

  it('should display timeline summary statistics', () => {
    render(<TimelineSection {...defaultProps} />);

    expect(screen.getByText('Timeline Summary')).toBeInTheDocument();

    // Check counts for each type
    const summarySection = screen.getByText('Timeline Summary').closest('div');
    
    // Should show counts: 1 Education, 1 Work, 1 Certification, 1 Project, 1 Achievement
    expect(summarySection).toHaveTextContent('1'); // Multiple instances of "1"
    expect(summarySection).toHaveTextContent('Education');
    expect(summarySection).toHaveTextContent('Work');
    expect(summarySection).toHaveTextContent('Certification');
    expect(summarySection).toHaveTextContent('Project');
    expect(summarySection).toHaveTextContent('Achievement');
  });

  it('should handle empty timeline', () => {
    render(<TimelineSection {...defaultProps} timeline={[]} />);

    expect(screen.getByText('Career Timeline')).toBeInTheDocument();
    expect(screen.getByText('Timeline Summary')).toBeInTheDocument();
    
    // Summary should show zeros
    const summarySection = screen.getByText('Timeline Summary').closest('div');
    expect(summarySection).toHaveTextContent('0');
  });

  it('should not show details section for milestones without details', () => {
    render(<TimelineSection {...defaultProps} expandedMilestone="aws-cert" />);

    // AWS cert milestone has no details, so should not show details section
    expect(screen.queryByText('Details:')).not.toBeInTheDocument();
  });

  it('should show correct arrow direction for expand/collapse button', () => {
    const { rerender } = render(<TimelineSection {...defaultProps} />);

    // Find expand button (should point down)
    const expandButtons = screen.getAllByLabelText('Expand details');
    expect(expandButtons.length).toBeGreaterThan(0);

    // Rerender with expanded milestone
    rerender(<TimelineSection {...defaultProps} expandedMilestone="graduation" />);

    // Should now have collapse button (arrow pointing up)
    expect(screen.getByLabelText('Collapse details')).toBeInTheDocument();
  });

  it('should apply correct styling for different milestone types', () => {
    render(<TimelineSection {...defaultProps} />);

    // Find milestone type badges (not select options)
    const educationBadge = screen.getAllByText('Education').find(el => 
      el.className.includes('px-2 py-1 rounded')
    );
    const workBadge = screen.getAllByText('Work').find(el => 
      el.className.includes('px-2 py-1 rounded')
    );

    // Check that badges have different classes (indicating different colors)
    expect(educationBadge?.className).toContain('blue');
    expect(workBadge?.className).toContain('green');
  });
});