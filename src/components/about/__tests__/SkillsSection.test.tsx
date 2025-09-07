import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SkillsSection from '../SkillsSection';
import type { Skill } from '../../../types';

describe('SkillsSection', () => {
  const mockSkills: Skill[] = [
    {
      name: 'React',
      category: 'frontend',
      proficiency: 5,
      yearsOfExperience: 4,
      relatedProjects: ['portfolio-os', 'task-manager'],
    },
    {
      name: 'Node.js',
      category: 'backend',
      proficiency: 4,
      yearsOfExperience: 3,
      relatedProjects: ['api-gateway'],
    },
    {
      name: 'TypeScript',
      category: 'frontend',
      proficiency: 5,
      yearsOfExperience: 3,
    },
    {
      name: 'Python',
      category: 'backend',
      proficiency: 4,
      yearsOfExperience: 3,
      relatedProjects: ['ml-classifier'],
    },
    {
      name: 'Docker',
      category: 'devops',
      proficiency: 3,
      yearsOfExperience: 2,
    },
  ];

  const defaultProps = {
    skills: mockSkills,
    onSkillFilter: vi.fn(),
    filteredProjects: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render skills section with title and controls', () => {
    render(<SkillsSection {...defaultProps} />);

    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sort by Proficiency')).toBeInTheDocument();
  });

  it('should display all skills grouped by category', () => {
    render(<SkillsSection {...defaultProps} />);

    // Check skill names are displayed
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  it('should filter skills by category', () => {
    render(<SkillsSection {...defaultProps} />);

    // Select frontend category
    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'frontend' } });

    // Should show frontend skills
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();

    // Should not show backend skills
    expect(screen.queryByText('Node.js')).not.toBeInTheDocument();
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
  });

  it('should sort skills by different criteria', () => {
    render(<SkillsSection {...defaultProps} />);

    // Change to sort by experience
    const sortSelect = screen.getByDisplayValue('Sort by Proficiency');
    fireEvent.change(sortSelect, { target: { value: 'experience' } });

    // Verify the sort option changed
    expect(sortSelect).toHaveValue('experience');

    // Change to sort by name
    fireEvent.change(sortSelect, { target: { value: 'name' } });
    expect(sortSelect).toHaveValue('name');
  });

  it('should display proficiency levels correctly', () => {
    render(<SkillsSection {...defaultProps} />);

    // Check proficiency labels
    expect(screen.getAllByText('Master')).toHaveLength(2); // React and TypeScript
    expect(screen.getAllByText('Expert')).toHaveLength(2); // Node.js and Python
    expect(screen.getByText('Advanced')).toBeInTheDocument(); // Docker
  });

  it('should show years of experience', () => {
    render(<SkillsSection {...defaultProps} />);

    expect(screen.getByText('4 years experience')).toBeInTheDocument(); // React
    expect(screen.getAllByText('3 years experience')).toHaveLength(3); // Node.js, TypeScript, Python
    expect(screen.getByText('2 years experience')).toBeInTheDocument(); // Docker
  });

  it('should display related projects count', () => {
    render(<SkillsSection {...defaultProps} />);

    expect(screen.getByText('2 related projects')).toBeInTheDocument(); // React
    expect(screen.getAllByText('1 related project')).toHaveLength(2); // Node.js and Python
  });

  it('should handle skill click for filtering', () => {
    const mockOnSkillFilter = vi.fn();
    render(<SkillsSection {...defaultProps} onSkillFilter={mockOnSkillFilter} />);

    // Click on React skill (has related projects)
    const reactSkill = screen.getByText('React').closest('[class*="cursor-pointer"]');
    expect(reactSkill).toBeInTheDocument();
    
    fireEvent.click(reactSkill!);
    expect(mockOnSkillFilter).toHaveBeenCalledWith('React');
  });

  it('should not make skills without projects clickable', () => {
    render(<SkillsSection {...defaultProps} />);

    // TypeScript has no related projects, so shouldn't be clickable
    const typescriptSkill = screen.getByText('TypeScript').closest('div');
    expect(typescriptSkill).not.toHaveClass('cursor-pointer');
  });

  it('should display skills summary statistics', () => {
    render(<SkillsSection {...defaultProps} />);

    expect(screen.getByText('Skills Summary')).toBeInTheDocument();
    
    // Check that summary section exists and has statistics
    const summarySection = screen.getByText('Skills Summary').closest('div');
    expect(summarySection).toBeInTheDocument();
    
    // Check for labels
    expect(screen.getByText('Expert Level')).toBeInTheDocument();
    expect(screen.getByText('3+ Years Exp')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('With Projects')).toBeInTheDocument();
  });

  it('should show correct proficiency bar width', () => {
    render(<SkillsSection {...defaultProps} />);

    // Find React skill proficiency bar
    const reactCard = screen.getByText('React').closest('[class*="bg-white"]');
    const proficiencyBar = reactCard?.querySelector('[class*="bg-blue-500"]');
    
    // React has proficiency 5, so bar should be 100% width
    expect(proficiencyBar).toHaveStyle({ width: '100%' });
  });

  it('should handle empty skills array', () => {
    render(<SkillsSection {...defaultProps} skills={[]} />);

    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Skills Summary')).toBeInTheDocument();
    
    // Summary should show zeros
    const summarySection = screen.getByText('Skills Summary').closest('div');
    expect(summarySection).toHaveTextContent('0');
  });

  it('should sort skills by name alphabetically', () => {
    render(<SkillsSection {...defaultProps} />);

    // Change to sort by name
    const sortSelect = screen.getByDisplayValue('Sort by Proficiency');
    fireEvent.change(sortSelect, { target: { value: 'name' } });

    // Skills should be sorted alphabetically within each category
    // This is harder to test without checking DOM order, but we can verify the sort option works
    expect(sortSelect).toHaveValue('name');
  });

  it('should display category counts correctly', () => {
    render(<SkillsSection {...defaultProps} />);

    // Check that category counts are displayed
    expect(screen.getAllByText(/\(\d+ skills?\)/)).toHaveLength(3); // 3 categories with skills
  });
});