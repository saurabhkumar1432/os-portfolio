import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { WindowState, AppId, DragState, ResizeState } from '../types';

interface WindowManagerState {
  windows: Record<string, WindowState>;
  zOrder: string[];
  dragState: DragState | null;
  resizeState: ResizeState | null;
  nextZIndex: number;
}

interface WindowManagerActions {
  // Window lifecycle
  createWindow: (appId: AppId, options?: Partial<WindowState>) => string;
  closeWindow: (windowId: string, force?: boolean) => void;
  requestCloseWindow: (windowId: string) => Promise<boolean>;
  focusWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;

  // Window positioning
  updateWindowBounds: (
    windowId: string,
    bounds: Partial<WindowState['bounds']>
  ) => void;
  updateWindowTitle: (windowId: string, title: string) => void;
  updateWindowUnsavedState: (windowId: string, hasUnsaved: boolean) => void;
  updateWindowSnapState: (windowId: string, snapState: WindowState['snapState']) => void;
  updateWindow: (windowId: string, updates: Partial<WindowState>) => void;

  // Drag and resize state
  setDragState: (dragState: DragState | null) => void;
  setResizeState: (resizeState: ResizeState | null) => void;

  // Utility actions
  bringToFront: (windowId: string) => void;
  closeAllWindows: () => void;
  minimizeAllWindows: () => void;
}

interface WindowManagerSelectors {
  // Selectors for computed values
  getFocusedWindow: () => WindowState | null;
  getWindowsByApp: (appId: AppId) => WindowState[];
  getVisibleWindows: () => WindowState[];
  getMinimizedWindows: () => WindowState[];
  isWindowFocused: (windowId: string) => boolean;
  hasUnsavedWindows: () => boolean;
}

type WindowStore = WindowManagerState & WindowManagerActions & WindowManagerSelectors;

