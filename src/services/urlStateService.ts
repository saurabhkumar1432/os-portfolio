import { router } from '../router';
import { useWindowStore } from '../store/windowStore';
import type { WindowState, AppId } from '../types';

/**
 * Service for synchronizing window manager state with URL state
 */
export class URLStateService {
  private static instance: URLStateService;
  private unsubscribeWindowStore?: () => void;
  private isUpdatingFromURL = false;
  private isUpdatingFromStore = false;
  private isRouterSetup = false;

  private constructor() {
    this.setupWindowStoreSubscription();
    // Don't setup router subscription immediately to avoid initialization issues
    // It will be setup on first use
  }

  static getInstance(): URLStateService {
    if (!URLStateService.instance) {
      URLStateService.instance = new URLStateService();
    }
    return URLStateService.instance;
  }

  /**
   * Setup router subscription (called lazily on first use)
   */
  private ensureRouterSetup() {
    if (!this.isRouterSetup) {
      this.setupRouterSubscription();
      this.isRouterSetup = true;
    }
  }

  /**
   * Subscribe to window store changes and update URL accordingly
   */
  private setupWindowStoreSubscription() {
    // Check if we're in a test environment and useWindowStore.subscribe exists
    if (typeof useWindowStore?.subscribe !== 'function') {
      console.warn('Window store subscription not available - likely in test environment');
      return;
    }

    this.unsubscribeWindowStore = useWindowStore.subscribe(
      (state) => ({
        windows: state.windows,
        zOrder: state.zOrder,
      }),
      (current, _previous) => {
        if (this.isUpdatingFromURL) return;
        
        this.isUpdatingFromStore = true;
        this.syncURLFromWindowState(current.windows, current.zOrder);
        this.isUpdatingFromStore = false;
      },
      {
        equalityFn: (a, b) => {
          // Deep comparison for windows and zOrder
          return (
            JSON.stringify(a.windows) === JSON.stringify(b.windows) &&
            JSON.stringify(a.zOrder) === JSON.stringify(b.zOrder)
          );
        },
      }
    );
  }

  /**
   * Subscribe to router changes and update window state accordingly
   */
  private setupRouterSubscription() {
    // Check if router is available (avoid initialization order issues)
    if (!router) {
      console.warn('Router not available during URLStateService initialization');
      return;
    }
    
    // Listen to route changes
    router.subscribe('onLoad', ({ toLocation }) => {
      if (this.isUpdatingFromStore) return;
      
      this.isUpdatingFromURL = true;
      this.syncWindowStateFromURL(toLocation);
      this.isUpdatingFromURL = false;
    });
  }

  /**
   * Update URL based on current window state
   */
  private syncURLFromWindowState(windows: Record<string, WindowState>, _zOrder: string[]) {
    const focusedWindow = Object.values(windows).find(w => w.focused);
    
    if (!focusedWindow) {
      // No focused window, navigate to desktop
      router.navigate({ to: '/' });
      return;
    }

    const windowParams = this.windowStateToURLParams(focusedWindow);

    // Navigate based on app type
    switch (focusedWindow.appId) {
      case 'projects':
        // Check if we have a selected project in the window state
        const projectSlug = this.getProjectSlugFromWindow(focusedWindow);
        if (projectSlug) {
          router.navigate({
            to: '/projects/$slug',
            params: { slug: projectSlug },
            search: windowParams,
          });
        } else {
          router.navigate({
            to: '/apps/$appId',
            params: { appId: 'projects' },
            search: windowParams,
          });
        }
        break;

      case 'file-explorer':
        const filePath = this.getFilePathFromWindow(focusedWindow);
        router.navigate({
          to: '/files',
          search: {
            ...windowParams,
            path: filePath || undefined,
          },
        });
        break;

      default:
        router.navigate({
          to: '/apps/$appId',
          params: { appId: focusedWindow.appId },
          search: windowParams,
        });
        break;
    }
  }

