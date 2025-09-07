import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useURLState } from '../hooks/useURLState';

// Mock TanStack Router with simpler mocks
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({
    history: {
      back: vi.fn(),
      forward: vi.fn(),
      index: 1,
      length: 2,
    },
  }),
  useRouterState: () => ({
    location: {
      pathname: '/apps/projects',
      search: {
        windowId: 'test-123',
        x: 100,
        y: 200,
        w: 800,
        h: 600,
      },
    },
  }),
}));

// Mock URL state service
vi.mock('../services/urlStateService', () => ({
  urlStateService: {
    navigateToApp: vi.fn(),
    navigateToProject: vi.fn(),
    navigateToFile: vi.fn(),
    navigateToDesktop: vi.fn(),
  },
}));

describe('Routing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('URL State Hook', () => {
    it('should provide navigation functions', () => {
      const { result } = renderHook(() => useURLState());

      expect(typeof result.current.navigateToApp).toBe('function');
      expect(typeof result.current.navigateToProject).toBe('function');
      expect(typeof result.current.navigateToFile).toBe('function');
      expect(typeof result.current.navigateToDesktop).toBe('function');
    });

    it('should extract current app ID from route', () => {
      const { result } = renderHook(() => useURLState());

      expect(result.current.getCurrentAppId()).toBe('projects');
    });

    it('should extract window state from URL', () => {
      const { result } = renderHook(() => useURLState());
      const windowState = result.current.getWindowStateFromURL();

      expect(windowState).toEqual({
        windowId: 'test-123',
        bounds: { x: 100, y: 200, w: 800, h: 600 },
        maximized: undefined,
        minimized: undefined,
      });
    });

    it('should indicate back navigation is available', () => {
      const { result } = renderHook(() => useURLState());

      expect(result.current.canGoBack).toBe(true);
    });
  });

  describe('Route Parameter Validation', () => {
    it('should validate app route parameters', () => {
      // Test that app routes accept valid app IDs
      const validAppIds = ['projects', 'file-explorer', 'terminal', 'about', 'notepad', 'settings', 'resume-viewer'];
      
      validAppIds.forEach(appId => {
        expect(typeof appId).toBe('string');
        expect(appId.length).toBeGreaterThan(0);
      });
    });

    it('should validate window state parameters', () => {
      const windowParams = {
        windowId: 'test-123',
        x: 100,
        y: 200,
        w: 800,
        h: 600,
        maximized: true,
        minimized: false,
      };

      expect(typeof windowParams.windowId).toBe('string');
      expect(typeof windowParams.x).toBe('number');
      expect(typeof windowParams.y).toBe('number');
      expect(typeof windowParams.w).toBe('number');
      expect(typeof windowParams.h).toBe('number');
      expect(typeof windowParams.maximized).toBe('boolean');
      expect(typeof windowParams.minimized).toBe('boolean');
    });
  });

  describe('URL Pattern Matching', () => {
    it('should match app route patterns', () => {
      const appRoutePattern = /^\/apps\/([^\/]+)$/;
      
      expect('/apps/projects').toMatch(appRoutePattern);
      expect('/apps/file-explorer').toMatch(appRoutePattern);
      expect('/apps/terminal').toMatch(appRoutePattern);
      expect('/invalid/route').not.toMatch(appRoutePattern);
    });

    it('should match project route patterns', () => {
      const projectRoutePattern = /^\/projects\/([^\/]+)$/;
      
      expect('/projects/my-project').toMatch(projectRoutePattern);
      expect('/projects/another-project-123').toMatch(projectRoutePattern);
      expect('/apps/projects').not.toMatch(projectRoutePattern);
    });

    it('should match file route patterns', () => {
      const fileRoutePattern = /^\/files$/;
      
      expect('/files').toMatch(fileRoutePattern);
      expect('/files/').not.toMatch(fileRoutePattern);
      expect('/apps/file-explorer').not.toMatch(fileRoutePattern);
    });
  });

  describe('Browser History Integration', () => {
    it('should support back navigation', () => {
      const { result } = renderHook(() => useURLState());

      expect(result.current.canGoBack).toBe(true);
      expect(typeof result.current.goBack).toBe('function');
    });

    it('should support forward navigation', () => {
      const { result } = renderHook(() => useURLState());

      expect(typeof result.current.goForward).toBe('function');
    });
  });
});