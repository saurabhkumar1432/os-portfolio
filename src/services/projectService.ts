import type { Project, ProjectLoadError } from '../types';

// Sample project data
const sampleProjects: Project[] = [
  {
    slug: 'mentorshala',
    title: 'MentorShala - Mentor-Mentee Platform',
    summary: 'Platform connecting mentors and mentees with Tinder-like matching interface',
    description: `A comprehensive platform designed to connect mentors and mentees, providing a unique interface 
    to facilitate mentorship and networking. Features a Tinder-like interface for matching, real-time chat 
    functionality, and a community section to foster collaboration. Built with modern web technologies 
    and deployed with CI/CD pipeline.`,
    year: 2023,
    role: 'Full Stack Developer',
    tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'CI/CD', 'Docker', 'Mocha', 'Chai'],
    type: 'web',
    links: {
      github: 'https://github.com/saurabhkumar1432/mentorshala',
      demo: 'https://mentorshala.netlify.app/'
    },
    media: {
      cover: '/images/projects/mentorshala-cover.jpg',
      gallery: [
        '/images/projects/mentorshala-matching.jpg',
        '/images/projects/mentorshala-chat.jpg',
        '/images/projects/mentorshala-community.jpg'
      ]
    },
    highlights: [
      'Tinder-like matching interface for mentor-mentee connections',
      'Real-time chat functionality for seamless communication',
      'Community section for collaboration and networking',
      'Agile development methodology with comprehensive testing',
      'CI/CD pipeline for automated deployment'
    ],
    metrics: [
      { label: 'Users Connected', value: '500+' },
      { label: 'Test Coverage', value: '85%' },
      { label: 'Response Time', value: '<200ms' }
    ],
    featured: true,
    complexity: 8
  },
  {
    slug: 'projectpulse',
    title: 'ProjectPulse - Project Management App',
    summary: 'Project management application with GraphQL and real-time monitoring',
    description: `A comprehensive project management application built with React and GraphQL. 
    Features include client and project management, progress monitoring, and real-time updates. 
    Designed for teams to efficiently track project milestones and collaborate effectively.`,
    year: 2023,
    role: 'Frontend Developer',
    tech: ['React.js', 'GraphQL', 'MongoDB', 'Node.js'],
    type: 'web',
    links: {
      github: 'https://github.com/saurabhkumar1432/projectpulse',
      demo: 'https://project-management-zypher.netlify.app/'
    },
    media: {
      cover: '/images/projects/projectpulse-cover.jpg',
      gallery: [
        '/images/projects/projectpulse-dashboard.jpg',
        '/images/projects/projectpulse-projects.jpg',
        '/images/projects/projectpulse-clients.jpg'
      ]
    },
    highlights: [
      'Client and project management system',
      'Real-time project progress monitoring',
      'GraphQL for efficient data fetching',
      'Responsive design for all devices',
      'Intuitive user interface for project tracking'
    ],
    metrics: [
      { label: 'Projects Managed', value: '100+' },
      { label: 'Query Efficiency', value: '40% faster' },
      { label: 'User Satisfaction', value: '4.8/5' }
    ],
    featured: true,
    complexity: 7
  },
  {
    slug: 'logitics',
    title: 'Logitics - Jenkins Monitoring System',
    summary: 'Full-stack Next.js application for centralized Jenkins logs monitoring',
    description: `A comprehensive monitoring solution for Jenkins logs and test files, built with Next.js. 
    Provides centralized monitoring capabilities for better test diagnostics across performance, QA, 
    and development teams. Features real-time log analysis and comprehensive reporting dashboard.`,
    year: 2024,
    role: 'Full Stack Developer',
    tech: ['Next.js', 'Jenkins', 'Node.js', 'MongoDB', 'Docker'],
    type: 'systems',
    links: {
      github: 'https://github.com/saurabhkumar1432/logitics'
    },
    media: {
      cover: '/images/projects/logitics-cover.jpg',
      gallery: [
        '/images/projects/logitics-dashboard.jpg',
        '/images/projects/logitics-logs.jpg',
        '/images/projects/logitics-analytics.jpg'
      ]
    },
    highlights: [
      'Centralized Jenkins logs and test files monitoring',
      'Real-time log analysis and reporting',
      'Cross-team collaboration for QA, performance, and development',
      'Automated test diagnostics and insights',
      'Scalable architecture for enterprise use'
    ],
    metrics: [
      { label: 'Log Processing', value: '10k+/day' },
      { label: 'Team Efficiency', value: '+70%' },
      { label: 'Test Analysis Speed', value: '+40%' }
    ],
    featured: true,
    complexity: 9
  },
];

class ProjectService {
  private projects: Map<string, Project> = new Map();
  private loadErrors: ProjectLoadError[] = [];
  private initialized = false;

  /**
   * Initialize the project service with sample data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load sample projects
      for (const project of sampleProjects) {
        const validationError = this.validateProject(project);
        if (validationError) {
          this.loadErrors.push({
            slug: project.slug,
            message: validationError,
            type: 'validation'
          });
          continue;
        }
        this.projects.set(project.slug, project);
      }

      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize project service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all projects
   */
  async getAllProjects(): Promise<Project[]> {
    await this.initialize();
    return Array.from(this.projects.values());
  }

