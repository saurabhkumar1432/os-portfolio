import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { AppId, AppState } from '../types';
import { appRegistry } from './appRegistry';

/**
 * App lifecycle events
 */
export interface AppLifecycleEvent {
  type: 'mount' | 'unmount' | 'focus' | 'blur' | 'activate' | 'deactivate';
  appId: AppId;
  windowId?: string;
  timestamp: number;
}

/**
 * App lifecycle listener function
 */
export type AppLifecycleListener = (event: AppLifecycleEvent) => void;

/**
 * App lifecycle manager state
 */
interface AppLifecycleState {
  apps: Record<AppId, AppState>;
  listeners: Map<string, AppLifecycleListener>;
  eventHistory: AppLifecycleEvent[];
}

/**
 * App lifecycle manager actions
 */
interface AppLifecycleActions {
  // App lifecycle
  mountApp: (appId: AppId, windowId: string) => void;
  unmountApp: (appId: AppId, windowId: string) => void;
  focusApp: (appId: AppId, windowId: string) => void;
  blurApp: (appId: AppId, windowId: string) => void;
  activateApp: (appId: AppId) => void;
  deactivateApp: (appId: AppId) => void;

  // Event management
  addEventListener: (id: string, listener: AppLifecycleListener) => void;
  removeEventListener: (id: string) => void;
  clearEventHistory: () => void;

  // App state queries
  isAppRunning: (appId: AppId) => boolean;
  getAppState: (appId: AppId) => AppState | null;
  getRunningApps: () => AppState[];
  getAppWindows: (appId: AppId) => string[];
}

type AppLifecycleStore = AppLifecycleState & AppLifecycleActions;

export const useAppLifecycleStore = create<AppLifecycleStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    apps: {} as Record<AppId, AppState>,
    listeners: new Map(),
    eventHistory: [],

    // Actions
    mountApp: (appId: AppId, windowId: string) => {
      const appConfig = appRegistry.getApp(appId);
      if (!appConfig) {
        console.warn(`Cannot mount unknown app: ${appId}`);
        return;
      }

      set((state) => {
        const existingApp = state.apps[appId];
        const newApp: AppState = existingApp
          ? {
              ...existingApp,
              running: true,
              windows: [...existingApp.windows, windowId],
              lastFocused: windowId,
            }
          : {
              id: appId,
              name: appConfig.name,
              icon: appConfig.icon,
              running: true,
              windows: [windowId],
              lastFocused: windowId,
            };

        const event: AppLifecycleEvent = {
          type: 'mount',
          appId,
          windowId,
          timestamp: Date.now(),
        };

        // Emit event to listeners
        state.listeners.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error('Error in app lifecycle listener:', error);
          }
        });

        return {
          apps: { ...state.apps, [appId]: newApp },
          eventHistory: [...state.eventHistory, event].slice(-100), // Keep last 100 events
        };
      });
    },

    unmountApp: (appId: AppId, windowId: string) => {
      set((state) => {
        const app = state.apps[appId];
        if (!app) return state;

        const remainingWindows = app.windows.filter(id => id !== windowId);
        const event: AppLifecycleEvent = {
          type: 'unmount',
          appId,
          windowId,
          timestamp: Date.now(),
        };

        // Emit event to listeners
        state.listeners.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error('Error in app lifecycle listener:', error);
          }
        });

        const updatedApps = { ...state.apps };

        if (remainingWindows.length === 0) {
          // No more windows, mark app as not running
          updatedApps[appId] = {
            ...app,
            running: false,
            windows: [],
            lastFocused: undefined,
          };
        } else {
          // Update windows list
          updatedApps[appId] = {
            ...app,
            windows: remainingWindows,
            lastFocused: app.lastFocused === windowId 
              ? remainingWindows[remainingWindows.length - 1] 
              : app.lastFocused,
          };
        }

        return {
          apps: updatedApps,
          eventHistory: [...state.eventHistory, event].slice(-100),
        };
      });
    },

    focusApp: (appId: AppId, windowId: string) => {
      set((state) => {
        const app = state.apps[appId];
        if (!app || !app.windows.includes(windowId)) return state;

        const event: AppLifecycleEvent = {
          type: 'focus',
          appId,
          windowId,
          timestamp: Date.now(),
        };

        // Emit event to listeners
        state.listeners.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error('Error in app lifecycle listener:', error);
          }
        });

        return {
          apps: {
            ...state.apps,
            [appId]: { ...app, lastFocused: windowId },
          },
          eventHistory: [...state.eventHistory, event].slice(-100),
        };
      });
    },

    blurApp: (appId: AppId, windowId: string) => {
      const event: AppLifecycleEvent = {
        type: 'blur',
        appId,
        windowId,
        timestamp: Date.now(),
      };

      set((state) => {
        // Emit event to listeners
        state.listeners.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error('Error in app lifecycle listener:', error);
          }
        });

        return {
          eventHistory: [...state.eventHistory, event].slice(-100),
        };
      });
    },

    activateApp: (appId: AppId) => {
      const event: AppLifecycleEvent = {
        type: 'activate',
        appId,
        timestamp: Date.now(),
      };

      set((state) => {
        // Emit event to listeners
        state.listeners.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error('Error in app lifecycle listener:', error);
          }
        });

        return {
          eventHistory: [...state.eventHistory, event].slice(-100),
        };
      });
    },

    deactivateApp: (appId: AppId) => {
      const event: AppLifecycleEvent = {
        type: 'deactivate',
        appId,
        timestamp: Date.now(),
      };

      set((state) => {
        // Emit event to listeners
        state.listeners.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error('Error in app lifecycle listener:', error);
          }
        });

        return {
          eventHistory: [...state.eventHistory, event].slice(-100),
        };
      });
    },

    addEventListener: (id: string, listener: AppLifecycleListener) => {
      set((state) => {
        const newListeners = new Map(state.listeners);
        newListeners.set(id, listener);
        return { listeners: newListeners };
      });
    },

    removeEventListener: (id: string) => {
      set((state) => {
        const newListeners = new Map(state.listeners);
        newListeners.delete(id);
        return { listeners: newListeners };
      });
    },

    clearEventHistory: () => {
      set({ eventHistory: [] });
    },

    // Selectors
    isAppRunning: (appId: AppId) => {
      const state = get();
      return state.apps[appId]?.running || false;
    },

    getAppState: (appId: AppId) => {
      const state = get();
      return state.apps[appId] || null;
    },

    getRunningApps: () => {
      const state = get();
      return Object.values(state.apps).filter(app => app.running);
    },

    getAppWindows: (appId: AppId) => {
      const state = get();
      return state.apps[appId]?.windows || [];
    },
  }))
);

