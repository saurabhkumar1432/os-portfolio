import { router } from '../router';
import { useWindowStore } from '../store/windowStore';
import { usePreferencesStore } from '../store/preferencesStore';
import type { AppId } from '../types';

/**
 * Service for handling deep link restoration and application state recovery
 */
export class DeepLinkService {
  private static instance: DeepLinkService;
  private restorationAttempts = new Map<string, number>();
  private maxRestorationAttempts = 3;

  private constructor() {}

  static getInstance(): DeepLinkService {
    if (!DeepLinkService.instance) {
      DeepLinkService.instance = new DeepLinkService();
    }
    return DeepLinkService.instance;
  }

  /**
   * Restore application state from the current URL
   */
  async restoreFromCurrentURL(): Promise<boolean> {
    try {
      const currentLocation = router.state.location;
      return await this.restoreFromURL(currentLocation.pathname, currentLocation.search);
    } catch (error) {
      console.error('Failed to restore from current URL:', error);
      return false;
    }
  }

  /**
   * Restore application state from a specific URL
   */
  async restoreFromURL(pathname: string, searchParams: any): Promise<boolean> {
    const restorationKey = `${pathname}?${JSON.stringify(searchParams)}`;
    
    // Check if we've already tried to restore this URL too many times
    const attempts = this.restorationAttempts.get(restorationKey) || 0;
    if (attempts >= this.maxRestorationAttempts) {
      console.warn(`Max restoration attempts reached for ${pathname}`);
      return false;
    }

    this.restorationAttempts.set(restorationKey, attempts + 1);

    try {
      if (pathname === '/') {
        return await this.restoreDesktopState();
      } else if (pathname.startsWith('/apps/')) {
        const appId = this.extractAppIdFromPath(pathname);
        return appId ? await this.restoreAppState(appId, searchParams) : false;
      } else if (pathname.startsWith('/projects/')) {
        const slug = this.extractProjectSlugFromPath(pathname);
        return slug ? await this.restoreProjectState(slug, searchParams) : false;
      } else if (pathname.startsWith('/files')) {
        return await this.restoreFileExplorerState(searchParams);
      }

      return false;
    } catch (error) {
      console.error(`Failed to restore state for ${pathname}:`, error);
      return false;
    }
  }

  /**
   * Restore desktop state (no specific windows)
   */
  private async restoreDesktopState(): Promise<boolean> {
    // For desktop state, we might want to restore saved window positions
    // but not open any specific applications
    const preferencesStore = usePreferencesStore.getState();
    
    // Restore any saved window positions for future use
    if (preferencesStore.windowPositions) {
      // Window positions are restored when windows are created
      // This is handled by the window store
    }

    return true;
  }

  /**
   * Restore application state from URL parameters
   */
  private async restoreAppState(appId: AppId, searchParams: any): Promise<boolean> {
    const windowStore = useWindowStore.getState();
    
    try {
      // Check if a window with the specified ID already exists
      if (searchParams.windowId && windowStore.windows[searchParams.windowId]) {
        return await this.restoreExistingWindow(searchParams.windowId, searchParams);
      }

      // Check if there's already a window for this app
      const existingWindows = windowStore.getWindowsByApp(appId);
      if (existingWindows.length > 0) {
        return await this.restoreExistingWindow(existingWindows[0].id, searchParams);
      }

      // Create new window with restored state
      return await this.createWindowWithRestoredState(appId, searchParams);
    } catch (error) {
      console.error(`Failed to restore app state for ${appId}:`, error);
      return false;
    }
  }

