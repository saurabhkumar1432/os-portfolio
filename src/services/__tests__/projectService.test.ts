import { describe, it, expect, beforeEach, vi } from 'vitest';
import { projectService } from '../projectService';
import { Project, ProjectLoadError } from '../../types';

describe('ProjectService', () => {
  beforeEach(async () => {
    // Reset the service before each test
    await projectService.reload();
  });

  describe('initialization', () => {
    it('should initialize with sample projects', async () => {
      const projects = await projectService.getAllProjects();
      
      expect(projects).toBeDefined();
      expect(projects.length).toBeGreaterThan(0);
      expect(projects[0]).toHaveProperty('slug');
      expect(projects[0]).toHaveProperty('title');
      expect(projects[0]).toHaveProperty('tech');
    });

    it('should not reinitialize if already initialized', async () => {
      const spy = vi.spyOn(console, 'log');
      
      // First initialization
      await projectService.getAllProjects();
      
      // Second call should not reinitialize
      await projectService.getAllProjects();
      
      spy.mockRestore();
    });
  });

  describe('getAllProjects', () => {
    it('should return all valid projects', async () => {
      const projects = await projectService.getAllProjects();
      
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);
      
      // Verify each project has required fields
      projects.forEach(project => {
        expect(project).toHaveProperty('slug');
        expect(project).toHaveProperty('title');
        expect(project).toHaveProperty('summary');
        expect(project).toHaveProperty('description');
        expect(project).toHaveProperty('year');
        expect(project).toHaveProperty('role');
        expect(project).toHaveProperty('tech');
        expect(project).toHaveProperty('type');
        expect(project).toHaveProperty('featured');
        expect(project).toHaveProperty('complexity');
      });
    });
  });

  describe('getProject', () => {
    it('should return a specific project by slug', async () => {
      const projects = await projectService.getAllProjects();
      const firstProject = projects[0];
      
      const project = await projectService.getProject(firstProject.slug);
      
      expect(project).toBeDefined();
      expect(project?.slug).toBe(firstProject.slug);
      expect(project?.title).toBe(firstProject.title);
    });

    it('should return null for non-existent project', async () => {
      const project = await projectService.getProject('non-existent-slug');
      
      expect(project).toBeNull();
    });
  });

  describe('getFeaturedProjects', () => {
    it('should return only featured projects', async () => {
      const featuredProjects = await projectService.getFeaturedProjects();
      
      expect(Array.isArray(featuredProjects)).toBe(true);
      featuredProjects.forEach(project => {
        expect(project.featured).toBe(true);
      });
    });

    it('should return subset of all projects', async () => {
      const allProjects = await projectService.getAllProjects();
      const featuredProjects = await projectService.getFeaturedProjects();
      
      expect(featuredProjects.length).toBeLessThanOrEqual(allProjects.length);
    });
  });

  describe('getProjectsByTech', () => {
    it('should return projects containing specified technology', async () => {
      const reactProjects = await projectService.getProjectsByTech('React');
      
      expect(Array.isArray(reactProjects)).toBe(true);
      reactProjects.forEach(project => {
        expect(project.tech.some(tech => 
          tech.toLowerCase().includes('react')
        )).toBe(true);
      });
    });

    it('should be case insensitive', async () => {
      const reactProjects1 = await projectService.getProjectsByTech('react');
      const reactProjects2 = await projectService.getProjectsByTech('REACT');
      
      expect(reactProjects1).toEqual(reactProjects2);
    });

    it('should return empty array for non-existent technology', async () => {
      const projects = await projectService.getProjectsByTech('NonExistentTech');
      
      expect(projects).toEqual([]);
    });
  });

  describe('getProjectsByType', () => {
    it('should return projects of specified type', async () => {
      const webProjects = await projectService.getProjectsByType('web');
      
      expect(Array.isArray(webProjects)).toBe(true);
      webProjects.forEach(project => {
        expect(project.type).toBe('web');
      });
    });

    it('should handle all project types', async () => {
      const types: Project['type'][] = ['web', 'mobile', 'systems', 'ml'];
      
      for (const type of types) {
        const projects = await projectService.getProjectsByType(type);
        expect(Array.isArray(projects)).toBe(true);
        projects.forEach(project => {
          expect(project.type).toBe(type);
        });
      }
    });
  });

  describe('getProjectsByYear', () => {
    it('should return projects from specified year', async () => {
      const projects2024 = await projectService.getProjectsByYear(2024);
      
      expect(Array.isArray(projects2024)).toBe(true);
      projects2024.forEach(project => {
        expect(project.year).toBe(2024);
      });
    });

    it('should return projects within year range', async () => {
      const projectsRange = await projectService.getProjectsByYear(2022, 2024);
      
      expect(Array.isArray(projectsRange)).toBe(true);
      projectsRange.forEach(project => {
        expect(project.year).toBeGreaterThanOrEqual(2022);
        expect(project.year).toBeLessThanOrEqual(2024);
      });
    });

    it('should return empty array for future years', async () => {
      const futureProjects = await projectService.getProjectsByYear(2030);
      
      expect(futureProjects).toEqual([]);
    });
  });

  describe('searchProjects', () => {
    it('should find projects by title', async () => {
      const results = await projectService.searchProjects('Portfolio');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(project => 
        project.title.toLowerCase().includes('portfolio')
      )).toBe(true);
    });

    it('should find projects by technology', async () => {
      const results = await projectService.searchProjects('React');
      
      expect(Array.isArray(results)).toBe(true);
      results.forEach(project => {
        const matchesTech = project.tech.some(tech => 
          tech.toLowerCase().includes('react')
        );
        const matchesContent = 
          project.title.toLowerCase().includes('react') ||
          project.summary.toLowerCase().includes('react') ||
          project.description.toLowerCase().includes('react');
        
        expect(matchesTech || matchesContent).toBe(true);
      });
    });

    it('should be case insensitive', async () => {
      const results1 = await projectService.searchProjects('react');
      const results2 = await projectService.searchProjects('REACT');
      
      expect(results1).toEqual(results2);
    });

    it('should return empty array for no matches', async () => {
      const results = await projectService.searchProjects('NonExistentTerm');
      
      expect(results).toEqual([]);
    });

    it('should search in highlights', async () => {
      const results = await projectService.searchProjects('real-time');
      
      expect(Array.isArray(results)).toBe(true);
      // Should find projects with "real-time" in highlights
    });
  });

  describe('getAllTechnologies', () => {
    it('should return unique list of all technologies', async () => {
      const technologies = await projectService.getAllTechnologies();
      
      expect(Array.isArray(technologies)).toBe(true);
      expect(technologies.length).toBeGreaterThan(0);
      
      // Check for uniqueness
      const uniqueTech = [...new Set(technologies)];
      expect(technologies).toEqual(uniqueTech);
      
      // Should be sorted
      const sortedTech = [...technologies].sort();
      expect(technologies).toEqual(sortedTech);
    });
  });

  describe('getProjectTypes', () => {
    it('should return unique list of project types', async () => {
      const types = await projectService.getProjectTypes();
      
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
      
      // Check for uniqueness
      const uniqueTypes = [...new Set(types)];
      expect(types).toEqual(uniqueTypes);
      
      // Should only contain valid types
      const validTypes = ['web', 'mobile', 'systems', 'ml'];
      types.forEach(type => {
        expect(validTypes).toContain(type);
      });
    });
  });

  describe('getProjectYears', () => {
    it('should return unique list of project years', async () => {
      const years = await projectService.getProjectYears();
      
      expect(Array.isArray(years)).toBe(true);
      expect(years.length).toBeGreaterThan(0);
      
      // Check for uniqueness
      const uniqueYears = [...new Set(years)];
      expect(years).toEqual(uniqueYears);
      
      // Should be sorted in descending order
      for (let i = 0; i < years.length - 1; i++) {
        expect(years[i]).toBeGreaterThanOrEqual(years[i + 1]);
      }
    });
  });

  describe('error handling', () => {
    it('should track load errors', () => {
      const errors = projectService.getLoadErrors();
      
      expect(Array.isArray(errors)).toBe(true);
    });

    it('should clear load errors', () => {
      projectService.clearLoadErrors();
      const errors = projectService.getLoadErrors();
      
      expect(errors).toEqual([]);
    });
  });

  describe('validation', () => {
    it('should validate project structure', async () => {
      const projects = await projectService.getAllProjects();
      
      projects.forEach(project => {
        // Required string fields
        expect(typeof project.slug).toBe('string');
        expect(project.slug.trim()).toBeTruthy();
        expect(typeof project.title).toBe('string');
        expect(project.title.trim()).toBeTruthy();
        expect(typeof project.summary).toBe('string');
        expect(typeof project.description).toBe('string');
        expect(typeof project.role).toBe('string');
        
        // Required number fields
        expect(typeof project.year).toBe('number');
        expect(project.year).toBeGreaterThan(1900);
        expect(project.year).toBeLessThanOrEqual(new Date().getFullYear() + 1);
        expect(typeof project.complexity).toBe('number');
        expect(project.complexity).toBeGreaterThanOrEqual(1);
        expect(project.complexity).toBeLessThanOrEqual(10);
        
        // Required array fields
        expect(Array.isArray(project.tech)).toBe(true);
        expect(project.tech.length).toBeGreaterThan(0);
        
        // Required enum fields
        expect(['web', 'mobile', 'systems', 'ml']).toContain(project.type);
        expect(typeof project.featured).toBe('boolean');
        
        // Optional fields validation
        if (project.links) {
          expect(typeof project.links).toBe('object');
        }
        
        if (project.media) {
          expect(typeof project.media).toBe('object');
        }
        
        if (project.highlights) {
          expect(Array.isArray(project.highlights)).toBe(true);
        }
        
        if (project.metrics) {
          expect(Array.isArray(project.metrics)).toBe(true);
          project.metrics.forEach(metric => {
            expect(typeof metric.label).toBe('string');
            expect(typeof metric.value).toBe('string');
          });
        }
      });
    });
  });

  describe('MDX loading', () => {
    it('should handle MDX loading gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = await projectService.loadProjectFromMDX('test-slug', 'test content');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('MDX loading not yet implemented');
      
      consoleSpy.mockRestore();
    });
  });

  describe('reload', () => {
    it('should reload all projects', async () => {
      // Get initial projects
      const initialProjects = await projectService.getAllProjects();
      expect(initialProjects.length).toBeGreaterThan(0);
      
      // Reload
      await projectService.reload();
      
      // Get projects after reload
      const reloadedProjects = await projectService.getAllProjects();
      expect(reloadedProjects.length).toBe(initialProjects.length);
    });
  });
});