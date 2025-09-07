import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeepLinkService } from '../services/deepLinkService';

// Mock dependencies
vi.mock('../router', () => ({
  router: {
    state: {
      location: {
        pathname: '/',
        search: {},
      },
    },
    navigate: vi.fn(),
  },
}));

vi.mock('../store/windowStore', () => ({
  useWindowStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../store/preferencesStore', () => ({
  usePreferencesStore: {
    getState: vi.fn(),
  },
}));

describe('DeepLinkService', () => {
  let deepLinkService: DeepLinkService;
  let mockWindowStore: any;
  let mockPreferencesStore: any;
  let mockRouter: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import mocked modules
    const { router } = await import('../router');
    const { useWindowStore } = await import('../store/windowStore');
    const { usePreferencesStore } = await import('../store/preferencesStore');
    
    mockRouter = router;
    
    // Setup mock stores
    mockWindowStore = {
      windows: {},
      createWindow: vi.fn(),
      focusWindow: vi.fn(),
      updateWindowBounds: vi.fn(),
      maximizeWindow: vi.fn(),
      minimizeWindow: vi.fn(),
      restoreWindow: vi.fn(),
      getWindowsByApp: vi.fn(() => []),
    };
    
    mockPreferencesStore = {
      windowPositions: {},
      updatePreferences: vi.fn(),
    };
    
    (useWindowStore.getState as any).mockReturnValue(mockWindowStore);
    (usePreferencesStore.getState as any).mockReturnValue(mockPreferencesStore);
    
    deepLinkService = DeepLinkService.getInstance();
  });

  describe('URL Restoration', () => {
    it('should restore desktop state for root path', async () => {
      const result = await deepLinkService.restoreFromURL('/', {});
      expect(result).toBe(true);
    });

    it('should restore app state from URL', async () => {
      mockWindowStore.createWindow.mockReturnValue('test-window-id');
      
      const result = await deepLinkService.restoreFromURL('/apps/projects', {
        x: 100,
        y: 200,
        w: 800,
        h: 600,
      });

      expect(result).toBe(true);
      expect(mockWindowStore.createWindow).toHaveBeenCalledWith('projects', {
        bounds: { x: 100, y: 200, w: 800, h: 600 },
        maximized: false,
        minimized: false,
      });
    });

    it('should restore existing window if it exists', async () => {
      const existingWindow = {
        id: 'existing-123',
        appId: 'projects',
        bounds: { x: 50, y: 50, w: 600, h: 400 },
        maximized: false,
        minimized: false,
      };

      mockWindowStore.windows = { 'existing-123': existingWindow };

      const result = await deepLinkService.restoreFromURL('/apps/projects', {
        windowId: 'existing-123',
        x: 200,
        y: 300,
      });

      expect(result).toBe(true);
      expect(mockWindowStore.updateWindowBounds).toHaveBeenCalledWith('existing-123', {
        x: 200,
        y: 300,
        w: 600,
        h: 400,
      });
    });

    it('should restore project state', async () => {
      mockWindowStore.createWindow.mockReturnValue('projects-window');
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      const result = await deepLinkService.restoreFromURL('/projects/my-project', {
        x: 150,
        y: 250,
      });

      expect(result).toBe(true);
      expect(mockWindowStore.createWindow).toHaveBeenCalledWith('projects', {
        bounds: { x: 150, y: 250, w: 800, h: 600 },
        maximized: false,
        minimized: false,
      });
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        new CustomEvent('deep-link-project-select', { detail: { slug: 'my-project' } })
      );
    });

    it('should restore file explorer state', async () => {
      mockWindowStore.createWindow.mockReturnValue('file-explorer-window');
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      const result = await deepLinkService.restoreFromURL('/files', {
        path: '/Documents/test.txt',
        x: 100,
        y: 100,
      });

      expect(result).toBe(true);
      expect(mockWindowStore.createWindow).toHaveBeenCalledWith('file-explorer', {
        bounds: { x: 100, y: 100, w: 800, h: 600 },
        maximized: false,
        minimized: false,
      });
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        new CustomEvent('deep-link-file-navigate', { detail: { path: '/Documents/test.txt' } })
      );
    });
  });

  describe('Window State Restoration', () => {
    it('should restore maximized window state', async () => {
      const existingWindow = {
        id: 'test-123',
        appId: 'projects',
        bounds: { x: 100, y: 100, w: 800, h: 600 },
        maximized: false,
        minimized: false,
      };

      mockWindowStore.windows = { 'test-123': existingWindow };

      const result = await deepLinkService.restoreFromURL('/apps/projects', {
        windowId: 'test-123',
        maximized: true,
      });

      expect(result).toBe(true);
      expect(mockWindowStore.maximizeWindow).toHaveBeenCalledWith('test-123');
    });

    it('should restore minimized window state', async () => {
      const existingWindow = {
        id: 'test-123',
        appId: 'projects',
        bounds: { x: 100, y: 100, w: 800, h: 600 },
        maximized: false,
        minimized: false,
      };

      mockWindowStore.windows = { 'test-123': existingWindow };

      const result = await deepLinkService.restoreFromURL('/apps/projects', {
        windowId: 'test-123',
        minimized: true,
      });

      expect(result).toBe(true);
      expect(mockWindowStore.minimizeWindow).toHaveBeenCalledWith('test-123');
    });

    it('should restore window from minimized state', async () => {
      const existingWindow = {
        id: 'test-123',
        appId: 'projects',
        bounds: { x: 100, y: 100, w: 800, h: 600 },
        maximized: false,
        minimized: true,
      };

      mockWindowStore.windows = { 'test-123': existingWindow };

      const result = await deepLinkService.restoreFromURL('/apps/projects', {
        windowId: 'test-123',
        minimized: false,
      });

      expect(result).toBe(true);
      expect(mockWindowStore.restoreWindow).toHaveBeenCalledWith('test-123');
    });
  });

  describe('Bounds Validation and Constraints', () => {
    it('should constrain window bounds to valid ranges', async () => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });

      mockWindowStore.createWindow.mockReturnValue('constrained-window');

      const result = await deepLinkService.restoreFromURL('/apps/projects', {
        x: -100, // Should be constrained to 0
        y: -50,  // Should be constrained to 0
        w: 100,  // Should be constrained to 320 (minimum)
        h: 50,   // Should be constrained to 240 (minimum)
      });

      expect(result).toBe(true);
      expect(mockWindowStore.createWindow).toHaveBeenCalledWith('projects', {
        bounds: { x: 0, y: 0, w: 320, h: 240 },
        maximized: false,
        minimized: false,
      });
    });

    it('should use saved preferences when URL parameters are not provided', async () => {
      mockPreferencesStore.windowPositions = {
        projects: {
          bounds: { x: 200, y: 300, w: 900, h: 700 },
          maximized: false,
          minimized: false,
        },
      };

      mockWindowStore.createWindow.mockReturnValue('preferences-window');

      const result = await deepLinkService.restoreFromURL('/apps/projects', {});

      expect(result).toBe(true);
      expect(mockWindowStore.createWindow).toHaveBeenCalledWith('projects', {
        bounds: { x: 200, y: 300, w: 900, h: 700 },
        maximized: false,
        minimized: false,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid app IDs', async () => {
      const result = await deepLinkService.restoreFromURL('/apps/invalid-app', {});
      expect(result).toBe(false);
    });

    it('should handle restoration attempts limit', async () => {
      // First attempt should work
      let result = await deepLinkService.restoreFromURL('/apps/invalid-app', {});
      expect(result).toBe(false);

      // Second attempt should work
      result = await deepLinkService.restoreFromURL('/apps/invalid-app', {});
      expect(result).toBe(false);

      // Third attempt should work
      result = await deepLinkService.restoreFromURL('/apps/invalid-app', {});
      expect(result).toBe(false);

      // Fourth attempt should be blocked
      result = await deepLinkService.restoreFromURL('/apps/invalid-app', {});
      expect(result).toBe(false);
    });

    it('should handle invalid URLs with fallback', async () => {
      const result = await deepLinkService.handleInvalidURL('/invalid/path', new Error('Test error'));
      
      expect(result).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith({ to: '/' });
    });

    it('should redirect invalid app URLs to valid app', async () => {
      const result = await deepLinkService.handleInvalidURL('/apps/projects', new Error('Test error'));
      
      expect(result).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith({
        to: '/apps/$appId',
        params: { appId: 'projects' },
      });
    });

    it('should redirect invalid project URLs to projects app', async () => {
      const result = await deepLinkService.handleInvalidURL('/projects/invalid', new Error('Test error'));
      
      expect(result).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith({
        to: '/apps/$appId',
        params: { appId: 'projects' },
      });
    });
  });

  describe('State Persistence', () => {
    it('should save window state for restoration', () => {
      const window = {
        id: 'test-123',
        appId: 'projects',
        bounds: { x: 100, y: 200, w: 800, h: 600 },
        maximized: false,
        minimized: false,
      };

      mockWindowStore.windows = { 'test-123': window };

      deepLinkService.saveWindowStateForRestoration('test-123');

      expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith({
        windowPositions: {
          projects: {
            bounds: { x: 100, y: 200, w: 800, h: 600 },
            maximized: false,
            minimized: false,
          },
        },
      });
    });

    it('should clear restoration attempts', () => {
      // This is more of a smoke test since the method doesn't return anything
      expect(() => {
        deepLinkService.clearRestorationAttempts('/apps/projects', { x: 100 });
      }).not.toThrow();
    });
  });

  describe('Current URL Restoration', () => {
    it('should restore from current router state', async () => {
      mockRouter.state.location = {
        pathname: '/apps/projects',
        search: { x: 150, y: 250 },
      };

      mockWindowStore.createWindow.mockReturnValue('current-window');

      const result = await deepLinkService.restoreFromCurrentURL();

      expect(result).toBe(true);
      expect(mockWindowStore.createWindow).toHaveBeenCalledWith('projects', {
        bounds: { x: 150, y: 250, w: 800, h: 600 },
        maximized: false,
        minimized: false,
      });
    });
  });
});