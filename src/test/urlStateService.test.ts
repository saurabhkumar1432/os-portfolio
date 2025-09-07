import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { URLStateService } from '../services/urlStateService';

// Mock the router
vi.mock('../router', () => ({
  router: {
    navigate: vi.fn(),
    subscribe: vi.fn(() => () => {}), // Return unsubscribe function
    history: {
      back: vi.fn(),
      forward: vi.fn(),
    },
  },
}));

// Mock window store
vi.mock('../store/windowStore', () => ({
  useWindowStore: {
    subscribe: vi.fn(() => () => {}), // Return unsubscribe function
    getState: vi.fn(),
  },
}));

describe('URLStateService', () => {
  let urlStateService: URLStateService;
  let mockWindowStore: any;
  let mockRouter: any;
  let mockUseWindowStore: any;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Import mocked modules
    const { router } = await import('../router');
    const { useWindowStore } = await import('../store/windowStore');
    
    mockRouter = router;
    mockUseWindowStore = useWindowStore;
    
    // Mock window store state
    mockWindowStore = {
      windows: {},
      zOrder: [],
      createWindow: vi.fn(),
      focusWindow: vi.fn(),
      updateWindowBounds: vi.fn(),
      maximizeWindow: vi.fn(),
      minimizeWindow: vi.fn(),
      restoreWindow: vi.fn(),
      getWindowsByApp: vi.fn(() => []),
    };
    
    (mockUseWindowStore.getState as any).mockReturnValue(mockWindowStore);
    (mockUseWindowStore.subscribe as any).mockImplementation((selector, callback) => {
      // Return unsubscribe function
      return () => {};
    });

    // Create fresh instance
    urlStateService = URLStateService.getInstance();
  });

  afterEach(() => {
    urlStateService.destroy();
  });

  describe('URL to Window State Synchronization', () => {
    it('should create window for app route', () => {
      const mockLocation = {
        pathname: '/apps/projects',
        search: {
          x: 100,
          y: 200,
          w: 800,
          h: 600,
        },
      };

      // Simulate route change
      const subscribeCallback = mockRouter.subscribe.mock.calls[0][1];
      subscribeCallback({ toLocation: mockLocation });

      expect(mockWindowStore.createWindow).toHaveBeenCalledWith('projects', {
        bounds: { x: 100, y: 200, w: 800, h: 600 },
        maximized: false,
        minimized: false,
      });
    });

    it('should focus existing window if it exists', () => {
      const existingWindow = {
        id: 'projects-123',
        appId: 'projects',
        bounds: { x: 50, y: 50, w: 600, h: 400 },
        maximized: false,
        minimized: false,
      };

      mockWindowStore.windows = { 'projects-123': existingWindow };
      mockWindowStore.getWindowsByApp.mockReturnValue([existingWindow]);

      const mockLocation = {
        pathname: '/apps/projects',
        search: {},
      };

      // Simulate route change
      const subscribeCallback = mockRouter.subscribe.mock.calls[0][1];
      subscribeCallback({ toLocation: mockLocation });

      expect(mockWindowStore.focusWindow).toHaveBeenCalledWith('projects-123');
      expect(mockWindowStore.createWindow).not.toHaveBeenCalled();
    });

    it('should update window bounds from URL parameters', () => {
      const existingWindow = {
        id: 'projects-123',
        appId: 'projects',
        bounds: { x: 50, y: 50, w: 600, h: 400 },
        maximized: false,
        minimized: false,
      };

      mockWindowStore.windows = { 'projects-123': existingWindow };

      const mockLocation = {
        pathname: '/apps/projects',
        search: {
          windowId: 'projects-123',
          x: 200,
          y: 300,
          w: 900,
          h: 700,
        },
      };

      // Simulate route change
      const subscribeCallback = mockRouter.subscribe.mock.calls[0][1];
      subscribeCallback({ toLocation: mockLocation });

      expect(mockWindowStore.updateWindowBounds).toHaveBeenCalledWith('projects-123', {
        x: 200,
        y: 300,
        w: 900,
        h: 700,
      });
    });

    it('should handle project routes', () => {
      const mockLocation = {
        pathname: '/projects/my-project',
        search: {
          x: 150,
          y: 250,
        },
      };

      // Simulate route change
      const subscribeCallback = mockRouter.subscribe.mock.calls[0][1];
      subscribeCallback({ toLocation: mockLocation });

      expect(mockWindowStore.createWindow).toHaveBeenCalledWith('projects', {
        bounds: { x: 150, y: 250, w: 800, h: 600 },
        maximized: false,
        minimized: false,
      });
    });

    it('should handle file explorer routes', () => {
      const mockLocation = {
        pathname: '/files',
        search: {
          path: '/Documents/test.txt',
          x: 100,
          y: 100,
        },
      };

      // Simulate route change
      const subscribeCallback = mockRouter.subscribe.mock.calls[0][1];
      subscribeCallback({ toLocation: mockLocation });

      expect(mockWindowStore.createWindow).toHaveBeenCalledWith('file-explorer', {
        bounds: { x: 100, y: 100, w: 800, h: 600 },
        maximized: false,
        minimized: false,
      });
    });
  });

  describe('Window State to URL Synchronization', () => {
    it('should navigate to desktop when no focused window', () => {
      mockWindowStore.windows = {};
      mockWindowStore.zOrder = [];

      // Simulate window store change
      const subscribeCallback = mockUseWindowStore.subscribe.mock.calls[0][1];
      subscribeCallback(
        { windows: {}, zOrder: [] },
        { windows: {}, zOrder: [] }
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith({ to: '/' });
    });

    it('should navigate to app route for focused window', () => {
      const focusedWindow = {
        id: 'projects-123',
        appId: 'projects',
        title: 'Projects',
        bounds: { x: 100, y: 200, w: 800, h: 600 },
        zIndex: 1,
        minimized: false,
        maximized: false,
        focused: true,
      };

      mockWindowStore.windows = { 'projects-123': focusedWindow };
      mockWindowStore.zOrder = ['projects-123'];

      // Simulate window store change
      const subscribeCallback = mockUseWindowStore.subscribe.mock.calls[0][1];
      subscribeCallback(
        { windows: mockWindowStore.windows, zOrder: mockWindowStore.zOrder },
        { windows: {}, zOrder: [] }
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith({
        to: '/apps/$appId',
        params: { appId: 'projects' },
        search: {
          windowId: 'projects-123',
          x: 100,
          y: 200,
          w: 800,
          h: 600,
          maximized: false,
          minimized: false,
        },
      });
    });

    it('should handle maximized window state in URL', () => {
      const focusedWindow = {
        id: 'projects-123',
        appId: 'projects',
        title: 'Projects',
        bounds: { x: 100, y: 200, w: 800, h: 600 },
        zIndex: 1,
        minimized: false,
        maximized: true,
        focused: true,
      };

      mockWindowStore.windows = { 'projects-123': focusedWindow };
      mockWindowStore.zOrder = ['projects-123'];

      // Simulate window store change
      const subscribeCallback = mockUseWindowStore.subscribe.mock.calls[0][1];
      subscribeCallback(
        { windows: mockWindowStore.windows, zOrder: mockWindowStore.zOrder },
        { windows: {}, zOrder: [] }
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith({
        to: '/apps/$appId',
        params: { appId: 'projects' },
        search: {
          windowId: 'projects-123',
          x: 100,
          y: 200,
          w: 800,
          h: 600,
          maximized: true,
          minimized: false,
        },
      });
    });
  });

  describe('Navigation Methods', () => {
    it('should navigate to app with options', () => {
      urlStateService.navigateToApp('projects', {
        windowId: 'test-123',
        bounds: { x: 50, y: 100, w: 900, h: 700 },
        maximized: true,
      });

      expect(mockRouter.navigate).toHaveBeenCalledWith({
        to: '/apps/$appId',
        params: { appId: 'projects' },
        search: {
          windowId: 'test-123',
          x: 50,
          y: 100,
          w: 900,
          h: 700,
          maximized: true,
        },
      });
    });

    it('should navigate to project', () => {
      urlStateService.navigateToProject('my-project', {
        bounds: { x: 200, y: 300, w: 1000, h: 800 },
      });

      expect(mockRouter.navigate).toHaveBeenCalledWith({
        to: '/projects/$slug',
        params: { slug: 'my-project' },
        search: {
          x: 200,
          y: 300,
          w: 1000,
          h: 800,
        },
      });
    });

    it('should navigate to file explorer', () => {
      urlStateService.navigateToFile('/Documents/test.txt', {
        windowId: 'file-123',
      });

      expect(mockRouter.navigate).toHaveBeenCalledWith({
        to: '/files',
        search: {
          path: '/Documents/test.txt',
          windowId: 'file-123',
        },
      });
    });

    it('should navigate to desktop', () => {
      urlStateService.navigateToDesktop();

      expect(mockRouter.navigate).toHaveBeenCalledWith({ to: '/' });
    });
  });

  describe('URL Parameter Extraction', () => {
    it('should extract app ID from path', () => {
      const service = urlStateService as any;
      expect(service.extractAppIdFromPath('/apps/projects')).toBe('projects');
      expect(service.extractAppIdFromPath('/apps/file-explorer')).toBe('file-explorer');
      expect(service.extractAppIdFromPath('/invalid')).toBe(null);
    });

    it('should extract project slug from path', () => {
      const service = urlStateService as any;
      expect(service.extractProjectSlugFromPath('/projects/my-project')).toBe('my-project');
      expect(service.extractProjectSlugFromPath('/projects/another-project')).toBe('another-project');
      expect(service.extractProjectSlugFromPath('/invalid')).toBe(null);
    });
  });

  describe('Event Notifications', () => {
    it('should dispatch project selection event', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      const service = urlStateService as any;
      
      service.notifyProjectSelection('test-project');

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        new CustomEvent('project-select', { detail: { slug: 'test-project' } })
      );
    });

    it('should dispatch file explorer navigation event', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      const service = urlStateService as any;
      
      service.notifyFileExplorerNavigation('/Documents/test.txt');

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        new CustomEvent('file-explorer-navigate', { detail: { path: '/Documents/test.txt' } })
      );
    });
  });
});