import type { Project, ProjectLoadError } from '../types';

// Sample project data
const sampleProjects: Project[] = [
  {
    slug: 'portfolio-os',
    title: 'Portfolio OS Website',
    summary: 'Interactive desktop OS experience built with React and TypeScript',
    description: `A unique portfolio website that simulates a desktop operating system environment. 
    Features include draggable windows, a taskbar, start menu, file explorer, and various applications 
    to showcase projects and professional experience. Built with modern web technologies for smooth 
    interactions and excellent performance.`,
    year: 2024,
    role: 'Full Stack Developer',
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Framer Motion', 'Vite'],
    type: 'web',
    links: {
      github: 'https://github.com/username/portfolio-os',
      demo: 'https://portfolio-os.example.com'
    },
    media: {
      cover: '/images/projects/portfolio-os-cover.jpg',
      gallery: [
        '/images/projects/portfolio-os-desktop.jpg',
        '/images/projects/portfolio-os-windows.jpg',
        '/images/projects/portfolio-os-mobile.jpg'
      ]
    },
    highlights: [
      'Custom window management system',
      'Responsive design with mobile support',
      'Keyboard navigation and accessibility',
      'PWA with offline capabilities'
    ],
    metrics: [
      { label: 'Performance Score', value: '95+' },
      { label: 'Accessibility Score', value: 'AA+' },
      { label: 'Bundle Size', value: '<250KB' }
    ],
    featured: true,
    complexity: 9
  },
  {
    slug: 'task-manager-app',
    title: 'Advanced Task Manager',
    summary: 'Feature-rich task management application with team collaboration',
    description: `A comprehensive task management solution with real-time collaboration, 
    project organization, time tracking, and advanced reporting. Includes drag-and-drop 
    kanban boards, calendar integration, and mobile apps for iOS and Android.`,
    year: 2023,
    role: 'Lead Developer',
    tech: ['React Native', 'Node.js', 'PostgreSQL', 'Socket.io', 'Redis', 'Docker'],
    type: 'mobile',
    links: {
      github: 'https://github.com/username/task-manager',
      demo: 'https://taskmanager.example.com'
    },
    media: {
      cover: '/images/projects/task-manager-cover.jpg',
      gallery: [
        '/images/projects/task-manager-dashboard.jpg',
        '/images/projects/task-manager-mobile.jpg'
      ]
    },
    highlights: [
      'Real-time collaboration with WebSocket',
      'Cross-platform mobile apps',
      'Advanced analytics and reporting',
      'Offline-first architecture'
    ],
    metrics: [
      { label: 'Active Users', value: '10K+' },
      { label: 'App Store Rating', value: '4.8/5' },
      { label: 'Performance', value: '99.9%' }
    ],
    featured: true,
    complexity: 8
  },
  {
    slug: 'ml-recommendation-engine',
    title: 'ML Recommendation Engine',
    summary: 'Machine learning system for personalized content recommendations',
    description: `A scalable recommendation engine using collaborative filtering and 
    deep learning techniques. Processes millions of user interactions to provide 
    personalized content suggestions with real-time model updates and A/B testing.`,
    year: 2023,
    role: 'ML Engineer',
    tech: ['Python', 'TensorFlow', 'Apache Kafka', 'Kubernetes', 'MLflow', 'FastAPI'],
    type: 'ml',
    links: {
      github: 'https://github.com/username/ml-recommendations',
      documentation: 'https://docs.ml-recommendations.example.com'
    },
    media: {
      cover: '/images/projects/ml-engine-cover.jpg'
    },
    highlights: [
      'Real-time model inference at scale',
      'Automated model retraining pipeline',
      'A/B testing framework integration',
      'Multi-armed bandit optimization'
    ],
    metrics: [
      { label: 'Accuracy Improvement', value: '+23%' },
      { label: 'Inference Latency', value: '<50ms' },
      { label: 'Daily Predictions', value: '1M+' }
    ],
    featured: false,
    complexity: 10
  },
  {
    slug: 'distributed-cache-system',
    title: 'Distributed Cache System',
    summary: 'High-performance distributed caching solution for microservices',
    description: `A custom distributed caching system designed for high-throughput 
    microservices architecture. Features consistent hashing, automatic failover, 
    and intelligent cache warming strategies.`,
    year: 2022,
    role: 'Systems Engineer',
    tech: ['Go', 'Redis Cluster', 'Consul', 'Prometheus', 'Grafana', 'Docker Swarm'],
    type: 'systems',
    links: {
      github: 'https://github.com/username/distributed-cache'
    },
    media: {
      cover: '/images/projects/cache-system-cover.jpg'
    },
    highlights: [
      'Sub-millisecond response times',
      'Automatic horizontal scaling',
      'Zero-downtime deployments',
      'Comprehensive monitoring'
    ],
    metrics: [
      { label: 'Throughput', value: '100K+ RPS' },
      { label: 'Latency P99', value: '<1ms' },
      { label: 'Uptime', value: '99.99%' }
    ],
    featured: false,
    complexity: 7
  }
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