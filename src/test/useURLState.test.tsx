import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useURLState, useURLSync } from '../hooks/useURLState';
import { urlStateService } from '../services/urlStateService';

// Mock TanStack Router
const mockRouter = {
  history: {
    back: vi.fn(),
    forward: vi.fn(),
  },
};

const mockRouterState = {
  location: {
    pathname: '/',
    search: {},
  },
  history: [],
};

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => mockRouter,
  useRouterState: () => mockRouterState,
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

describe('useURLState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterState.location.pathname = '/';
    mockRouterState.location.search = {};
    mockRouterState.history = [];
  });

  describe('Navigation Functions', () => {
    it('should call navigateToApp with correct parameters', () => {
      const { result } = renderHook(() => useURLState());

      act(() => {
        result.current.navigateToApp('projects', {
          windowId: 'test-123',
          bounds: { x: 100, y: 200, w: 800, h: 600 },
          maximized: true,
        });
      });

      expect(urlStateService.navigateToApp).toHaveBeenCalledWith('projects', {
        windowId: 'test-123',
        bounds: { x: 100, y: 200, w: 800, h: 600 },
        maximized: true,
      });
    });

    it('should call navigateToProject with correct parameters', () => {
      const { result } = renderHook(() => useURLState());

      act(() => {
        result.current.navigateToProject('my-project', {
          bounds: { x: 50, y: 100, w: 900, h: 700 },
        });
      });

      expect(urlStateService.navigateToProject).toHaveBeenCalledWith('my-project', {
        bounds: { x: 50, y: 100, w: 900, h: 700 },
      });
    });

    it('should call navigateToFile with correct parameters', () => {
      const { result } = renderHook(() => useURLState());

      act(() => {
        result.current.navigateToFile('/Documents/test.txt', {
          windowId: 'file-123',
        });
      });

      expect(urlStateService.navigateToFile).toHaveBeenCalledWith('/Documents/test.txt', {
        windowId: 'file-123',
      });
    });

    it('should call navigateToDesktop', () => {
      const { result } = renderHook(() => useURLState());

      act(() => {
        result.current.navigateToDesktop();
      });

      expect(urlStateService.navigateToDesktop).toHaveBeenCalled();
    });
  });

  describe('Current Route Parsing', () => {
    it('should return correct app ID for app routes', () => {
      mockRouterState.location.pathname = '/apps/projects';
      const { result } = renderHook(() => useURLState());

      expect(result.current.getCurrentAppId()).toBe('projects');
    });

    it('should return projects app ID for project routes', () => {
      mockRouterState.location.pathname = '/projects/my-project';
      const { result } = renderHook(() => useURLState());

      expect(result.current.getCurrentAppId()).toBe('projects');
    });

    it('should return file-explorer app ID for file routes', () => {
      mockRouterState.location.pathname = '/files';
      const { result } = renderHook(() => useURLState());

      expect(result.current.getCurrentAppId()).toBe('file-explorer');
    });

    it('should return null for desktop route', () => {
      mockRouterState.location.pathname = '/';
      const { result } = renderHook(() => useURLState());

      expect(result.current.getCurrentAppId()).toBe(null);
    });

    it('should return project slug for project routes', () => {
      mockRouterState.location.pathname = '/projects/my-awesome-project';
      const { result } = renderHook(() => useURLState());

      expect(result.current.getCurrentProjectSlug()).toBe('my-awesome-project');
    });

    it('should return null for non-project routes', () => {
      mockRouterState.location.pathname = '/apps/projects';
      const { result } = renderHook(() => useURLState());

      expect(result.current.getCurrentProjectSlug()).toBe(null);
    });

    it('should return file path from search params', () => {
      mockRouterState.location.pathname = '/files';
      mockRouterState.location.search = { path: '/Documents/test.txt' };
      const { result } = renderHook(() => useURLState());

      expect(result.current.getCurrentFilePath()).toBe('/Documents/test.txt');
    });

    it('should return null for non-file routes', () => {
      mockRouterState.location.pathname = '/apps/projects';
      const { result } = renderHook(() => useURLState());

      expect(result.current.getCurrentFilePath()).toBe(null);
    });
  });

  describe('Browser Navigation', () => {
    it('should handle back navigation', () => {
      mockRouterState.history = ['/', '/apps/projects'];
      const { result } = renderHook(() => useURLState());

      expect(result.current.canGoBack).toBe(true);

      act(() => {
        result.current.goBack();
      });

      expect(mockRouter.history.back).toHaveBeenCalled();
    });

    it('should handle forward navigation', () => {
      const { result } = renderHook(() => useURLState());

      act(() => {
        result.current.goForward();
      });

      expect(mockRouter.history.forward).toHaveBeenCalled();
    });

    it('should indicate no back navigation when history is empty', () => {
      mockRouterState.history = [];
      const { result } = renderHook(() => useURLState());

      expect(result.current.canGoBack).toBe(false);
    });
  });

  describe('Window State URL Management', () => {
    it('should extract window state from URL search params', () => {
      mockRouterState.location.search = {
        windowId: 'test-123',
        x: 100,
        y: 200,
        w: 800,
        h: 600,
        maximized: true,
        minimized: false,
      };

      const { result } = renderHook(() => useURLState());
      const windowState = result.current.getWindowStateFromURL();

      expect(windowState).toEqual({
        windowId: 'test-123',
        bounds: { x: 100, y: 200, w: 800, h: 600 },
        maximized: true,
        minimized: false,
      });
    });

    it('should update window state in URL for app routes', () => {
      mockRouterState.location.pathname = '/apps/projects';
      const { result } = renderHook(() => useURLState());

      act(() => {
        result.current.updateWindowStateInURL({
          windowId: 'new-123',
          bounds: { x: 50, y: 100, w: 900, h: 700 },
          maximized: true,
        });
      });

      expect(urlStateService.navigateToApp).toHaveBeenCalledWith('projects', {
        windowId: 'new-123',
        bounds: { x: 50, y: 100, w: 900, h: 700 },
        maximized: true,
        minimized: undefined,
      });
    });

    it('should update window state in URL for project routes', () => {
      mockRouterState.location.pathname = '/projects/my-project';
      const { result } = renderHook(() => useURLState());

      act(() => {
        result.current.updateWindowStateInURL({
          windowId: 'project-123',
          bounds: { x: 200, y: 300 },
        });
      });

      expect(urlStateService.navigateToProject).toHaveBeenCalledWith('my-project', {
        windowId: 'project-123',
        bounds: { x: 200, y: 300 },
      });
    });

    it('should update window state in URL for file routes', () => {
      mockRouterState.location.pathname = '/files';
      mockRouterState.location.search = { path: '/Documents/test.txt' };
      const { result } = renderHook(() => useURLState());

      act(() => {
        result.current.updateWindowStateInURL({
          windowId: 'file-123',
          bounds: { w: 1000, h: 800 },
        });
      });

      expect(urlStateService.navigateToFile).toHaveBeenCalledWith('/Documents/test.txt', {
        windowId: 'file-123',
        bounds: { w: 1000, h: 800 },
      });
    });
  });
});

describe('useURLSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterState.location.search = {};
  });

  it('should provide window state extraction and update functions', () => {
    const { result } = renderHook(() => useURLSync());

    expect(typeof result.current.getWindowStateFromURL).toBe('function');
    expect(typeof result.current.updateWindowStateInURL).toBe('function');
  });

  it('should extract window state from URL', () => {
    mockRouterState.location.search = {
      windowId: 'sync-123',
      x: 150,
      y: 250,
    };

    const { result } = renderHook(() => useURLSync());
    const windowState = result.current.getWindowStateFromURL();

    expect(windowState.windowId).toBe('sync-123');
    expect(windowState.bounds.x).toBe(150);
    expect(windowState.bounds.y).toBe(250);
  });
});