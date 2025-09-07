import type { AboutData, Institution, Company, Skill, TimelineMilestone, ContactInfo } from '../types';

/**
 * About service for managing personal and professional information
 */
class AboutService {
  private aboutData: AboutData | null = null;

  /**
   * Get all about data
   */
  async getAboutData(): Promise<AboutData> {
    if (this.aboutData) {
      return this.aboutData;
    }

    // In a real app, this would come from a CMS or API
    // For now, we'll use static data
    this.aboutData = {
      institutions: this.getInstitutions(),
      companies: this.getCompanies(),
      skills: this.getSkills(),
      timeline: this.getTimeline(),
      contact: this.getContactInfo(),
    };

    return this.aboutData;
  }

  /**
   * Get education institutions
   */
  private getInstitutions(): Institution[] {
    return [
      {
        name: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startYear: 2018,
        endYear: 2022,
        gpa: '3.8/4.0',
        honors: ['Magna Cum Laude', 'Dean\'s List'],
        description: 'Focused on software engineering, algorithms, and system design. Active in computer science club and hackathons.',
      },
      {
        name: 'Tech Institute',
        degree: 'Certificate',
        field: 'Full Stack Web Development',
        startYear: 2017,
        endYear: 2018,
        description: 'Intensive program covering modern web technologies and best practices.',
      },
    ];
  }