/**
 * App lifecycle manager class for easier integration
 */
export class AppLifecycleManager {
  private static instance: AppLifecycleManager;

  private constructor() {}

  public static getInstance(): AppLifecycleManager {
    if (!AppLifecycleManager.instance) {
      AppLifecycleManager.instance = new AppLifecycleManager();
    }
    return AppLifecycleManager.instance;
  }

  /**
   * Mount an app instance
   */
  public mountApp(appId: AppId, windowId: string): void {
    useAppLifecycleStore.getState().mountApp(appId, windowId);
  }

  /**
   * Unmount an app instance
   */
  public unmountApp(appId: AppId, windowId: string): void {
    useAppLifecycleStore.getState().unmountApp(appId, windowId);
  }

  /**
   * Focus an app window
   */
  public focusApp(appId: AppId, windowId: string): void {
    useAppLifecycleStore.getState().focusApp(appId, windowId);
  }

  /**
   * Blur an app window
   */
  public blurApp(appId: AppId, windowId: string): void {
    useAppLifecycleStore.getState().blurApp(appId, windowId);
  }

  /**
   * Activate an app (bring to foreground)
   */
  public activateApp(appId: AppId): void {
    useAppLifecycleStore.getState().activateApp(appId);
  }

  /**
   * Deactivate an app
   */
  public deactivateApp(appId: AppId): void {
    useAppLifecycleStore.getState().deactivateApp(appId);
  }

  /**
   * Add lifecycle event listener
   */
  public addEventListener(id: string, listener: AppLifecycleListener): void {
    useAppLifecycleStore.getState().addEventListener(id, listener);
  }

  /**
   * Remove lifecycle event listener
   */
  public removeEventListener(id: string): void {
    useAppLifecycleStore.getState().removeEventListener(id);
  }

  /**
   * Check if app is running
   */
  public isAppRunning(appId: AppId): boolean {
    return useAppLifecycleStore.getState().isAppRunning(appId);
  }

  /**
   * Get app state
   */
  public getAppState(appId: AppId): AppState | null {
    return useAppLifecycleStore.getState().getAppState(appId);
  }

  /**
   * Get all running apps
   */
  public getRunningApps(): AppState[] {
    return useAppLifecycleStore.getState().getRunningApps();
  }
}

// Export singleton instance
export const appLifecycleManager = AppLifecycleManager.getInstance();