  /**
   * Update window state based on current URL
   */
  private syncWindowStateFromURL(location: any) {
    const { pathname, search } = location;

    // Parse route and create/focus appropriate window
    if (pathname === '/') {
      // Desktop route - no specific window to focus
      return;
    }

    if (pathname.startsWith('/apps/')) {
      const appId = this.extractAppIdFromPath(pathname);
      if (appId) {
        this.ensureAppWindowExists(appId, search);
      }
    } else if (pathname.startsWith('/projects/')) {
      const slug = this.extractProjectSlugFromPath(pathname);
      if (slug) {
        this.ensureProjectWindowExists(slug, search);
      }
    } else if (pathname.startsWith('/files')) {
      this.ensureFileExplorerWindowExists(search);
    }
  }

  /**
   * Convert window state to URL search parameters
   */
  private windowStateToURLParams(window: WindowState) {
    return {
      windowId: window.id,
      x: window.bounds.x,
      y: window.bounds.y,
      w: window.bounds.w,
      h: window.bounds.h,
      maximized: window.maximized,
      minimized: window.minimized,
    };
  }

  /**
   * Ensure an app window exists and is focused
   */
  private ensureAppWindowExists(appId: AppId, searchParams: any) {
    const windowStore = useWindowStore.getState();
    
    // Check if window with specific ID exists
    if (searchParams.windowId && windowStore.windows[searchParams.windowId]) {
      const window = windowStore.windows[searchParams.windowId];
      
      // Update window bounds if provided
      if (searchParams.x !== undefined || searchParams.y !== undefined ||
          searchParams.w !== undefined || searchParams.h !== undefined) {
        windowStore.updateWindowBounds(searchParams.windowId, {
          x: searchParams.x ?? window.bounds.x,
          y: searchParams.y ?? window.bounds.y,
          w: searchParams.w ?? window.bounds.w,
          h: searchParams.h ?? window.bounds.h,
        });
      }

      // Update window state
      if (searchParams.maximized !== undefined && searchParams.maximized !== window.maximized) {
        windowStore.maximizeWindow(searchParams.windowId);
      }
      
      if (searchParams.minimized !== undefined && searchParams.minimized !== window.minimized) {
        if (searchParams.minimized) {
          windowStore.minimizeWindow(searchParams.windowId);
        } else {
          windowStore.restoreWindow(searchParams.windowId);
        }
      }

      // Focus the window
      windowStore.focusWindow(searchParams.windowId);
      return;
    }

    // Find existing window for this app
    const existingWindows = windowStore.getWindowsByApp(appId);
    if (existingWindows.length > 0) {
      windowStore.focusWindow(existingWindows[0].id);
      return;
    }

    // Create new window
    const bounds = {
      x: searchParams.x ?? 100,
      y: searchParams.y ?? 100,
      w: searchParams.w ?? 800,
      h: searchParams.h ?? 600,
    };

    const windowId = windowStore.createWindow(appId, {
      bounds,
      maximized: searchParams.maximized ?? false,
      minimized: searchParams.minimized ?? false,
    });

    // Focus the new window
    windowStore.focusWindow(windowId);
  }

  /**
   * Ensure a project window exists and shows the specific project
   */
  private ensureProjectWindowExists(slug: string, searchParams: any) {
    // First ensure projects app is open
    this.ensureAppWindowExists('projects', searchParams);
    
    // TODO: Notify projects app to show specific project
    // This will be implemented when we add project-specific state management
    this.notifyProjectSelection(slug);
  }

  /**
   * Ensure file explorer window exists and shows the specific path
   */
  private ensureFileExplorerWindowExists(searchParams: any) {
    // First ensure file explorer is open
    this.ensureAppWindowExists('file-explorer', searchParams);
    
    // TODO: Notify file explorer to navigate to specific path
    // This will be implemented when we add file explorer state management
    if (searchParams.path) {
      this.notifyFileExplorerNavigation(searchParams.path);
    }
  }

  /**
   * Extract app ID from URL path
   */
  private extractAppIdFromPath(pathname: string): AppId | null {
    const match = pathname.match(/^\/apps\/(.+)$/);
    return match ? match[1] as AppId : null;
  }