  /**
   * Get work experience
   */
  private getCompanies(): Company[] {
    return [
      {
        name: 'Tech Solutions Inc.',
        position: 'Senior Full Stack Developer',
        startDate: '2022-06',
        location: 'San Francisco, CA',
        description: 'Lead development of enterprise web applications serving 100k+ users. Architected microservices infrastructure and mentored junior developers.',
        achievements: [
          'Reduced application load time by 40% through optimization',
          'Led migration to cloud-native architecture',
          'Mentored 3 junior developers',
          'Implemented CI/CD pipeline reducing deployment time by 60%',
        ],
        technologies: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'PostgreSQL'],
      },
      {
        name: 'StartupCo',
        position: 'Frontend Developer',
        startDate: '2021-01',
        endDate: '2022-05',
        location: 'Remote',
        description: 'Built responsive web applications for early-stage startup. Collaborated closely with design and product teams.',
        achievements: [
          'Developed MVP that secured $2M Series A funding',
          'Implemented real-time collaboration features',
          'Achieved 98% test coverage',
        ],
        technologies: ['Vue.js', 'JavaScript', 'Firebase', 'Tailwind CSS'],
      },
      {
        name: 'Digital Agency',
        position: 'Junior Developer',
        startDate: '2020-06',
        endDate: '2020-12',
        location: 'New York, NY',
        description: 'Developed client websites and maintained existing projects. Gained experience in various technologies and project management.',
        achievements: [
          'Delivered 15+ client projects on time',
          'Improved website performance scores by 25%',
          'Learned agile development practices',
        ],
        technologies: ['HTML', 'CSS', 'JavaScript', 'WordPress', 'PHP'],
      },
    ];
  }

  /**
   * Get technical skills
   */
  private getSkills(): Skill[] {
    return [
      // Frontend
      { name: 'React', category: 'frontend', proficiency: 5, yearsOfExperience: 4, relatedProjects: ['portfolio-os', 'task-manager'] },
      { name: 'TypeScript', category: 'frontend', proficiency: 5, yearsOfExperience: 3, relatedProjects: ['portfolio-os', 'api-gateway'] },
      { name: 'Vue.js', category: 'frontend', proficiency: 4, yearsOfExperience: 2, relatedProjects: ['dashboard-app'] },
      { name: 'HTML/CSS', category: 'frontend', proficiency: 5, yearsOfExperience: 5 },
      { name: 'Tailwind CSS', category: 'frontend', proficiency: 4, yearsOfExperience: 2, relatedProjects: ['portfolio-os'] },
      
      // Backend
      { name: 'Node.js', category: 'backend', proficiency: 4, yearsOfExperience: 3, relatedProjects: ['api-gateway', 'chat-app'] },
      { name: 'Python', category: 'backend', proficiency: 4, yearsOfExperience: 3, relatedProjects: ['ml-classifier'] },
      { name: 'Express.js', category: 'backend', proficiency: 4, yearsOfExperience: 3 },
      { name: 'FastAPI', category: 'backend', proficiency: 3, yearsOfExperience: 1 },
      
      // Database
      { name: 'PostgreSQL', category: 'database', proficiency: 4, yearsOfExperience: 3 },
      { name: 'MongoDB', category: 'database', proficiency: 3, yearsOfExperience: 2 },
      { name: 'Redis', category: 'database', proficiency: 3, yearsOfExperience: 1 },
      
      // DevOps
      { name: 'Docker', category: 'devops', proficiency: 4, yearsOfExperience: 2 },
      { name: 'AWS', category: 'devops', proficiency: 3, yearsOfExperience: 2 },
      { name: 'CI/CD', category: 'devops', proficiency: 4, yearsOfExperience: 2 },
      
      // Mobile
      { name: 'React Native', category: 'mobile', proficiency: 3, yearsOfExperience: 1, relatedProjects: ['mobile-app'] },
      
      // Tools
      { name: 'Git', category: 'tools', proficiency: 5, yearsOfExperience: 5 },
      { name: 'VS Code', category: 'tools', proficiency: 5, yearsOfExperience: 5 },
      { name: 'Figma', category: 'tools', proficiency: 3, yearsOfExperience: 2 },
      
      // Languages
      { name: 'JavaScript', category: 'languages', proficiency: 5, yearsOfExperience: 5 },
      { name: 'Python', category: 'languages', proficiency: 4, yearsOfExperience: 3 },
      { name: 'Java', category: 'languages', proficiency: 3, yearsOfExperience: 2 },
    ];
  }

  /**
   * Get timeline milestones
   */
  private getTimeline(): TimelineMilestone[] {
    const timeline: TimelineMilestone[] = [
      {
        id: 'graduation',
        date: '2022-05',
        title: 'Graduated with Computer Science Degree',
        type: 'education',
        description: 'Completed Bachelor of Science in Computer Science with Magna Cum Laude honors',
        details: [
          'GPA: 3.8/4.0',
          'Relevant coursework: Data Structures, Algorithms, Software Engineering',
          'Senior project: Distributed task scheduling system',
        ],
        icon: '🎓',
        company: 'University of Technology',
        location: 'Boston, MA',
      },
      {
        id: 'senior-dev',
        date: '2022-06',
        title: 'Promoted to Senior Full Stack Developer',
        type: 'work',
        description: 'Joined Tech Solutions Inc. as Senior Developer, leading enterprise application development',
        details: [
          'Leading team of 5 developers',
          'Architecting microservices infrastructure',
          'Mentoring junior developers',
        ],
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
        details: [
          'Comprehensive cloud architecture knowledge',
          'Best practices for scalable systems',
          'Security and compliance expertise',
        ],
        icon: '☁️',
      },
      {
        id: 'portfolio-os',
        date: '2024-01',
        title: 'Launched Portfolio OS Project',
        type: 'achievement',
        description: 'Created innovative portfolio website with desktop OS interface',
        details: [
          'Built with React, TypeScript, and Tailwind CSS',
          'Implemented window management system',
          'Achieved 95+ Lighthouse scores',
        ],
        icon: '🚀',
      },
      {
        id: 'hackathon-win',
        date: '2023-09',
        title: 'Won Best Technical Innovation Award',
        type: 'achievement',
        description: 'First place at TechCrunch Hackathon for AI-powered code review tool',
        details: [
          'Built in 48 hours with team of 4',
          'Integrated GPT-4 for intelligent code analysis',
          'Received $10,000 prize and mentorship',
        ],
        icon: '🏆',
      },
    ];
    return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Get contact information
   */
  private getContactInfo(): ContactInfo {
    return {
      email: 'john.doe@example.com',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      website: 'https://johndoe.dev',
      location: 'San Francisco, CA',
    };
  }

  /**
   * Get skills by category
   */
  async getSkillsByCategory(category?: Skill['category']): Promise<Skill[]> {
    const data = await this.getAboutData();
    if (!category) return data.skills;
    return data.skills.filter(skill => skill.category === category);
  }

  /**
   * Get skills related to specific projects
   */
  async getSkillsForProjects(projectSlugs: string[]): Promise<Skill[]> {
    const data = await this.getAboutData();
    return data.skills.filter(skill => 
      skill.relatedProjects?.some(project => projectSlugs.includes(project))
    );
  }

  /**
   * Get timeline milestones by type
   */
  async getTimelineByType(type?: TimelineMilestone['type']): Promise<TimelineMilestone[]> {
    const data = await this.getAboutData();
    if (!type) return data.timeline;
    return data.timeline.filter(milestone => milestone.type === type);
  }
}

export const aboutService = new AboutService();