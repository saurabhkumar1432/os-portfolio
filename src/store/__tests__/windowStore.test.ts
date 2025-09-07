import { describe, it, expect, beforeEach } from 'vitest';
import { useWindowStore } from '../windowStore';
import type { WindowState, AppId } from '../../types';

describe('WindowStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useWindowStore.setState({
      windows: {},
      zOrder: [],
      dragState: null,
      resizeState: null,
      nextZIndex: 1,
    });
  });

  describe('createWindow', () => {
    it('should create a new window with default properties', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      
      expect(windowId).toBeDefined();
      expect(windowId).toMatch(/^projects-\d+-\w+$/);
      
      const currentState = useWindowStore.getState();
      const window = currentState.windows[windowId];
      expect(window).toBeDefined();
      expect(window.appId).toBe('projects');
      expect(window.focused).toBe(true);
      expect(window.minimized).toBe(false);
      expect(window.maximized).toBe(false);
      expect(window.zIndex).toBe(1);
    });

    it('should create window with custom options', () => {
      const store = useWindowStore.getState();
      const customBounds = { x: 200, y: 150, w: 600, h: 400 };
      const windowId = store.createWindow('terminal', {
        title: 'Custom Terminal',
        bounds: customBounds,
      });
      
      const currentState = useWindowStore.getState();
      const window = currentState.windows[windowId];
      expect(window.title).toBe('Custom Terminal');
      expect(window.bounds).toEqual(customBounds);
    });

    it('should unfocus other windows when creating a new one', () => {
      const store = useWindowStore.getState();
      const window1Id = store.createWindow('projects');
      const window2Id = store.createWindow('terminal');
      
      const currentState = useWindowStore.getState();
      expect(currentState.windows[window1Id].focused).toBe(false);
      expect(currentState.windows[window2Id].focused).toBe(true);
    });

    it('should increment z-index for new windows', () => {
      const store = useWindowStore.getState();
      const window1Id = store.createWindow('projects');
      const window2Id = store.createWindow('terminal');
      
      const currentState = useWindowStore.getState();
      expect(currentState.windows[window1Id].zIndex).toBe(1);
      expect(currentState.windows[window2Id].zIndex).toBe(2);
      expect(currentState.nextZIndex).toBe(3);
    });

    it('should add window to z-order', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      
      const currentState = useWindowStore.getState();
      expect(currentState.zOrder).toContain(windowId);
      expect(currentState.zOrder[currentState.zOrder.length - 1]).toBe(windowId);
    });
  });

  describe('closeWindow', () => {
    it('should remove window from state', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      store.closeWindow(windowId);
      
      const currentState = useWindowStore.getState();
      expect(currentState.windows[windowId]).toBeUndefined();
      expect(currentState.zOrder).not.toContain(windowId);
    });

    it('should focus next window when closing focused window', () => {
      const store = useWindowStore.getState();
      const window1Id = store.createWindow('projects');
      const window2Id = store.createWindow('terminal');
      
      // window2 should be focused initially
      let currentState = useWindowStore.getState();
      expect(currentState.windows[window2Id].focused).toBe(true);
      
      store.closeWindow(window2Id);
      
      // window1 should now be focused
      currentState = useWindowStore.getState();
      expect(currentState.windows[window1Id].focused).toBe(true);
    });

    it('should handle closing non-existent window gracefully', () => {
      const store = useWindowStore.getState();
      expect(() => store.closeWindow('non-existent')).not.toThrow();
    });

    it('should not close window with unsaved state unless forced', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('notepad');
      store.updateWindowUnsavedState(windowId, true);
      
      // Try to close without force
      store.closeWindow(windowId, false);
      
      let currentState = useWindowStore.getState();
      expect(currentState.windows[windowId]).toBeDefined();
      
      // Close with force
      store.closeWindow(windowId, true);
      
      currentState = useWindowStore.getState();
      expect(currentState.windows[windowId]).toBeUndefined();
    });

    it('should close window without unsaved state immediately', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      
      store.closeWindow(windowId, false);
      
      const currentState = useWindowStore.getState();
      expect(currentState.windows[windowId]).toBeUndefined();
    });
  });

  describe('requestCloseWindow', () => {
    it('should close window immediately if no unsaved state', async () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      
      const result = await store.requestCloseWindow(windowId);
      
      expect(result).toBe(true);
      const currentState = useWindowStore.getState();
      expect(currentState.windows[windowId]).toBeUndefined();
    });

    it('should return false for window with unsaved state', async () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('notepad');
      store.updateWindowUnsavedState(windowId, true);
      
      const result = await store.requestCloseWindow(windowId);
      
      expect(result).toBe(false);
      const currentState = useWindowStore.getState();
      expect(currentState.windows[windowId]).toBeDefined();
    });

    it('should return false for non-existent window', async () => {
      const store = useWindowStore.getState();
      const result = await store.requestCloseWindow('non-existent');
      
      expect(result).toBe(false);
    });
  });

  describe('focusWindow', () => {
    it('should focus specified window and unfocus others', () => {
      const store = useWindowStore.getState();
      const window1Id = store.createWindow('projects');
      const window2Id = store.createWindow('terminal');
      
      store.focusWindow(window1Id);
      
      const currentState = useWindowStore.getState();
      expect(currentState.windows[window1Id].focused).toBe(true);
      expect(currentState.windows[window2Id].focused).toBe(false);
    });

    it('should move focused window to end of z-order', () => {
      const store = useWindowStore.getState();
      const window1Id = store.createWindow('projects');
      const window2Id = store.createWindow('terminal');
      
      store.focusWindow(window1Id);
      
      const currentState = useWindowStore.getState();
      expect(currentState.zOrder[currentState.zOrder.length - 1]).toBe(window1Id);
    });

    it('should restore minimized window when focused', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      store.minimizeWindow(windowId);
      
      let currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].minimized).toBe(true);
      
      store.focusWindow(windowId);
      
      currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].minimized).toBe(false);
      expect(currentState.windows[windowId].focused).toBe(true);
    });

    it('should not focus minimized window without restoring', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      store.minimizeWindow(windowId);
      
      store.focusWindow(windowId);
      
      // Should restore the window
      const currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].minimized).toBe(false);
    });
  });

  describe('minimizeWindow', () => {
    it('should minimize window and unfocus it', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      store.minimizeWindow(windowId);
      
      const currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].minimized).toBe(true);
      expect(currentState.windows[windowId].focused).toBe(false);
    });

    it('should focus next available window', () => {
      const store = useWindowStore.getState();
      const window1Id = store.createWindow('projects');
      const window2Id = store.createWindow('terminal');
      
      // window2 is focused initially
      store.minimizeWindow(window2Id);
      
      const currentState = useWindowStore.getState();
      expect(currentState.windows[window1Id].focused).toBe(true);
    });
  });

  describe('maximizeWindow', () => {
    it('should toggle maximize state', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      
      let currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].maximized).toBe(false);
      
      store.maximizeWindow(windowId);
      currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].maximized).toBe(true);
      expect(currentState.windows[windowId].snapState).toBe('maximized');
      
      store.maximizeWindow(windowId);
      currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].maximized).toBe(false);
      expect(currentState.windows[windowId].snapState).toBe(null);
    });
  });

  describe('restoreWindow', () => {
    it('should restore minimized and maximized window', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      store.minimizeWindow(windowId);
      store.maximizeWindow(windowId);
      
      store.restoreWindow(windowId);
      
      const currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].minimized).toBe(false);
      expect(currentState.windows[windowId].maximized).toBe(false);
      expect(currentState.windows[windowId].snapState).toBe(null);
      expect(currentState.windows[windowId].focused).toBe(true);
    });
  });

  describe('updateWindowBounds', () => {
    it('should update window bounds', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      const newBounds = { x: 300, y: 200, w: 700, h: 500 };
      
      store.updateWindowBounds(windowId, newBounds);
      
      const currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].bounds).toEqual(newBounds);
    });

    it('should partially update window bounds', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      const originalBounds = useWindowStore.getState().windows[windowId].bounds;
      
      store.updateWindowBounds(windowId, { x: 300, y: 200 });
      
      const currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].bounds).toEqual({
        ...originalBounds,
        x: 300,
        y: 200,
      });
    });
  });

  describe('updateWindowTitle', () => {
    it('should update window title', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      store.updateWindowTitle(windowId, 'New Title');
      
      const currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].title).toBe('New Title');
    });
  });

  describe('updateWindowUnsavedState', () => {
    it('should update unsaved state', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('notepad');
      store.updateWindowUnsavedState(windowId, true);
      
      const currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].hasUnsavedState).toBe(true);
    });
  });

  describe('bringToFront', () => {
    it('should move window to front of z-order', () => {
      const store = useWindowStore.getState();
      const window1Id = store.createWindow('projects');
      const window2Id = store.createWindow('terminal');
      const window3Id = store.createWindow('notepad');
      
      store.bringToFront(window1Id);
      
      const currentState = useWindowStore.getState();
      expect(currentState.zOrder[currentState.zOrder.length - 1]).toBe(window1Id);
    });
  });

  describe('closeAllWindows', () => {
    it('should close all windows', () => {
      const store = useWindowStore.getState();
      store.createWindow('projects');
      store.createWindow('terminal');
      store.createWindow('notepad');
      
      let currentState = useWindowStore.getState();
      expect(Object.keys(currentState.windows)).toHaveLength(3);
      
      store.closeAllWindows();
      
      currentState = useWindowStore.getState();
      expect(Object.keys(currentState.windows)).toHaveLength(0);
      expect(currentState.zOrder).toHaveLength(0);
    });
  });

  describe('minimizeAllWindows', () => {
    it('should minimize all windows', () => {
      const store = useWindowStore.getState();
      const window1Id = store.createWindow('projects');
      const window2Id = store.createWindow('terminal');
      
      store.minimizeAllWindows();
      
      const currentState = useWindowStore.getState();
      expect(currentState.windows[window1Id].minimized).toBe(true);
      expect(currentState.windows[window1Id].focused).toBe(false);
      expect(currentState.windows[window2Id].minimized).toBe(true);
      expect(currentState.windows[window2Id].focused).toBe(false);
    });
  });

  describe('selectors', () => {
    describe('getFocusedWindow', () => {
      it('should return focused window', () => {
        const store = useWindowStore.getState();
        const windowId = store.createWindow('projects');
        const focusedWindow = store.getFocusedWindow();
        
        expect(focusedWindow?.id).toBe(windowId);
      });

      it('should return null when no window is focused', () => {
        const store = useWindowStore.getState();
        const windowId = store.createWindow('projects');
        store.minimizeWindow(windowId);
        
        const focusedWindow = store.getFocusedWindow();
        expect(focusedWindow).toBe(null);
      });
    });

    describe('getWindowsByApp', () => {
      it('should return windows for specific app', () => {
        const store = useWindowStore.getState();
        const projectsId = store.createWindow('projects');
        const terminalId = store.createWindow('terminal');
        const terminal2Id = store.createWindow('terminal');
        
        // Get fresh store state to ensure we have the latest data
        const currentStore = useWindowStore.getState();
        const terminalWindows = currentStore.getWindowsByApp('terminal');
        
        expect(terminalWindows).toHaveLength(2);
        expect(terminalWindows.map(w => w.id)).toContain(terminalId);
        expect(terminalWindows.map(w => w.id)).toContain(terminal2Id);
        expect(terminalWindows.map(w => w.id)).not.toContain(projectsId);
      });
    });

    describe('getVisibleWindows', () => {
      it('should return non-minimized windows', () => {
        const store = useWindowStore.getState();
        const window1Id = store.createWindow('projects');
        const window2Id = store.createWindow('terminal');
        store.minimizeWindow(window2Id);
        
        const visibleWindows = store.getVisibleWindows();
        
        expect(visibleWindows).toHaveLength(1);
        expect(visibleWindows[0].id).toBe(window1Id);
      });
    });

    describe('getMinimizedWindows', () => {
      it('should return minimized windows', () => {
        const store = useWindowStore.getState();
        const window1Id = store.createWindow('projects');
        const window2Id = store.createWindow('terminal');
        store.minimizeWindow(window2Id);
        
        const minimizedWindows = store.getMinimizedWindows();
        
        expect(minimizedWindows).toHaveLength(1);
        expect(minimizedWindows[0].id).toBe(window2Id);
      });
    });

    describe('isWindowFocused', () => {
      it('should return true for focused window', () => {
        const store = useWindowStore.getState();
        const windowId = store.createWindow('projects');
        
        expect(store.isWindowFocused(windowId)).toBe(true);
      });

      it('should return false for non-focused window', () => {
        const store = useWindowStore.getState();
        const window1Id = store.createWindow('projects');
        const window2Id = store.createWindow('terminal');
        
        expect(store.isWindowFocused(window1Id)).toBe(false);
      });
    });

    describe('hasUnsavedWindows', () => {
      it('should return true when windows have unsaved state', () => {
        const store = useWindowStore.getState();
        const windowId = store.createWindow('notepad');
        store.updateWindowUnsavedState(windowId, true);
        
        expect(store.hasUnsavedWindows()).toBe(true);
      });

      it('should return false when no windows have unsaved state', () => {
        const store = useWindowStore.getState();
        store.createWindow('projects');
        
        expect(store.hasUnsavedWindows()).toBe(false);
      });
    });
  });

  describe('window state transitions', () => {
    it('should handle minimize -> focus transition', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      
      // Minimize window
      store.minimizeWindow(windowId);
      let currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].minimized).toBe(true);
      expect(currentState.windows[windowId].focused).toBe(false);
      
      // Focus should restore from minimized
      store.focusWindow(windowId);
      currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].minimized).toBe(false);
      expect(currentState.windows[windowId].focused).toBe(true);
    });

    it('should handle maximize -> minimize -> restore transition', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('projects');
      
      // Maximize window
      store.maximizeWindow(windowId);
      let currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].maximized).toBe(true);
      expect(currentState.windows[windowId].snapState).toBe('maximized');
      
      // Minimize maximized window
      store.minimizeWindow(windowId);
      currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].minimized).toBe(true);
      expect(currentState.windows[windowId].focused).toBe(false);
      // Should still be maximized when restored
      expect(currentState.windows[windowId].maximized).toBe(true);
      
      // Restore window
      store.restoreWindow(windowId);
      currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].minimized).toBe(false);
      expect(currentState.windows[windowId].maximized).toBe(false);
      expect(currentState.windows[windowId].snapState).toBe(null);
      expect(currentState.windows[windowId].focused).toBe(true);
    });

    it('should handle focus transitions between multiple windows', () => {
      const store = useWindowStore.getState();
      const window1Id = store.createWindow('projects');
      const window2Id = store.createWindow('terminal');
      const window3Id = store.createWindow('notepad');
      
      // window3 should be focused initially
      let currentState = useWindowStore.getState();
      expect(currentState.windows[window3Id].focused).toBe(true);
      expect(currentState.windows[window2Id].focused).toBe(false);
      expect(currentState.windows[window1Id].focused).toBe(false);
      
      // Focus window1
      store.focusWindow(window1Id);
      currentState = useWindowStore.getState();
      expect(currentState.windows[window1Id].focused).toBe(true);
      expect(currentState.windows[window2Id].focused).toBe(false);
      expect(currentState.windows[window3Id].focused).toBe(false);
      
      // Minimize window1, should focus next in z-order
      store.minimizeWindow(window1Id);
      currentState = useWindowStore.getState();
      expect(currentState.windows[window1Id].focused).toBe(false);
      expect(currentState.windows[window3Id].focused).toBe(true);
    });

    it('should maintain z-order during state transitions', () => {
      const store = useWindowStore.getState();
      const window1Id = store.createWindow('projects');
      const window2Id = store.createWindow('terminal');
      const window3Id = store.createWindow('notepad');
      
      let currentState = useWindowStore.getState();
      const initialZOrder = [...currentState.zOrder];
      
      // Minimize and restore should not affect z-order
      store.minimizeWindow(window2Id);
      store.focusWindow(window2Id); // This should restore and bring to front
      
      currentState = useWindowStore.getState();
      expect(currentState.zOrder[currentState.zOrder.length - 1]).toBe(window2Id);
      expect(currentState.zOrder).toHaveLength(3);
    });

    it('should handle unsaved state persistence through transitions', () => {
      const store = useWindowStore.getState();
      const windowId = store.createWindow('notepad');
      store.updateWindowUnsavedState(windowId, true);
      
      // Unsaved state should persist through minimize/restore
      store.minimizeWindow(windowId);
      let currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].hasUnsavedState).toBe(true);
      
      store.focusWindow(windowId);
      currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].hasUnsavedState).toBe(true);
      
      // Unsaved state should persist through maximize/restore
      store.maximizeWindow(windowId);
      currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].hasUnsavedState).toBe(true);
      
      store.restoreWindow(windowId);
      currentState = useWindowStore.getState();
      expect(currentState.windows[windowId].hasUnsavedState).toBe(true);
    });
  });

  describe('drag and resize state', () => {
    it('should set and clear drag state', () => {
      const store = useWindowStore.getState();
      const dragState = {
        windowId: 'test-window',
        startPosition: { x: 100, y: 100 },
        startBounds: { x: 50, y: 50, w: 800, h: 600 },
        offset: { x: 10, y: 10 },
      };
      
      store.setDragState(dragState);
      let currentState = useWindowStore.getState();
      expect(currentState.dragState).toEqual(dragState);
      
      store.setDragState(null);
      currentState = useWindowStore.getState();
      expect(currentState.dragState).toBe(null);
    });

    it('should set and clear resize state', () => {
      const store = useWindowStore.getState();
      const resizeState = {
        windowId: 'test-window',
        handle: 'se' as const,
        startBounds: { x: 50, y: 50, w: 800, h: 600 },
        startPosition: { x: 100, y: 100 },
      };
      
      store.setResizeState(resizeState);
      let currentState = useWindowStore.getState();
      expect(currentState.resizeState).toEqual(resizeState);
      
      store.setResizeState(null);
      currentState = useWindowStore.getState();
      expect(currentState.resizeState).toBe(null);
    });
  });
});