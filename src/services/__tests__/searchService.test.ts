import { describe, it, expect, beforeEach } from 'vitest';
import { searchService } from '../searchService';

describe('SearchService', () => {
  beforeEach(() => {
    // Reset search index before each test
    searchService.updateSearchIndex();
  });

  describe('search functionality', () => {
    it('should return empty results for empty query', () => {
      const results = searchService.search('');
      expect(results).toEqual([]);
    });

    it('should return empty results for whitespace query', () => {
      const results = searchService.search('   ');
      expect(results).toEqual([]);
    });

    it('should find apps by title', () => {
      const results = searchService.search('projects');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title.toLowerCase()).toContain('projects');
    });

    it('should find apps by description', () => {
      const results = searchService.search('portfolio');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.description.toLowerCase().includes('portfolio'))).toBe(true);
    });

    it('should find apps by keywords', () => {
      const results = searchService.search('development');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should perform fuzzy search', () => {
      const results = searchService.search('projcts'); // Typo in "projects"
      expect(results.length).toBeGreaterThan(0);
    });

    it('should limit results to 10 items', () => {
      const results = searchService.search('a'); // Very broad search
      expect(results.length).toBeLessThanOrEqual(10);
    });

    it('should include score and matches in results', () => {
      const results = searchService.search('projects');
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('score');
        expect(results[0]).toHaveProperty('matches');
      }
    });

    it('should sort results by relevance', () => {
      const results = searchService.search('file');
      if (results.length > 1) {
        // Results should be sorted by score (lower score = better match)
        for (let i = 1; i < results.length; i++) {
          expect(results[i].score).toBeGreaterThanOrEqual(results[i - 1].score!);
        }
      }
    });
  });

  describe('category filtering', () => {
    it('should return apps by category', () => {
      const apps = searchService.getItemsByCategory('app');
      expect(apps.length).toBeGreaterThan(0);
      expect(apps.every(item => item.category === 'app')).toBe(true);
    });

    it('should return projects by category', () => {
      const projects = searchService.getItemsByCategory('project');
      expect(projects.length).toBeGreaterThan(0);
      expect(projects.every(item => item.category === 'project')).toBe(true);
    });

    it('should return files by category', () => {
      const files = searchService.getItemsByCategory('file');
      expect(files.length).toBeGreaterThan(0);
      expect(files.every(item => item.category === 'file')).toBe(true);
    });

    it('should return commands by category', () => {
      const commands = searchService.getItemsByCategory('command');
      expect(commands.length).toBeGreaterThan(0);
      expect(commands.every(item => item.category === 'command')).toBe(true);
    });
  });

  describe('app management', () => {
    it('should return all apps', () => {
      const apps = searchService.getAllApps();
      expect(apps.length).toBeGreaterThan(0);
      expect(apps.every(app => app.category === 'app')).toBe(true);
    });

    it('should return pinned apps', () => {
      const pinnedIds = ['projects', 'terminal'];
      const pinnedApps = searchService.getPinnedApps(pinnedIds);
      expect(pinnedApps.length).toBe(2);
      expect(pinnedApps.every(app => pinnedIds.includes(app.id))).toBe(true);
    });

    it('should return recent apps', () => {
      const recentIds = ['file-explorer', 'about'];
      const recentApps = searchService.getRecentApps(recentIds);
      expect(recentApps.length).toBe(2);
      expect(recentApps.every(app => recentIds.includes(app.id))).toBe(true);
    });

    it('should handle empty pinned apps list', () => {
      const pinnedApps = searchService.getPinnedApps([]);
      expect(pinnedApps).toEqual([]);
    });

    it('should handle invalid app IDs', () => {
      const pinnedApps = searchService.getPinnedApps(['invalid-app-id'] as any);
      expect(pinnedApps).toEqual([]);
    });
  });

  describe('search index updates', () => {
    it('should rebuild search index when updated', () => {
      const initialResults = searchService.search('projects');
      searchService.updateSearchIndex();
      const updatedResults = searchService.search('projects');
      
      // Results should be consistent after update
      expect(updatedResults.length).toBe(initialResults.length);
    });
  });

  describe('action execution', () => {
    it('should have action functions for all items', () => {
      const allApps = searchService.getAllApps();
      allApps.forEach(app => {
        expect(typeof app.action).toBe('function');
      });

      const commands = searchService.getItemsByCategory('command');
      commands.forEach(command => {
        expect(typeof command.action).toBe('function');
      });
    });
  });
});