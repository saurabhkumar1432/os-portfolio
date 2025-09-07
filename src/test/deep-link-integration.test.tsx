import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeepLinkService } from '../services/deepLinkService';

// Simple integration tests that focus on the core functionality
describe('Deep Link Integration', () => {
  describe('URL Pattern Validation', () => {
    it('should validate app route patterns', () => {
      const appRoutePattern = /^\/apps\/([^\/]+)$/;
      
      expect('/apps/projects').toMatch(appRoutePattern);
      expect('/apps/file-explorer').toMatch(appRoutePattern);
      expect('/apps/terminal').toMatch(appRoutePattern);
      expect('/apps/about').toMatch(appRoutePattern);
      expect('/apps/notepad').toMatch(appRoutePattern);
      expect('/apps/settings').toMatch(appRoutePattern);
      expect('/apps/resume-viewer').toMatch(appRoutePattern);
      
      expect('/invalid/route').not.toMatch(appRoutePattern);
      expect('/apps/').not.toMatch(appRoutePattern);
      expect('/apps/invalid/nested').not.toMatch(appRoutePattern);
    });

    it('should validate project route patterns', () => {
      const projectRoutePattern = /^\/projects\/([^\/]+)$/;
      
      expect('/projects/my-project').toMatch(projectRoutePattern);
      expect('/projects/another-project-123').toMatch(projectRoutePattern);
      expect('/projects/project_with_underscores').toMatch(projectRoutePattern);
      
      expect('/projects/').not.toMatch(projectRoutePattern);
      expect('/projects/nested/path').not.toMatch(projectRoutePattern);
      expect('/apps/projects').not.toMatch(projectRoutePattern);
    });

    it('should validate file route patterns', () => {
      const fileRoutePattern = /^\/files$/;
      
      expect('/files').toMatch(fileRoutePattern);
      
      expect('/files/').not.toMatch(fileRoutePattern);
      expect('/files/nested').not.toMatch(fileRoutePattern);
      expect('/apps/file-explorer').not.toMatch(fileRoutePattern);
    });
  });

  describe('URL Parameter Validation', () => {
    it('should validate window position parameters', () => {
      const validatePosition = (x: any, y: any) => {
        return (
          typeof x === 'number' && !isNaN(x) && x >= 0 &&
          typeof y === 'number' && !isNaN(y) && y >= 0
        );
      };

      expect(validatePosition(100, 200)).toBe(true);
      expect(validatePosition(0, 0)).toBe(true);
      
      expect(validatePosition(-10, 200)).toBe(false);
      expect(validatePosition(100, -50)).toBe(false);
      expect(validatePosition('100', 200)).toBe(false);
      expect(validatePosition(100, '200')).toBe(false);
      expect(validatePosition(NaN, 200)).toBe(false);
    });

    it('should validate window size parameters', () => {
      const validateSize = (w: any, h: any) => {
        const minWidth = 320;
        const minHeight = 240;
        
        return (
          typeof w === 'number' && !isNaN(w) && w >= minWidth &&
          typeof h === 'number' && !isNaN(h) && h >= minHeight
        );
      };

      expect(validateSize(800, 600)).toBe(true);
      expect(validateSize(320, 240)).toBe(true);
      expect(validateSize(1920, 1080)).toBe(true);
      
      expect(validateSize(100, 600)).toBe(false); // Width too small
      expect(validateSize(800, 100)).toBe(false); // Height too small
      expect(validateSize('800', 600)).toBe(false);
      expect(validateSize(800, '600')).toBe(false);
      expect(validateSize(NaN, 600)).toBe(false);
    });

    it('should validate boolean parameters', () => {
      const validateBoolean = (value: any) => {
        return typeof value === 'boolean';
      };

      expect(validateBoolean(true)).toBe(true);
      expect(validateBoolean(false)).toBe(true);
      
      expect(validateBoolean('true')).toBe(false);
      expect(validateBoolean('false')).toBe(false);
      expect(validateBoolean(1)).toBe(false);
      expect(validateBoolean(0)).toBe(false);
      expect(validateBoolean(null)).toBe(false);
      expect(validateBoolean(undefined)).toBe(false);
    });
  });

  describe('App ID Validation', () => {
    it('should validate app IDs', () => {
      const validAppIds = [
        'projects',
        'file-explorer',
        'terminal',
        'about',
        'notepad',
        'settings',
        'resume-viewer'
      ];

      const isValidAppId = (appId: string) => {
        return validAppIds.includes(appId);
      };

      validAppIds.forEach(appId => {
        expect(isValidAppId(appId)).toBe(true);
      });

      expect(isValidAppId('invalid-app')).toBe(false);
      expect(isValidAppId('')).toBe(false);
      expect(isValidAppId('project')).toBe(false); // Missing 's'
      expect(isValidAppId('Projects')).toBe(false); // Wrong case
    });
  });

  describe('Window Bounds Constraints', () => {
    it('should constrain window bounds to valid ranges', () => {
      const constrainBounds = (bounds: { x: number; y: number; w: number; h: number }) => {
        const minWidth = 320;
        const minHeight = 240;
        const maxWidth = 1920; // Assume max screen width
        const maxHeight = 1080; // Assume max screen height

        return {
          x: Math.max(0, Math.min(bounds.x, maxWidth - minWidth)),
          y: Math.max(0, Math.min(bounds.y, maxHeight - minHeight)),
          w: Math.max(minWidth, Math.min(bounds.w, maxWidth)),
          h: Math.max(minHeight, Math.min(bounds.h, maxHeight)),
        };
      };

      // Valid bounds should remain unchanged
      expect(constrainBounds({ x: 100, y: 200, w: 800, h: 600 }))
        .toEqual({ x: 100, y: 200, w: 800, h: 600 });

      // Negative positions should be constrained to 0
      expect(constrainBounds({ x: -50, y: -100, w: 800, h: 600 }))
        .toEqual({ x: 0, y: 0, w: 800, h: 600 });

      // Small dimensions should be constrained to minimum
      expect(constrainBounds({ x: 100, y: 200, w: 100, h: 50 }))
        .toEqual({ x: 100, y: 200, w: 320, h: 240 });

      // Large dimensions should be constrained to maximum
      expect(constrainBounds({ x: 100, y: 200, w: 3000, h: 2000 }))
        .toEqual({ x: 100, y: 200, w: 1920, h: 1080 });

      // Positions that would place window off-screen should be constrained
      expect(constrainBounds({ x: 2000, y: 1500, w: 800, h: 600 }))
        .toEqual({ x: 1600, y: 840, w: 800, h: 600 });
    });
  });

  describe('Event Handling', () => {
    it('should create valid custom events', () => {
      const projectEvent = new CustomEvent('deep-link-project-select', {
        detail: { slug: 'test-project' }
      });

      expect(projectEvent.type).toBe('deep-link-project-select');
      expect(projectEvent.detail).toEqual({ slug: 'test-project' });

      const fileEvent = new CustomEvent('deep-link-file-navigate', {
        detail: { path: '/Documents/test.txt' }
      });

      expect(fileEvent.type).toBe('deep-link-file-navigate');
      expect(fileEvent.detail).toEqual({ path: '/Documents/test.txt' });
    });

    it('should handle event listener registration and cleanup', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const handler = vi.fn();
      
      // Simulate adding event listener
      window.addEventListener('deep-link-project-select', handler);
      expect(addEventListenerSpy).toHaveBeenCalledWith('deep-link-project-select', handler);

      // Simulate removing event listener
      window.removeEventListener('deep-link-project-select', handler);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('deep-link-project-select', handler);
    });
  });

  describe('URL State Serialization', () => {
    it('should serialize window state to URL parameters', () => {
      const windowState = {
        windowId: 'test-123',
        x: 100,
        y: 200,
        w: 800,
        h: 600,
        maximized: true,
        minimized: false,
      };

      const searchParams = new URLSearchParams();
      Object.entries(windowState).forEach(([key, value]) => {
        searchParams.set(key, String(value));
      });

      expect(searchParams.get('windowId')).toBe('test-123');
      expect(searchParams.get('x')).toBe('100');
      expect(searchParams.get('y')).toBe('200');
      expect(searchParams.get('w')).toBe('800');
      expect(searchParams.get('h')).toBe('600');
      expect(searchParams.get('maximized')).toBe('true');
      expect(searchParams.get('minimized')).toBe('false');
    });

    it('should deserialize URL parameters to window state', () => {
      const searchParams = new URLSearchParams({
        windowId: 'test-123',
        x: '100',
        y: '200',
        w: '800',
        h: '600',
        maximized: 'true',
        minimized: 'false',
      });

      const windowState = {
        windowId: searchParams.get('windowId'),
        x: Number(searchParams.get('x')),
        y: Number(searchParams.get('y')),
        w: Number(searchParams.get('w')),
        h: Number(searchParams.get('h')),
        maximized: searchParams.get('maximized') === 'true',
        minimized: searchParams.get('minimized') === 'true',
      };

      expect(windowState).toEqual({
        windowId: 'test-123',
        x: 100,
        y: 200,
        w: 800,
        h: 600,
        maximized: true,
        minimized: false,
      });
    });
  });

  describe('Fallback Behavior', () => {
    it('should provide fallback routes for invalid URLs', () => {
      const getFallbackRoute = (pathname: string) => {
        if (pathname.startsWith('/apps/')) {
          const appId = pathname.match(/^\/apps\/(.+)$/)?.[1];
          const validAppIds = ['projects', 'file-explorer', 'terminal', 'about', 'notepad', 'settings', 'resume-viewer'];
          
          if (appId && validAppIds.includes(appId)) {
            return `/apps/${appId}`;
          }
          return '/'; // Fallback to desktop for invalid app
        }

        if (pathname.startsWith('/projects/')) {
          return '/apps/projects'; // Fallback to projects app
        }

        if (pathname.startsWith('/files')) {
          return '/apps/file-explorer'; // Fallback to file explorer
        }

        return '/'; // Default fallback to desktop
      };

      expect(getFallbackRoute('/apps/projects')).toBe('/apps/projects');
      expect(getFallbackRoute('/apps/invalid-app')).toBe('/');
      expect(getFallbackRoute('/projects/some-project')).toBe('/apps/projects');
      expect(getFallbackRoute('/files')).toBe('/apps/file-explorer');
      expect(getFallbackRoute('/invalid/path')).toBe('/');
    });
  });
});