export const useWindowStore = create<WindowStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    windows: {},
    zOrder: [],
    dragState: null,
    resizeState: null,
    nextZIndex: 1,

    // Actions
    createWindow: (appId: AppId, options = {}) => {
      const state = get();
      const windowId = `${appId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newWindow: WindowState = {
        id: windowId,
        appId,
        title: options.title || appId,
        bounds: options.bounds || { x: 100, y: 100, w: 800, h: 600 },
        zIndex: state.nextZIndex,
        minimized: false,
        maximized: false,
        focused: true,
        ...options,
      };

      // Unfocus all other windows
      const windows = { ...state.windows };
      Object.keys(windows).forEach((id) => {
        windows[id] = { ...windows[id], focused: false };
      });
      windows[windowId] = newWindow;

      set({
        windows,
        zOrder: [...state.zOrder, windowId],
        nextZIndex: state.nextZIndex + 1,
      });

      return windowId;
    },

    closeWindow: (windowId: string, force = false) => {
      set((state) => {
        const window = state.windows[windowId];
        if (!window) return state;

        // If window has unsaved state and not forced, don't close
        if (window.hasUnsavedState && !force) {
          return state;
        }

        const windows = { ...state.windows };
        delete windows[windowId];
        const newZOrder = state.zOrder.filter((id) => id !== windowId);
        
        // Focus the next window in z-order if the closed window was focused
        if (window.focused && newZOrder.length > 0) {
          const nextWindowId = newZOrder[newZOrder.length - 1];
          if (windows[nextWindowId]) {
            windows[nextWindowId] = { ...windows[nextWindowId], focused: true };
          }
        }

        return {
          windows,
          zOrder: newZOrder,
        };
      });
    },

    requestCloseWindow: async (windowId: string) => {
      const state = get();
      const window = state.windows[windowId];
      
      if (!window) return false;
      
      // If no unsaved state, close immediately
      if (!window.hasUnsavedState) {
        get().closeWindow(windowId);
        return true;
      }

      // Return false to indicate that confirmation is needed
      // The UI component will handle showing the confirmation dialog
      return false;
    },

    focusWindow: (windowId: string) => {
      set((state) => {
        if (!state.windows[windowId]) {
          return state;
        }

        const windows = { ...state.windows };
        
        // Unfocus all windows first
        Object.keys(windows).forEach((id) => {
          windows[id] = { ...windows[id], focused: false };
        });

        // Focus the target window
        windows[windowId] = { 
          ...windows[windowId], 
          focused: true,
          minimized: false // Restore if minimized
        };

        // Update z-order - bring focused window to front
        const zOrder = state.zOrder.filter((id) => id !== windowId);
        zOrder.push(windowId);

        // Update z-index values
        zOrder.forEach((id, index) => {
          if (windows[id]) {
            windows[id] = { ...windows[id], zIndex: index + 1 };
          }
        });

        return { windows, zOrder };
      });
    },

    minimizeWindow: (windowId: string) => {
      set((state) => {
        if (!state.windows[windowId]) return state;

        const windows = { ...state.windows };
        windows[windowId] = {
          ...windows[windowId],
          minimized: true,
          focused: false,
        };

        // Focus the next window in z-order
        const remainingWindows = state.zOrder.filter(id => 
          id !== windowId && windows[id] && !windows[id].minimized
        );
        
        if (remainingWindows.length > 0) {
          const nextWindowId = remainingWindows[remainingWindows.length - 1];
          if (windows[nextWindowId]) {
            windows[nextWindowId] = { ...windows[nextWindowId], focused: true };
          }
        }

        return { windows };
      });
    },

    maximizeWindow: (windowId: string) => {
      set((state) => ({
        windows: {
          ...state.windows,
          [windowId]: {
            ...state.windows[windowId],
            maximized: !state.windows[windowId].maximized,
            snapState: state.windows[windowId].maximized ? null : 'maximized',
          },
        },
      }));
    },

    restoreWindow: (windowId: string) => {
      set((state) => ({
        windows: {
          ...state.windows,
          [windowId]: {
            ...state.windows[windowId],
            minimized: false,
            maximized: false,
            snapState: null,
            focused: true,
          },
        },
      }));
    },

    updateWindowBounds: (
      windowId: string,
      bounds: Partial<WindowState['bounds']>
    ) => {
      set((state) => ({
        windows: {
          ...state.windows,
          [windowId]: {
            ...state.windows[windowId],
            bounds: { ...state.windows[windowId].bounds, ...bounds },
          },
        },
      }));
    },

    updateWindowTitle: (windowId: string, title: string) => {
      set((state) => ({
        windows: {
          ...state.windows,
          [windowId]: {
            ...state.windows[windowId],
            title,
          },
        },
      }));
    },

    updateWindowUnsavedState: (windowId: string, hasUnsaved: boolean) => {
      set((state) => ({
        windows: {
          ...state.windows,
          [windowId]: {
            ...state.windows[windowId],
            hasUnsavedState: hasUnsaved,
          },
        },
      }));
    },

    updateWindowSnapState: (windowId: string, snapState: WindowState['snapState']) => {
      set((state) => ({
        windows: {
          ...state.windows,
          [windowId]: {
            ...state.windows[windowId],
            snapState,
          },
        },
      }));
    },

    updateWindow: (windowId: string, updates: Partial<WindowState>) => {
      set((state) => ({
        windows: {
          ...state.windows,
          [windowId]: {
            ...state.windows[windowId],
            ...updates,
          },
        },
      }));
    },

    setDragState: (dragState: DragState | null) => {
      set({ dragState });
    },

    setResizeState: (resizeState: ResizeState | null) => {
      set({ resizeState });
    },

    bringToFront: (windowId: string) => {
      set((state) => {
        const zOrder = state.zOrder.filter((id) => id !== windowId);
        zOrder.push(windowId);
        return { zOrder };
      });
    },

    closeAllWindows: () => {
      set({ windows: {}, zOrder: [] });
    },

    minimizeAllWindows: () => {
      set((state) => {
        const windows = { ...state.windows };
        Object.keys(windows).forEach((id) => {
          windows[id] = { ...windows[id], minimized: true, focused: false };
        });
        return { windows };
      });
    },

    // Selectors
    getFocusedWindow: () => {
      const state = get();
      return Object.values(state.windows).find(window => window.focused) || null;
    },

    getWindowsByApp: (appId: AppId) => {
      const state = get();
      return Object.values(state.windows).filter(window => window.appId === appId);
    },

    getVisibleWindows: () => {
      const state = get();
      return Object.values(state.windows).filter(window => !window.minimized);
    },

    getMinimizedWindows: () => {
      const state = get();
      return Object.values(state.windows).filter(window => window.minimized);
    },

    isWindowFocused: (windowId: string) => {
      const state = get();
      return state.windows[windowId]?.focused || false;
    },

    hasUnsavedWindows: () => {
      const state = get();
      return Object.values(state.windows).some(window => window.hasUnsavedState);
    },
  }))
);
