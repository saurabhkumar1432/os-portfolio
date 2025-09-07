import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppLifecycleManager, useAppLifecycleStore, type AppLifecycleEvent } from '../appLifecycleManager';
import { appRegistry } from '../appRegistry';
import type { AppId } from '../../types';

// Mock the app registry
vi.mock('../appRegistry', () => ({
  appRegistry: {
    getApp: vi.fn((appId: AppId) => {
      const apps = {
        'projects': { id: 'projects', name: 'Projects', icon: 'FolderOpen' },
        'terminal': { id: 'terminal', name: 'Terminal', icon: 'Terminal' },
      };
      return apps[appId];
    }),
  },
}));

describe('AppLifecycleManager', () => {
  let manager: AppLifecycleManager;
  let store: ReturnType<typeof useAppLifecycleStore.getState>;

  beforeEach(() => {
    // Reset store state
    useAppLifecycleStore.setState({
      apps: {},
      listeners: new Map(),
      eventHistory: [],
    });
    
    manager = AppLifecycleManager.getInstance();
    store = useAppLifecycleStore.getState();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AppLifecycleManager.getInstance();
      const instance2 = AppLifecycleManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('mountApp', () => {
    it('should mount new app', () => {
      manager.mountApp('projects', 'window-1');
      
      const appState = store.getAppState('projects');
      expect(appState).toBeDefined();
      expect(appState?.running).toBe(true);
      expect(appState?.windows).toContain('window-1');
      expect(appState?.lastFocused).toBe('window-1');
    });

    it('should add window to existing app', () => {
      manager.mountApp('terminal', 'window-1');
      manager.mountApp('terminal', 'window-2');
      
      const appState = store.getAppState('terminal');
      expect(appState?.windows).toHaveLength(2);
      expect(appState?.windows).toContain('window-1');
      expect(appState?.windows).toContain('window-2');
      expect(appState?.lastFocused).toBe('window-2');
    });

    it('should emit mount event', () => {
      const listener = vi.fn();
      store.addEventListener('test', listener);
      
      manager.mountApp('projects', 'window-1');
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'mount',
          appId: 'projects',
          windowId: 'window-1',
        })
      );
    });

    it('should handle unknown app gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      manager.mountApp('unknown' as AppId, 'window-1');
      
      expect(consoleSpy).toHaveBeenCalledWith('Cannot mount unknown app: unknown');
      expect(store.getAppState('unknown' as AppId)).toBeNull();
      
      consoleSpy.mockRestore();
    });
  });

  describe('unmountApp', () => {
    beforeEach(() => {
      manager.mountApp('terminal', 'window-1');
      manager.mountApp('terminal', 'window-2');
    });

    it('should remove window from app', () => {
      manager.unmountApp('terminal', 'window-1');
      
      const appState = store.getAppState('terminal');
      expect(appState?.windows).toHaveLength(1);
      expect(appState?.windows).toContain('window-2');
      expect(appState?.running).toBe(true);
    });

    it('should mark app as not running when last window is removed', () => {
      manager.unmountApp('terminal', 'window-1');
      manager.unmountApp('terminal', 'window-2');
      
      const appState = store.getAppState('terminal');
      expect(appState?.running).toBe(false);
      expect(appState?.windows).toHaveLength(0);
      expect(appState?.lastFocused).toBeUndefined();
    });

    it('should update lastFocused when focused window is removed', () => {
      manager.unmountApp('terminal', 'window-2'); // Remove last focused
      
      const appState = store.getAppState('terminal');
      expect(appState?.lastFocused).toBe('window-1');
    });

    it('should emit unmount event', () => {
      const listener = vi.fn();
      store.addEventListener('test', listener);
      
      manager.unmountApp('terminal', 'window-1');
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'unmount',
          appId: 'terminal',
          windowId: 'window-1',
        })
      );
    });

    it('should handle non-existent app gracefully', () => {
      manager.unmountApp('unknown' as AppId, 'window-1');
      // Should not throw or cause issues
    });
  });

  describe('focusApp', () => {
    beforeEach(() => {
      manager.mountApp('terminal', 'window-1');
      manager.mountApp('terminal', 'window-2');
    });

    it('should update lastFocused window', () => {
      manager.focusApp('terminal', 'window-1');
      
      const appState = store.getAppState('terminal');
      expect(appState?.lastFocused).toBe('window-1');
    });

    it('should emit focus event', () => {
      const listener = vi.fn();
      store.addEventListener('test', listener);
      
      manager.focusApp('terminal', 'window-1');
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'focus',
          appId: 'terminal',
          windowId: 'window-1',
        })
      );
    });

    it('should handle non-existent window gracefully', () => {
      manager.focusApp('terminal', 'non-existent');
      // Should not throw or cause issues
    });
  });

  describe('blurApp', () => {
    it('should emit blur event', () => {
      const listener = vi.fn();
      store.addEventListener('test', listener);
      
      manager.blurApp('terminal', 'window-1');
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'blur',
          appId: 'terminal',
          windowId: 'window-1',
        })
      );
    });
  });

  describe('activateApp', () => {
    it('should emit activate event', () => {
      const listener = vi.fn();
      store.addEventListener('test', listener);
      
      manager.activateApp('projects');
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'activate',
          appId: 'projects',
        })
      );
    });
  });

  describe('deactivateApp', () => {
    it('should emit deactivate event', () => {
      const listener = vi.fn();
      store.addEventListener('test', listener);
      
      manager.deactivateApp('projects');
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'deactivate',
          appId: 'projects',
        })
      );
    });
  });

  describe('event listeners', () => {
    it('should add and remove event listeners', () => {
      const listener = vi.fn();
      
      manager.addEventListener('test-listener', listener);
      manager.mountApp('projects', 'window-1');
      
      expect(listener).toHaveBeenCalled();
      
      listener.mockClear();
      manager.removeEventListener('test-listener');
      manager.mountApp('terminal', 'window-2');
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      manager.addEventListener('error-listener', errorListener);
      manager.mountApp('projects', 'window-1');
      
      expect(consoleSpy).toHaveBeenCalledWith('Error in app lifecycle listener:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('state queries', () => {
    beforeEach(() => {
      manager.mountApp('projects', 'window-1');
      manager.mountApp('terminal', 'window-2');
      manager.mountApp('terminal', 'window-3');
    });

    it('should check if app is running', () => {
      expect(manager.isAppRunning('projects')).toBe(true);
      expect(manager.isAppRunning('terminal')).toBe(true);
      expect(manager.isAppRunning('about')).toBe(false);
    });

    it('should get app state', () => {
      const projectsState = manager.getAppState('projects');
      expect(projectsState?.id).toBe('projects');
      expect(projectsState?.running).toBe(true);
      
      const unknownState = manager.getAppState('unknown' as AppId);
      expect(unknownState).toBeNull();
    });

    it('should get running apps', () => {
      const runningApps = manager.getRunningApps();
      expect(runningApps).toHaveLength(2);
      
      const appIds = runningApps.map(app => app.id);
      expect(appIds).toContain('projects');
      expect(appIds).toContain('terminal');
    });
  });

  describe('event history', () => {
    it('should maintain event history', () => {
      manager.mountApp('projects', 'window-1');
      manager.focusApp('projects', 'window-1');
      manager.unmountApp('projects', 'window-1');
      
      const currentState = useAppLifecycleStore.getState();
      const history = currentState.eventHistory;
      expect(history).toHaveLength(3);
      expect(history[0].type).toBe('mount');
      expect(history[1].type).toBe('focus');
      expect(history[2].type).toBe('unmount');
    });

    it('should limit event history to 100 events', () => {
      // Add more than 100 events
      for (let i = 0; i < 105; i++) {
        manager.mountApp('projects', `window-${i}`);
      }
      
      const currentState = useAppLifecycleStore.getState();
      const history = currentState.eventHistory;
      expect(history.length).toBeLessThanOrEqual(100);
    });

    it('should clear event history', () => {
      manager.mountApp('projects', 'window-1');
      const stateAfterMount = useAppLifecycleStore.getState();
      expect(stateAfterMount.eventHistory).toHaveLength(1);
      
      stateAfterMount.clearEventHistory();
      const stateAfterClear = useAppLifecycleStore.getState();
      expect(stateAfterClear.eventHistory).toHaveLength(0);
    });
  });
});