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
        name: 'Indian Institute of Information Technology Sri City',
        degree: 'Bachelor of Technology',
        field: 'Computer Science and Engineering',
        startYear: 2020,
        endYear: 2024,
        gpa: '8.13/10.0',
        honors: [],
        description: 'Focused on Data Structures, Cyber Security, Operating Systems, Artificial Intelligence, Machine Learning, Networking, and DBMS.',
      },
    ];
  }

  /**
   * Get work experience
   */
  private getCompanies(): Company[] {
    return [
      {
        name: 'IBM India Software Labs',
        position: 'Software Developer',
        startDate: '2024-01',
        location: 'Pune, India',
        description: 'Full-stack development focused on enterprise solutions, performance testing, and data analytics tools for IBM\'s enterprise platforms.',
        achievements: [
          'Developed Logitics, a full-stack Next.js application for centralized Jenkins logs and test files monitoring',
          'Created robust Python daemon service for collecting node and pod metrics in Kubernetes clusters',
          'Enhanced datagen tool by adding new datamarts to generate realistic synthetic data',
          'Led performance test automation and benchmarking for GDSC features, reducing test execution time by 40%',
          'Improved efficiency in test data analysis by 70%',
          'Detected and logged several critical bugs in lower environments preventing production issues',
          'Contributed to GIMON and streaming-outlier module for real-time insights and alert mechanisms',
        ],
        technologies: ['Next.js', 'Python', 'Kubernetes', 'Jenkins', 'Grafana', 'MongoDB', 'Docker'],
      },
      {
        name: 'D2C Ecommerce',
        position: 'Product and Tech Intern',
        startDate: '2023-05',
        endDate: '2023-08',
        location: 'Gurugram, India',
        description: 'Focused on website performance optimization, cloud migration, and implementing advanced search solutions.',
        achievements: [
          'Optimized d2csale.com reducing loading time from 5-6 sec to 1.3-2 seconds',
          'Improved d2cecommerce.in loading time from 3 sec to 900 ms',
          'Successfully executed website migration from GoDaddy to Azure VM with integrated databases',
          'Implemented advanced AI search service and blob storage for efficient 100GB data handling',
          'Engineered comprehensive cross-departmental ticketing system for ops, marketing, and CX workflows',
        ],
        technologies: ['Azure', 'AI Search', 'Blob Storage', 'Node.js', 'React'],
      },
      {
        name: '7 Dots Smart Solution',
        position: 'SDE Intern',
        startDate: '2022-05',
        endDate: '2022-06',
        location: 'Remote',
        description: 'Software development and API services development in an agile environment.',
        achievements: [
          'Developed API services in agile environment',
          'Built Spring Boot Rest CRUD APIs using PostgreSQL database',
          'Responsible for software development and code quality',
        ],
        technologies: ['Angular', 'Spring Boot', 'TypeScript', 'PostgreSQL'],
      },
    ];
  }

  /**
   * Get technical skills
   */
  private getSkills(): Skill[] {
    return [
      // Languages
      { name: 'C++', category: 'languages', proficiency: 5, yearsOfExperience: 4 },
      { name: 'JavaScript', category: 'languages', proficiency: 5, yearsOfExperience: 4 },
      { name: 'SQL', category: 'languages', proficiency: 4, yearsOfExperience: 3 },
      { name: 'Bash', category: 'languages', proficiency: 4, yearsOfExperience: 2 },
      { name: 'Groovy', category: 'languages', proficiency: 3, yearsOfExperience: 1 },
      { name: 'Python', category: 'languages', proficiency: 4, yearsOfExperience: 3 },
      
      // Frameworks
      { name: 'Node.js', category: 'backend', proficiency: 4, yearsOfExperience: 3, relatedProjects: ['MentorShala', 'ProjectPulse'] },
      { name: 'Express.js', category: 'backend', proficiency: 4, yearsOfExperience: 3, relatedProjects: ['MentorShala'] },
      { name: 'React.js', category: 'frontend', proficiency: 5, yearsOfExperience: 4, relatedProjects: ['MentorShala', 'ProjectPulse', 'Logitics'] },
      { name: 'Next.js', category: 'frontend', proficiency: 4, yearsOfExperience: 2, relatedProjects: ['Logitics'] },
      { name: 'Angular', category: 'frontend', proficiency: 3, yearsOfExperience: 1 },
      { name: 'Spring Boot', category: 'backend', proficiency: 3, yearsOfExperience: 1 },
      { name: 'TypeScript', category: 'frontend', proficiency: 4, yearsOfExperience: 2 },
      
      // Tools
      { name: 'Docker', category: 'devops', proficiency: 4, yearsOfExperience: 2 },
      { name: 'Git', category: 'tools', proficiency: 5, yearsOfExperience: 4 },
      { name: 'MySQL', category: 'database', proficiency: 4, yearsOfExperience: 3 },
      { name: 'MongoDB', category: 'database', proficiency: 4, yearsOfExperience: 3, relatedProjects: ['MentorShala', 'ProjectPulse'] },
      { name: 'DB2', category: 'database', proficiency: 3, yearsOfExperience: 1 },
      { name: 'Jenkins', category: 'devops', proficiency: 4, yearsOfExperience: 1, relatedProjects: ['Logitics'] },
      { name: 'Kubernetes', category: 'devops', proficiency: 3, yearsOfExperience: 1 },
      { name: 'Azure', category: 'devops', proficiency: 3, yearsOfExperience: 1 },
      { name: 'GraphQL', category: 'backend', proficiency: 3, yearsOfExperience: 1, relatedProjects: ['ProjectPulse'] },
      { name: 'Grafana', category: 'tools', proficiency: 3, yearsOfExperience: 1 },
    ];
  }

  /**
   * Get timeline milestones
   */
  private getTimeline(): TimelineMilestone[] {
    const timeline: TimelineMilestone[] = [
      {
        id: 'education-start',
        date: '2020-08',
        title: 'Started B.Tech at IIIT Sri City',
        type: 'education',
        description: 'Began Computer Science and Engineering program at Indian Institute of Information Technology Sri City',
        details: [
          'Focus on Data Structures and Algorithms',
          'Coursework in Cyber Security and Operating Systems',
          'AI and Machine Learning specialization',
        ],
        icon: '🎓',
        company: 'IIIT Sri City',
        location: 'Chittoor, India',
      },
      {
        id: 'chegg-expert',
        date: '2021-11',
        title: 'Became Chegg Subject Matter Expert',
        type: 'work',
        description: 'Started providing global assistance to students by answering computer science questions',
        details: [
          'Specialized in Computer Science subjects',
          'Helped students globally with complex problems',
          'Maintained high rating and response quality',
        ],
        icon: '📚',
        company: 'Chegg',
        location: 'Remote',
      },
      {
        id: 'first-internship',
        date: '2022-05',
        title: 'SDE Intern at 7 Dots Smart Solution',
        type: 'work',
        description: 'First software development internship focusing on API development and agile practices',
        details: [
          'Built Spring Boot REST CRUD APIs',
          'Worked with PostgreSQL database',
          'Learned agile development methodologies',
        ],
        icon: '💼',
        company: '7 Dots Smart Solution',
        location: 'Remote',
      },
      {
        id: 'iota-sessions-lead',
        date: '2022-11',
        title: 'Sessions Lead at IOTA Project Club',
        type: 'achievement',
        description: 'Conducted technical sessions on upcoming technologies impacting over 400+ students',
        details: [
          'Led technical workshops and sessions',
          'Taught emerging technologies to students',
          'Managed club activities and events',
        ],
        icon: '🎯',
        company: 'IIIT Sri City',
        location: 'Sricity, India',
      },
      {
        id: 'd2c-internship',
        date: '2023-05',
        title: 'Product and Tech Intern at D2C Ecommerce',
        type: 'work',
        description: 'Focused on website performance optimization and cloud migration',
        details: [
          'Reduced website loading time by 60-70%',
          'Migrated websites from GoDaddy to Azure',
          'Implemented AI search and blob storage solutions',
        ],
        icon: '⚡',
        company: 'D2C Ecommerce',
        location: 'Gurugram, India',
      },
      {
        id: 'graduation',
        date: '2024-05',
        title: 'Graduated from IIIT Sri City',
        type: 'education',
        description: 'Completed Bachelor of Technology in Computer Science and Engineering with CGPA 8.13',
        details: [
          'CGPA: 8.13/10.0',
          'Specialized in AI, ML, and System Design',
          'Completed projects in full-stack development',
        ],
        icon: '🎓',
        company: 'IIIT Sri City',
        location: 'Chittoor, India',
      },
      {
        id: 'ibm-role',
        date: '2024-01',
        title: 'Software Developer at IBM India',
        type: 'work',
        description: 'Joined IBM as full-time Software Developer focusing on enterprise solutions',
        details: [
          'Developed Logitics - Next.js monitoring application',
          'Created Python daemon services for Kubernetes',
          'Led performance test automation reducing execution time by 40%',
        ],
        icon: '🏢',
        company: 'IBM India Software Labs',
        location: 'Pune, India',
      },
      {
        id: 'mentorshala-project',
        date: '2023-12',
        title: 'Launched MentorShala Platform',
        type: 'achievement',
        description: 'Developed platform connecting mentors and mentees with Tinder-like matching interface',
        details: [
          'Built with React.js, Node.js, Express.js, MongoDB',
          'Implemented real-time chat functionality',
          'Created community section for collaboration',
        ],
        icon: '🚀',
      },
    ];
    return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Get contact information
   */
  private getContactInfo(): ContactInfo {
    return {
      email: 'saurabhkumar1432001@gmail.com',
      linkedin: 'https://linkedin.com/in/saurabhkumar1432',
      github: 'https://github.com/saurabhkumar1432',
      website: 'https://github.com/saurabhkumar1432',
      location: 'Pune, India',
      phone: '+91-7236013036',
      leetcode: 'https://leetcode.com/saurabhkumar1432001/',
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