  /**
   * Get a project by slug
   */
  async getProject(slug: string): Promise<Project | null> {
    await this.initialize();
    return this.projects.get(slug) || null;
  }

  /**
   * Get featured projects
   */
  async getFeaturedProjects(): Promise<Project[]> {
    const projects = await this.getAllProjects();
    return projects.filter(project => project.featured);
  }

  /**
   * Get projects by technology
   */
  async getProjectsByTech(tech: string): Promise<Project[]> {
    const projects = await this.getAllProjects();
    return projects.filter(project => 
      project.tech.some(t => t.toLowerCase().includes(tech.toLowerCase()))
    );
  }

  /**
   * Get projects by type
   */
  async getProjectsByType(type: Project['type']): Promise<Project[]> {
    const projects = await this.getAllProjects();
    return projects.filter(project => project.type === type);
  }

  /**
   * Get projects by year range
   */
  async getProjectsByYear(startYear: number, endYear?: number): Promise<Project[]> {
    const projects = await this.getAllProjects();
    const end = endYear || startYear;
    return projects.filter(project => 
      project.year >= startYear && project.year <= end
    );
  }

  /**
   * Search projects by query
   */
  async searchProjects(query: string): Promise<Project[]> {
    const projects = await this.getAllProjects();
    const lowerQuery = query.toLowerCase();
    
    return projects.filter(project => 
      project.title.toLowerCase().includes(lowerQuery) ||
      project.summary.toLowerCase().includes(lowerQuery) ||
      project.description.toLowerCase().includes(lowerQuery) ||
      project.tech.some(tech => tech.toLowerCase().includes(lowerQuery)) ||
      project.highlights?.some(highlight => highlight.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get all unique technologies used across projects
   */
  async getAllTechnologies(): Promise<string[]> {
    const projects = await this.getAllProjects();
    const techSet = new Set<string>();
    
    projects.forEach(project => {
      project.tech.forEach(tech => techSet.add(tech));
    });
    
    return Array.from(techSet).sort();
  }

  /**
   * Get all project types
   */
  async getProjectTypes(): Promise<Project['type'][]> {
    const projects = await this.getAllProjects();
    const typeSet = new Set<Project['type']>();
    
    projects.forEach(project => {
      typeSet.add(project.type);
    });
    
    return Array.from(typeSet);
  }

  /**
   * Get all years with projects
   */
  async getProjectYears(): Promise<number[]> {
    const projects = await this.getAllProjects();
    const yearSet = new Set<number>();
    
    projects.forEach(project => {
      yearSet.add(project.year);
    });
    
    return Array.from(yearSet).sort((a, b) => b - a);
  }

  /**
   * Get load errors
   */
  getLoadErrors(): ProjectLoadError[] {
    return [...this.loadErrors];
  }

  /**
   * Clear load errors
   */
  clearLoadErrors(): void {
    this.loadErrors = [];
  }

  /**
   * Validate a project object
   */
  private validateProject(project: any): string | null {
    if (!project || typeof project !== 'object') {
      return 'Project must be an object';
    }

    const requiredFields = ['slug', 'title', 'summary', 'description', 'year', 'role', 'tech', 'type', 'featured', 'complexity'];
    
    for (const field of requiredFields) {
      if (!(field in project)) {
        return `Missing required field: ${field}`;
      }
    }

    if (typeof project.slug !== 'string' || !project.slug.trim()) {
      return 'Slug must be a non-empty string';
    }

    if (typeof project.title !== 'string' || !project.title.trim()) {
      return 'Title must be a non-empty string';
    }

    if (typeof project.year !== 'number' || project.year < 1900 || project.year > new Date().getFullYear() + 1) {
      return 'Year must be a valid number';
    }

    if (!Array.isArray(project.tech) || project.tech.length === 0) {
      return 'Tech must be a non-empty array';
    }

    if (!['web', 'mobile', 'systems', 'ml'].includes(project.type)) {
      return 'Type must be one of: web, mobile, systems, ml';
    }

    if (typeof project.complexity !== 'number' || project.complexity < 1 || project.complexity > 10) {
      return 'Complexity must be a number between 1 and 10';
    }

    if (typeof project.featured !== 'boolean') {
      return 'Featured must be a boolean';
    }

    // Validate optional fields if present
    if (project.links && typeof project.links !== 'object') {
      return 'Links must be an object';
    }

    if (project.media && typeof project.media !== 'object') {
      return 'Media must be an object';
    }

    if (project.highlights && !Array.isArray(project.highlights)) {
      return 'Highlights must be an array';
    }

    if (project.metrics && !Array.isArray(project.metrics)) {
      return 'Metrics must be an array';
    }

    return null;
  }

  /**
   * Load project from MDX content (future implementation)
   */
  async loadProjectFromMDX(slug: string, _content: string): Promise<Project | null> {
    try {
      // This would parse MDX frontmatter and content
      // For now, return null as MDX parsing is not implemented
      console.warn('MDX loading not yet implemented');
      return null;
    } catch (error) {
      this.loadErrors.push({
        slug,
        message: `Failed to parse MDX: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'parsing'
      });
      return null;
    }
  }

  /**
   * Reload all projects (useful for development)
   */
  async reload(): Promise<void> {
    this.projects.clear();
    this.loadErrors = [];
    this.initialized = false;
    await this.initialize();
  }
}

// Export singleton instance
export const projectService = new ProjectService();