  /**
   * Restore project-specific state
   */
  private async restoreProjectState(slug: string, searchParams: any): Promise<boolean> {
    try {
      // First ensure the projects app is restored
      const appRestored = await this.restoreAppState('projects', searchParams);
      
      if (appRestored) {
        // Notify the projects app to show the specific project
        await this.notifyProjectSelection(slug);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Failed to restore project state for ${slug}:`, error);
      return false;
    }
  }

  /**
   * Restore file explorer state with specific path
   */
  private async restoreFileExplorerState(searchParams: any): Promise<boolean> {
    try {
      // First ensure the file explorer app is restored
      const appRestored = await this.restoreAppState('file-explorer', searchParams);
      
      if (appRestored && searchParams.path) {
        // Notify the file explorer to navigate to the specific path
        await this.notifyFileExplorerNavigation(searchParams.path);
        return true;
      }

      return appRestored;
    } catch (error) {
      console.error('Failed to restore file explorer state:', error);
      return false;
    }
  }

  /**
   * Restore an existing window's state
   */
  private async restoreExistingWindow(windowId: string, searchParams: any): Promise<boolean> {
    const windowStore = useWindowStore.getState();
    const window = windowStore.windows[windowId];
    
    if (!window) {
      return false;
    }

    try {
      // Restore window bounds if provided
      if (this.hasValidBounds(searchParams)) {
        windowStore.updateWindowBounds(windowId, {
          x: searchParams.x ?? window.bounds.x,
          y: searchParams.y ?? window.bounds.y,
          w: searchParams.w ?? window.bounds.w,
          h: searchParams.h ?? window.bounds.h,
        });
      }

      // Restore window state
      if (searchParams.maximized !== undefined && searchParams.maximized !== window.maximized) {
        windowStore.maximizeWindow(windowId);
      }

      if (searchParams.minimized !== undefined) {
        if (searchParams.minimized && !window.minimized) {
          windowStore.minimizeWindow(windowId);
        } else if (!searchParams.minimized && window.minimized) {
          windowStore.restoreWindow(windowId);
        }
      }

      // Focus the window if not minimized
      if (!searchParams.minimized) {
        windowStore.focusWindow(windowId);
      }

      return true;
    } catch (error) {
      console.error(`Failed to restore existing window ${windowId}:`, error);
      return false;
    }
  }

  /**
   * Create a new window with restored state
   */
  private async createWindowWithRestoredState(appId: AppId, searchParams: any): Promise<boolean> {
    const windowStore = useWindowStore.getState();
    const preferencesStore = usePreferencesStore.getState();

    try {
      // Determine window bounds
      let bounds = { x: 100, y: 100, w: 800, h: 600 };

      // Use URL parameters if provided
      if (this.hasValidBounds(searchParams)) {
        bounds = {
          x: searchParams.x ?? bounds.x,
          y: searchParams.y ?? bounds.y,
          w: searchParams.w ?? bounds.w,
          h: searchParams.h ?? bounds.h,
        };
      } else {
        // Try to restore from saved preferences
        const savedPosition = preferencesStore.windowPositions?.[appId];
        if (savedPosition) {
          bounds = { ...bounds, ...savedPosition.bounds };
        }
      }

      // Validate and constrain bounds
      bounds = this.constrainWindowBounds(bounds);

      // Create the window
      const windowId = windowStore.createWindow(appId, {
        bounds,
        maximized: searchParams.maximized ?? false,
        minimized: searchParams.minimized ?? false,
      });

      // Focus the window if not minimized
      if (!searchParams.minimized) {
        windowStore.focusWindow(windowId);
      }

      return true;
    } catch (error) {
      console.error(`Failed to create window with restored state for ${appId}:`, error);
      return false;
    }
  }

  /**
   * Handle invalid or outdated URLs with fallback behavior
   */
  async handleInvalidURL(pathname: string, error: Error): Promise<boolean> {
    console.warn(`Invalid URL detected: ${pathname}`, error);

    try {
      // Try to extract app ID and provide fallback
      if (pathname.startsWith('/apps/')) {
        const appId = this.extractAppIdFromPath(pathname);
        if (appId && this.isValidAppId(appId)) {
          // Redirect to app without invalid parameters
          router.navigate({ 
            to: '/apps/$appId', 
            params: { appId }, 
            search: {
              windowId: undefined,
              x: undefined,
              y: undefined,
              w: undefined,
              h: undefined,
              maximized: false,
              minimized: false,
            }
          });
          return true;
        }
      }

      if (pathname.startsWith('/projects/')) {
        // Redirect to projects app
        router.navigate({ 
          to: '/apps/$appId', 
          params: { appId: 'projects' }, 
          search: {
            windowId: undefined,
            x: undefined,
            y: undefined,
            w: undefined,
            h: undefined,
            maximized: false,
            minimized: false,
          }
        });
        return true;
      }

      if (pathname.startsWith('/files')) {
        // Redirect to file explorer
        router.navigate({ 
          to: '/apps/$appId', 
          params: { appId: 'file-explorer' }, 
          search: {
            windowId: undefined,
            x: undefined,
            y: undefined,
            w: undefined,
            h: undefined,
            maximized: false,
            minimized: false,
          }
        });
        return true;
      }

      // Fallback to desktop
      router.navigate({ to: '/' });
      return true;
    } catch (fallbackError) {
      console.error('Failed to handle invalid URL:', fallbackError);
      return false;
    }
  }

  /**
   * Save current window state for future restoration
   */
  saveWindowStateForRestoration(windowId: string): void {
    const windowStore = useWindowStore.getState();
    const preferencesStore = usePreferencesStore.getState();
    const window = windowStore.windows[windowId];

    if (!window) return;

    try {
      // Save window position and state to preferences
      const windowPositions = { ...preferencesStore.windowPositions };
      windowPositions[window.appId] = {
        bounds: window.bounds,
        maximized: window.maximized,
        minimized: window.minimized,
      };

      preferencesStore.updatePreferences({ windowPositions });
    } catch (error) {
      console.error(`Failed to save window state for ${windowId}:`, error);
    }
  }

  /**
   * Clear restoration attempts for a URL (useful after successful restoration)
   */
  clearRestorationAttempts(pathname: string, searchParams?: any): void {
    const restorationKey = searchParams 
      ? `${pathname}?${JSON.stringify(searchParams)}`
      : pathname;
    this.restorationAttempts.delete(restorationKey);
  }

  // Utility methods

  private extractAppIdFromPath(pathname: string): AppId | null {
    const match = pathname.match(/^\/apps\/(.+)$/);
    return match ? match[1] as AppId : null;
  }

  private extractProjectSlugFromPath(pathname: string): string | null {
    const match = pathname.match(/^\/projects\/(.+)$/);
    return match ? match[1] : null;
  }

  private isValidAppId(appId: string): boolean {
    const validAppIds: AppId[] = [
      'projects', 'file-explorer', 'terminal', 'about', 
      'notepad', 'settings', 'resume-viewer'
    ];
    return validAppIds.includes(appId as AppId);
  }

  private hasValidBounds(searchParams: any): boolean {
    return (
      typeof searchParams.x === 'number' ||
      typeof searchParams.y === 'number' ||
      typeof searchParams.w === 'number' ||
      typeof searchParams.h === 'number'
    );
  }

  private constrainWindowBounds(bounds: { x: number; y: number; w: number; h: number }) {
    const minWidth = 320;
    const minHeight = 240;
    const maxWidth = window.innerWidth || 1920;
    const maxHeight = window.innerHeight || 1080;

    return {
      x: Math.max(0, Math.min(bounds.x, maxWidth - minWidth)),
      y: Math.max(0, Math.min(bounds.y, maxHeight - minHeight)),
      w: Math.max(minWidth, Math.min(bounds.w, maxWidth)),
      h: Math.max(minHeight, Math.min(bounds.h, maxHeight)),
    };
  }

  private async notifyProjectSelection(slug: string): Promise<void> {
    // Use custom event to notify projects app
    window.dispatchEvent(new CustomEvent('deep-link-project-select', { 
      detail: { slug } 
    }));

    // Also try to use a more direct approach if available
    try {
      // This could be enhanced to use a more direct state management approach
      const event = new CustomEvent('project-deep-link', {
        detail: { action: 'select', slug }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.warn('Failed to dispatch project selection event:', error);
    }
  }

  private async notifyFileExplorerNavigation(path: string): Promise<void> {
    // Use custom event to notify file explorer
    window.dispatchEvent(new CustomEvent('deep-link-file-navigate', { 
      detail: { path } 
    }));

    // Also try to use a more direct approach if available
    try {
      const event = new CustomEvent('file-explorer-deep-link', {
        detail: { action: 'navigate', path }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.warn('Failed to dispatch file explorer navigation event:', error);
    }
  }
}

// Export singleton instance
export const deepLinkService = DeepLinkService.getInstance();