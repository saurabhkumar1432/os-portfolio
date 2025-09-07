import { useWindowStore } from '../store/windowStore';
import { usePreferencesStore } from '../store/preferencesStore';
import type { WindowState, AppId } from '../types';

export class WindowLifecycleManager {
  private static instance: WindowLifecycleManager;
  private cleanupFunctions = new Map<string, () => void>();

  static getInstance(): WindowLifecycleManager {
    if (!WindowLifecycleManager.instance) {
      WindowLifecycleManager.instance = new WindowLifecycleManager();
    }
    return WindowLifecycleManager.instance;
  }

  /**
   * Register window with lifecycle management
   */
  registerWindow(windowId: string, appId: AppId): void {
    const { windows } = useWindowStore.getState();
    const window = windows[windowId];
    
    if (!window) return;

    // Set up auto-save for window position
    const savePosition = () => {
      const { updatePreferences } = usePreferencesStore.getState();
      const currentWindow = useWindowStore.getState().windows[windowId];
      
      if (currentWindow) {
        updatePreferences({
          windowPositions: {
            [appId]: {
              bounds: currentWindow.bounds,
              maximized: currentWindow.maximized,
              minimized: currentWindow.minimized || false,
            }
          }
        });
      }
    };

    // Set up periodic position saving
    const positionSaveInterval = setInterval(savePosition, 1000);

    // Set up cleanup
    const cleanup = () => {
      clearInterval(positionSaveInterval);
      savePosition(); // Final save
      this.cleanupFunctions.delete(windowId);
    };

    this.cleanupFunctions.set(windowId, cleanup);
  }

  /**
   * Unregister window and cleanup
   */
  unregisterWindow(windowId: string): void {
    const cleanup = this.cleanupFunctions.get(windowId);
    if (cleanup) {
      cleanup();
    }
  }

  /**
   * Handle window focus changes
   */
  handleWindowFocus(windowId: string): void {
    const { windows } = useWindowStore.getState();
    const window = windows[windowId];
    
    if (!window) return;

    // Bring window to front
    const { focusWindow } = useWindowStore.getState();
    focusWindow(windowId);

    // Update recent apps list
    const { updatePreferences } = usePreferencesStore.getState();
    const { recentApps } = usePreferencesStore.getState();
    
    const currentRecentApps = recentApps || [];
    const updatedRecent = [
      window.appId,
      ...currentRecentApps.filter((id: string) => id !== window.appId)
    ].slice(0, 10); // Keep last 10

    updatePreferences({ recentApps: updatedRecent });
  }

  /**
   * Handle window state changes for accessibility
   */
  handleWindowStateChange(windowId: string, previousState: Partial<WindowState>, newState: Partial<WindowState>): void {
    const announcements: string[] = [];

    if (previousState.minimized !== newState.minimized) {
      announcements.push(`Window ${newState.minimized ? 'minimized' : 'restored'}`);
    }

    if (previousState.maximized !== newState.maximized) {
      announcements.push(`Window ${newState.maximized ? 'maximized' : 'restored'}`);
    }

    if (previousState.focused !== newState.focused && newState.focused) {
      const { windows } = useWindowStore.getState();
      const window = windows[windowId];
      if (window) {
        announcements.push(`${window.title} window focused`);
      }
    }

    // Announce to screen readers
    announcements.forEach(announcement => {
      // Create temporary live region for announcement
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.textContent = announcement;
      
      document.body.appendChild(liveRegion);
      
      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 1000);
    });
  }

  /**
   * Cleanup all windows
   */
  cleanup(): void {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions.clear();
  }
}

export const windowLifecycleManager = WindowLifecycleManager.getInstance();
