import { describe, it, expect, beforeEach } from 'vitest';
import { aboutService } from '../aboutService';
import type { AboutData, Skill, TimelineMilestone } from '../../types';

describe('aboutService', () => {
  beforeEach(() => {
    // Reset the service's internal cache
    (aboutService as any).aboutData = null;
  });

  describe('getAboutData', () => {
    it('should return complete about data', async () => {
      const data = await aboutService.getAboutData();

      expect(data).toBeDefined();
      expect(data.institutions).toBeInstanceOf(Array);
      expect(data.companies).toBeInstanceOf(Array);
      expect(data.skills).toBeInstanceOf(Array);
      expect(data.timeline).toBeInstanceOf(Array);
      expect(data.contact).toBeDefined();
    });

    it('should cache data after first call', async () => {
      const firstCall = await aboutService.getAboutData();
      const secondCall = await aboutService.getAboutData();

      expect(firstCall).toBe(secondCall); // Should be the same object reference
    });

    it('should return institutions with required fields', async () => {
      const data = await aboutService.getAboutData();

      expect(data.institutions.length).toBeGreaterThan(0);
      
      data.institutions.forEach(institution => {
        expect(institution.name).toBeDefined();
        expect(institution.degree).toBeDefined();
        expect(institution.field).toBeDefined();
        expect(institution.startYear).toBeTypeOf('number');
        expect(institution.endYear).toBeTypeOf('number');
      });
    });

    it('should return companies with required fields', async () => {
      const data = await aboutService.getAboutData();

      expect(data.companies.length).toBeGreaterThan(0);
      
      data.companies.forEach(company => {
        expect(company.name).toBeDefined();
        expect(company.position).toBeDefined();
        expect(company.startDate).toBeDefined();
        expect(company.location).toBeDefined();
        expect(company.description).toBeDefined();
        expect(company.achievements).toBeInstanceOf(Array);
        expect(company.technologies).toBeInstanceOf(Array);
      });
    });

    it('should return skills with valid proficiency levels', async () => {
      const data = await aboutService.getAboutData();

      expect(data.skills.length).toBeGreaterThan(0);
      
      data.skills.forEach(skill => {
        expect(skill.name).toBeDefined();
        expect(skill.category).toBeDefined();
        expect(skill.proficiency).toBeGreaterThanOrEqual(1);
        expect(skill.proficiency).toBeLessThanOrEqual(5);
        expect(skill.yearsOfExperience).toBeGreaterThanOrEqual(0);
      });
    });

    it('should return timeline sorted by date (newest first)', async () => {
      const data = await aboutService.getAboutData();

      expect(data.timeline.length).toBeGreaterThan(0);
      
      for (let i = 0; i < data.timeline.length - 1; i++) {
        const currentDate = new Date(data.timeline[i].date);
        const nextDate = new Date(data.timeline[i + 1].date);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });

    it('should return contact info with required fields', async () => {
      const data = await aboutService.getAboutData();

      expect(data.contact.email).toBeDefined();
      expect(data.contact.linkedin).toBeDefined();
      expect(data.contact.github).toBeDefined();
      expect(data.contact.location).toBeDefined();
    });
  });

  describe('getSkillsByCategory', () => {
    it('should return all skills when no category specified', async () => {
      const allSkills = await aboutService.getSkillsByCategory();
      const data = await aboutService.getAboutData();

      expect(allSkills).toEqual(data.skills);
    });

    it('should filter skills by category', async () => {
      const frontendSkills = await aboutService.getSkillsByCategory('frontend');

      expect(frontendSkills.length).toBeGreaterThan(0);
      frontendSkills.forEach(skill => {
        expect(skill.category).toBe('frontend');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const nonExistentSkills = await aboutService.getSkillsByCategory('nonexistent' as any);

      expect(nonExistentSkills).toEqual([]);
    });

    it('should handle all valid categories', async () => {
      const categories: Skill['category'][] = [
        'frontend', 'backend', 'mobile', 'devops', 'database', 'tools', 'languages'
      ];

      for (const category of categories) {
        const skills = await aboutService.getSkillsByCategory(category);
        skills.forEach(skill => {
          expect(skill.category).toBe(category);
        });
      }
    });
  });

  describe('getSkillsForProjects', () => {
    it('should return skills related to specified projects', async () => {
      const projectSlugs = ['portfolio-os', 'task-manager'];
      const relatedSkills = await aboutService.getSkillsForProjects(projectSlugs);

      relatedSkills.forEach(skill => {
        expect(skill.relatedProjects).toBeDefined();
        expect(
          skill.relatedProjects!.some(project => projectSlugs.includes(project))
        ).toBe(true);
      });
    });

    it('should return empty array when no projects match', async () => {
      const nonExistentProjects = ['non-existent-project'];
      const relatedSkills = await aboutService.getSkillsForProjects(nonExistentProjects);

      expect(relatedSkills).toEqual([]);
    });

    it('should handle empty project list', async () => {
      const relatedSkills = await aboutService.getSkillsForProjects([]);

      expect(relatedSkills).toEqual([]);
    });

    it('should return skills that have any matching project', async () => {
      const projectSlugs = ['portfolio-os', 'non-existent-project'];
      const relatedSkills = await aboutService.getSkillsForProjects(projectSlugs);

      // Should return skills related to 'portfolio-os' even though 'non-existent-project' doesn't exist
      expect(relatedSkills.length).toBeGreaterThan(0);
      relatedSkills.forEach(skill => {
        expect(skill.relatedProjects).toContain('portfolio-os');
      });
    });
  });

  describe('getTimelineByType', () => {
    it('should return all timeline items when no type specified', async () => {
      const allTimeline = await aboutService.getTimelineByType();
      const data = await aboutService.getAboutData();

      expect(allTimeline).toEqual(data.timeline);
    });

    it('should filter timeline by type', async () => {
      const workTimeline = await aboutService.getTimelineByType('work');

      workTimeline.forEach(milestone => {
        expect(milestone.type).toBe('work');
      });
    });

    it('should return empty array for non-existent type', async () => {
      const nonExistentTimeline = await aboutService.getTimelineByType('nonexistent' as any);

      expect(nonExistentTimeline).toEqual([]);
    });

    it('should handle all valid timeline types', async () => {
      const types: TimelineMilestone['type'][] = [
        'education', 'work', 'project', 'achievement', 'certification'
      ];

      for (const type of types) {
        const timeline = await aboutService.getTimelineByType(type);
        timeline.forEach(milestone => {
          expect(milestone.type).toBe(type);
        });
      }
    });

    it('should maintain chronological order within filtered results', async () => {
      const workTimeline = await aboutService.getTimelineByType('work');

      if (workTimeline.length > 1) {
        for (let i = 0; i < workTimeline.length - 1; i++) {
          const currentDate = new Date(workTimeline[i].date);
          const nextDate = new Date(workTimeline[i + 1].date);
          expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
        }
      }
    });
  });

  describe('data validation', () => {
    it('should have skills with valid categories', async () => {
      const data = await aboutService.getAboutData();
      const validCategories = ['frontend', 'backend', 'mobile', 'devops', 'database', 'tools', 'languages'];

      data.skills.forEach(skill => {
        expect(validCategories).toContain(skill.category);
      });
    });

    it('should have timeline milestones with valid types', async () => {
      const data = await aboutService.getAboutData();
      const validTypes = ['education', 'work', 'project', 'achievement', 'certification'];

      data.timeline.forEach(milestone => {
        expect(validTypes).toContain(milestone.type);
      });
    });

    it('should have valid email format in contact info', async () => {
      const data = await aboutService.getAboutData();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test(data.contact.email)).toBe(true);
    });

    it('should have valid URLs in contact info', async () => {
      const data = await aboutService.getAboutData();
      const urlRegex = /^https?:\/\/.+/;

      expect(urlRegex.test(data.contact.linkedin)).toBe(true);
      expect(urlRegex.test(data.contact.github)).toBe(true);
      
      if (data.contact.website) {
        expect(urlRegex.test(data.contact.website)).toBe(true);
      }
    });

    it('should have consistent date formats in timeline', async () => {
      const data = await aboutService.getAboutData();
      const dateRegex = /^\d{4}-\d{2}$/; // YYYY-MM format

      data.timeline.forEach(milestone => {
        expect(dateRegex.test(milestone.date)).toBe(true);
      });
    });

    it('should have consistent date formats in companies', async () => {
      const data = await aboutService.getAboutData();
      const dateRegex = /^\d{4}-\d{2}$/; // YYYY-MM format

      data.companies.forEach(company => {
        expect(dateRegex.test(company.startDate)).toBe(true);
        if (company.endDate) {
          expect(dateRegex.test(company.endDate)).toBe(true);
        }
      });
    });
  });
});