  /**
   * Extract project slug from URL path
   */
  private extractProjectSlugFromPath(pathname: string): string | null {
    const match = pathname.match(/^\/projects\/(.+)$/);
    return match ? match[1] : null;
  }

  /**
   * Get project slug from window state (placeholder)
   */
  private getProjectSlugFromWindow(_window: WindowState): string | null {
    // TODO: Implement project state tracking in window
    // For now, return null to use app route
    return null;
  }

  /**
   * Get file path from window state (placeholder)
   */
  private getFilePathFromWindow(_window: WindowState): string | null {
    // TODO: Implement file explorer state tracking in window
    // For now, return null to use default path
    return null;
  }

  /**
   * Notify projects app of selected project (placeholder)
   */
  private notifyProjectSelection(slug: string) {
    // TODO: Implement project selection notification
    // This could use a custom event or state management
    window.dispatchEvent(new CustomEvent('project-select', { detail: { slug } }));
  }

  /**
   * Notify file explorer of navigation (placeholder)
   */
  private notifyFileExplorerNavigation(path: string) {
    // TODO: Implement file explorer navigation notification
    // This could use a custom event or state management
    window.dispatchEvent(new CustomEvent('file-explorer-navigate', { detail: { path } }));
  }

  /**
   * Navigate to a specific app
   */
  public navigateToApp(appId: AppId, options?: {
    windowId?: string;
    bounds?: { x: number; y: number; w: number; h: number };
    maximized?: boolean;
    minimized?: boolean;
  }) {
    this.ensureRouterSetup();
    
    const searchParams: any = {};
    
    if (options?.windowId) searchParams.windowId = options.windowId;
    if (options?.bounds) {
      searchParams.x = options.bounds.x;
      searchParams.y = options.bounds.y;
      searchParams.w = options.bounds.w;
      searchParams.h = options.bounds.h;
    }
    if (options?.maximized !== undefined) searchParams.maximized = options.maximized;
    if (options?.minimized !== undefined) searchParams.minimized = options.minimized;

    router.navigate({
      to: '/apps/$appId',
      params: { appId },
      search: searchParams,
    });
  }

  /**
   * Navigate to a specific project
   */
  public navigateToProject(slug: string, options?: {
    windowId?: string;
    bounds?: { x: number; y: number; w: number; h: number };
  }) {
    this.ensureRouterSetup();
    
    const searchParams: any = {};
    
    if (options?.windowId) searchParams.windowId = options.windowId;
    if (options?.bounds) {
      searchParams.x = options.bounds.x;
      searchParams.y = options.bounds.y;
      searchParams.w = options.bounds.w;
      searchParams.h = options.bounds.h;
    }

    router.navigate({
      to: '/projects/$slug',
      params: { slug },
      search: searchParams,
    });
  }

  /**
   * Navigate to file explorer with specific path
   */
  public navigateToFile(path?: string, options?: {
    windowId?: string;
    bounds?: { x: number; y: number; w: number; h: number };
  }) {
    this.ensureRouterSetup();
    
    const searchParams: any = {};
    
    if (path) searchParams.path = path;
    if (options?.windowId) searchParams.windowId = options.windowId;
    if (options?.bounds) {
      searchParams.x = options.bounds.x;
      searchParams.y = options.bounds.y;
      searchParams.w = options.bounds.w;
      searchParams.h = options.bounds.h;
    }

    router.navigate({
      to: '/files',
      search: searchParams,
    });
  }

  /**
   * Navigate to desktop (clear all URL state)
   */
  public navigateToDesktop() {
    this.ensureRouterSetup();
    router.navigate({ to: '/' });
  }

  /**
   * Clean up subscriptions
   */
  public destroy() {
    if (this.unsubscribeWindowStore) {
      this.unsubscribeWindowStore();
    }
  }
}

// Export function to get singleton instance (lazy initialization)
export const getURLStateService = () => URLStateService.getInstance();

// Export for compatibility - but as a getter function to avoid immediate initialization
export const urlStateService = {
  get instance() {
    return URLStateService.getInstance();
  }
};