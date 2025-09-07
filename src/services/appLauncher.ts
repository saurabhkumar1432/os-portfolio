import type { AppId, WindowState } from '../types';
import { appRegistry } from './appRegistry';
import { appLifecycleManager } from './appLifecycleManager';
import { useWindowStore } from '../store/windowStore';
import { preloadService } from './preloadService';

/**
 * App launch options
 */
export interface AppLaunchOptions {
  windowOptions?: Partial<WindowState>;
  focusExisting?: boolean; // For single-instance apps, focus existing window instead of creating new
  data?: Record<string, unknown>; // Initial data to pass to the app
}

/**
 * App launch result
 */
export interface AppLaunchResult {
  success: boolean;
  windowId?: string;
  error?: string;
  existingWindow?: boolean;
}

/**
 * App launcher service that coordinates app registry, lifecycle management, and window creation
 */
export class AppLauncher {
  private static instance: AppLauncher;

  private constructor() {}

  public static getInstance(): AppLauncher {
    if (!AppLauncher.instance) {
      AppLauncher.instance = new AppLauncher();
    }
    return AppLauncher.instance;
  }

  /**
   * Launch an application
   */
  public async launchApp(appId: AppId, options: AppLaunchOptions = {}): Promise<AppLaunchResult> {
    try {
      const appConfig = appRegistry.getApp(appId);
      if (!appConfig) {
        return {
          success: false,
          error: `Application '${appId}' not found in registry`,
        };
      }

      // Check if app supports multiple instances
      if (!appConfig.multiInstance) {
        const existingWindows = useWindowStore.getState().getWindowsByApp(appId);
        if (existingWindows.length > 0 && options.focusExisting !== false) {
          // Focus existing window for single-instance apps
          const windowToFocus = existingWindows[0];
          useWindowStore.getState().focusWindow(windowToFocus.id);
          appLifecycleManager.focusApp(appId, windowToFocus.id);
          
          return {
            success: true,
            windowId: windowToFocus.id,
            existingWindow: true,
          };
        }
      }

      // Create window with app configuration
      const windowOptions: Partial<WindowState> = {
        title: appConfig.name,
        bounds: {
          x: options.windowOptions?.bounds?.x ?? this.calculateWindowPosition().x,
          y: options.windowOptions?.bounds?.y ?? this.calculateWindowPosition().y,
          w: options.windowOptions?.bounds?.w ?? appConfig.defaultSize.width,
          h: options.windowOptions?.bounds?.h ?? appConfig.defaultSize.height,
        },
        ...options.windowOptions,
      };

      const windowId = useWindowStore.getState().createWindow(appId, windowOptions);

      // Track app usage for intelligent preloading
      preloadService.trackAppUsage(appId);

      // Preload related apps
      preloadService.preloadRelatedApps(appId);

      // Mount the app in lifecycle manager
      appLifecycleManager.mountApp(appId, windowId);

      // Activate the app
      appLifecycleManager.activateApp(appId);

      return {
        success: true,
        windowId,
        existingWindow: false,
      };
    } catch (error) {
      console.error('Error launching app:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Close an application window
   */
  public async closeApp(windowId: string, force = false): Promise<boolean> {
    try {
      const windowState = useWindowStore.getState().windows[windowId];
      if (!windowState) {
        return false;
      }

      const appId = windowState.appId;

      // Request close from window store (handles unsaved state confirmation)
      const canClose = await useWindowStore.getState().requestCloseWindow(windowId);
      
      if (!canClose && !force) {
        return false;
      }

      // Force close if needed
      if (force) {
        useWindowStore.getState().closeWindow(windowId, true);
      }

      // Unmount from lifecycle manager
      appLifecycleManager.unmountApp(appId, windowId);

      // Deactivate app if no more windows
      const remainingWindows = useWindowStore.getState().getWindowsByApp(appId);
      if (remainingWindows.length === 0) {
        appLifecycleManager.deactivateApp(appId);
      }

      return true;
    } catch (error) {
      console.error('Error closing app:', error);
      return false;
    }
  }

  /**
   * Focus an application window
   */
  public focusApp(windowId: string): void {
    const windowState = useWindowStore.getState().windows[windowId];
    if (!windowState) {
      return;
    }

    useWindowStore.getState().focusWindow(windowId);
    appLifecycleManager.focusApp(windowState.appId, windowId);
  }

  /**
   * Get all running applications
   */
  public getRunningApps(): Array<{ appId: AppId; windowCount: number; lastFocused?: string }> {
    const runningApps = appLifecycleManager.getRunningApps();
    return runningApps.map(app => ({
      appId: app.id,
      windowCount: app.windows.length,
      lastFocused: app.lastFocused,
    }));
  }

  /**
   * Check if an app can be launched (exists in registry)
   */
  public canLaunchApp(appId: AppId): boolean {
    return appRegistry.hasApp(appId);
  }

  /**
   * Get app configuration for UI display
   */
  public getAppInfo(appId: AppId) {
    return appRegistry.getApp(appId);
  }

  /**
   * Calculate smart window position to avoid overlap
   */
  private calculateWindowPosition(): { x: number; y: number } {
    const windows = Object.values(useWindowStore.getState().windows);
    const offset = 30;
    const baseX = 100;
    const baseY = 100;

    // Simple cascade positioning
    const cascade = windows.length % 10; // Reset after 10 windows
    return {
      x: baseX + (cascade * offset),
      y: baseY + (cascade * offset),
    };
  }

  /**
   * Launch app by double-click (with smart positioning)
   */
  public async launchAppFromDesktop(appId: AppId): Promise<AppLaunchResult> {
    return this.launchApp(appId, {
      focusExisting: true, // Focus existing window for desktop launches
    });
  }

  /**
   * Launch app from Start menu (always create new window for multi-instance apps)
   */
  public async launchAppFromStartMenu(appId: AppId): Promise<AppLaunchResult> {
    const appConfig = appRegistry.getApp(appId);
    return this.launchApp(appId, {
      focusExisting: !appConfig?.multiInstance, // Only focus existing for single-instance apps
    });
  }

  /**
   * Launch app with specific data (for deep linking)
   */
  public async launchAppWithData(appId: AppId, data: Record<string, unknown>): Promise<AppLaunchResult> {
    return this.launchApp(appId, {
      data,
      focusExisting: false, // Always create new window for data-specific launches
    });
  }
}

// Export singleton instance
export const appLauncher = AppLauncher.getInstance();