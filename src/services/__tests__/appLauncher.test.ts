import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppLauncher } from '../appLauncher';
import { appRegistry } from '../appRegistry';
import { appLifecycleManager } from '../appLifecycleManager';
import { useWindowStore } from '../../store/windowStore';
import type { AppId, BaseApp } from '../../types';

// Mock dependencies
vi.mock('../appRegistry');
vi.mock('../appLifecycleManager');
vi.mock('../../store/windowStore');

const mockAppRegistry = vi.mocked(appRegistry);
const mockAppLifecycleManager = vi.mocked(appLifecycleManager);
const mockWindowStore = vi.mocked(useWindowStore);

describe('AppLauncher', () => {
  let launcher: AppLauncher;
  let mockGetState: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    launcher = AppLauncher.getInstance();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup window store mock
    mockGetState = vi.fn();
    mockWindowStore.getState = mockGetState;
    
    // Default window store state
    mockGetState.mockReturnValue({
      windows: {},
      createWindow: vi.fn().mockReturnValue('window-123'),
      focusWindow: vi.fn(),
      requestCloseWindow: vi.fn().mockResolvedValue(true),
      closeWindow: vi.fn(),
      getWindowsByApp: vi.fn().mockReturnValue([]),
    });
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AppLauncher.getInstance();
      const instance2 = AppLauncher.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('launchApp', () => {
    const mockApp: BaseApp = {
      id: 'projects',
      name: 'Projects',
      icon: 'FolderOpen',
      component: () => null,
      defaultSize: { width: 900, height: 700 },
      minSize: { width: 400, height: 300 },
      resizable: true,
      maximizable: true,
      multiInstance: false,
    };

    beforeEach(() => {
      mockAppRegistry.getApp.mockReturnValue(mockApp);
    });

    it('should launch new app successfully', async () => {
      const result = await launcher.launchApp('projects');
      
      expect(result.success).toBe(true);
      expect(result.windowId).toBe('window-123');
      expect(result.existingWindow).toBe(false);
      
      expect(mockGetState().createWindow).toHaveBeenCalledWith('projects', expect.any(Object));
      expect(mockAppLifecycleManager.mountApp).toHaveBeenCalledWith('projects', 'window-123');
      expect(mockAppLifecycleManager.activateApp).toHaveBeenCalledWith('projects');
    });

    it('should return error for unknown app', async () => {
      mockAppRegistry.getApp.mockReturnValue(undefined);
      
      const result = await launcher.launchApp('unknown' as AppId);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found in registry');
    });

    it('should focus existing window for single-instance app', async () => {
      const existingWindow = { id: 'existing-window', appId: 'projects' };
      mockGetState().getWindowsByApp.mockReturnValue([existingWindow]);
      
      const result = await launcher.launchApp('projects');
      
      expect(result.success).toBe(true);
      expect(result.windowId).toBe('existing-window');
      expect(result.existingWindow).toBe(true);
      
      expect(mockGetState().focusWindow).toHaveBeenCalledWith('existing-window');
      expect(mockAppLifecycleManager.focusApp).toHaveBeenCalledWith('projects', 'existing-window');
    });

    it('should create new window for multi-instance app even if existing', async () => {
      const multiInstanceApp = { ...mockApp, multiInstance: true };
      mockAppRegistry.getApp.mockReturnValue(multiInstanceApp);
      
      const existingWindow = { id: 'existing-window', appId: 'terminal' };
      mockGetState().getWindowsByApp.mockReturnValue([existingWindow]);
      
      const result = await launcher.launchApp('terminal');
      
      expect(result.success).toBe(true);
      expect(result.windowId).toBe('window-123');
      expect(result.existingWindow).toBe(false);
      
      expect(mockGetState().createWindow).toHaveBeenCalled();
    });

    it('should use custom window options', async () => {
      const customOptions = {
        windowOptions: {
          bounds: { x: 200, y: 150, w: 800, h: 600 },
          title: 'Custom Title',
        },
      };
      
      await launcher.launchApp('projects', customOptions);
      
      expect(mockGetState().createWindow).toHaveBeenCalledWith('projects', 
        expect.objectContaining({
          title: 'Custom Title',
          bounds: expect.objectContaining({
            x: 200,
            y: 150,
            w: 800,
            h: 600,
          }),
        })
      );
    });

    it('should handle launch errors gracefully', async () => {
      mockGetState().createWindow.mockImplementation(() => {
        throw new Error('Window creation failed');
      });
      
      const result = await launcher.launchApp('projects');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Window creation failed');
    });
  });

  describe('closeApp', () => {
    beforeEach(() => {
      mockGetState().windows = {
        'window-123': { id: 'window-123', appId: 'projects' },
      };
    });

    it('should close app successfully', async () => {
      const result = await launcher.closeApp('window-123');
      
      expect(result).toBe(true);
      expect(mockGetState().requestCloseWindow).toHaveBeenCalledWith('window-123');
      expect(mockAppLifecycleManager.unmountApp).toHaveBeenCalledWith('projects', 'window-123');
    });

    it('should force close when requested', async () => {
      mockGetState().requestCloseWindow.mockResolvedValue(false);
      
      const result = await launcher.closeApp('window-123', true);
      
      expect(result).toBe(true);
      expect(mockGetState().closeWindow).toHaveBeenCalledWith('window-123', true);
    });

    it('should return false for non-existent window', async () => {
      const result = await launcher.closeApp('non-existent');
      
      expect(result).toBe(false);
    });

    it('should return false when close is prevented', async () => {
      mockGetState().requestCloseWindow.mockResolvedValue(false);
      
      const result = await launcher.closeApp('window-123', false);
      
      expect(result).toBe(false);
    });

    it('should deactivate app when last window is closed', async () => {
      mockGetState().getWindowsByApp.mockReturnValue([]);
      
      await launcher.closeApp('window-123');
      
      expect(mockAppLifecycleManager.deactivateApp).toHaveBeenCalledWith('projects');
    });
  });

  describe('focusApp', () => {
    beforeEach(() => {
      mockGetState().windows = {
        'window-123': { id: 'window-123', appId: 'projects' },
      };
    });

    it('should focus app window', () => {
      launcher.focusApp('window-123');
      
      expect(mockGetState().focusWindow).toHaveBeenCalledWith('window-123');
      expect(mockAppLifecycleManager.focusApp).toHaveBeenCalledWith('projects', 'window-123');
    });

    it('should handle non-existent window gracefully', () => {
      launcher.focusApp('non-existent');
      
      expect(mockGetState().focusWindow).not.toHaveBeenCalled();
      expect(mockAppLifecycleManager.focusApp).not.toHaveBeenCalled();
    });
  });

  describe('getRunningApps', () => {
    it('should return running apps information', () => {
      const mockRunningApps = [
        { id: 'projects', windows: ['window-1'], lastFocused: 'window-1' },
        { id: 'terminal', windows: ['window-2', 'window-3'], lastFocused: 'window-3' },
      ];
      
      mockAppLifecycleManager.getRunningApps.mockReturnValue(mockRunningApps as any);
      
      const result = launcher.getRunningApps();
      
      expect(result).toEqual([
        { appId: 'projects', windowCount: 1, lastFocused: 'window-1' },
        { appId: 'terminal', windowCount: 2, lastFocused: 'window-3' },
      ]);
    });
  });

  describe('canLaunchApp', () => {
    it('should return true for registered apps', () => {
      mockAppRegistry.hasApp.mockReturnValue(true);
      
      const result = launcher.canLaunchApp('projects');
      
      expect(result).toBe(true);
      expect(mockAppRegistry.hasApp).toHaveBeenCalledWith('projects');
    });

    it('should return false for unregistered apps', () => {
      mockAppRegistry.hasApp.mockReturnValue(false);
      
      const result = launcher.canLaunchApp('unknown' as AppId);
      
      expect(result).toBe(false);
    });
  });

  describe('getAppInfo', () => {
    it('should return app information', () => {
      const mockApp = { id: 'projects', name: 'Projects' };
      mockAppRegistry.getApp.mockReturnValue(mockApp as any);
      
      const result = launcher.getAppInfo('projects');
      
      expect(result).toBe(mockApp);
      expect(mockAppRegistry.getApp).toHaveBeenCalledWith('projects');
    });
  });

  describe('launch methods', () => {
    const mockApp: BaseApp = {
      id: 'projects',
      name: 'Projects',
      icon: 'FolderOpen',
      component: () => null,
      defaultSize: { width: 900, height: 700 },
      minSize: { width: 400, height: 300 },
      resizable: true,
      maximizable: true,
      multiInstance: false,
    };

    beforeEach(() => {
      mockAppRegistry.getApp.mockReturnValue(mockApp);
    });

    describe('launchAppFromDesktop', () => {
      it('should launch with focusExisting: true', async () => {
        const launchSpy = vi.spyOn(launcher, 'launchApp');
        
        await launcher.launchAppFromDesktop('projects');
        
        expect(launchSpy).toHaveBeenCalledWith('projects', { focusExisting: true });
      });
    });

    describe('launchAppFromStartMenu', () => {
      it('should focus existing for single-instance apps', async () => {
        const launchSpy = vi.spyOn(launcher, 'launchApp');
        
        await launcher.launchAppFromStartMenu('projects');
        
        expect(launchSpy).toHaveBeenCalledWith('projects', { focusExisting: true });
      });

      it('should not focus existing for multi-instance apps', async () => {
        const multiInstanceApp = { ...mockApp, multiInstance: true };
        mockAppRegistry.getApp.mockReturnValue(multiInstanceApp);
        
        const launchSpy = vi.spyOn(launcher, 'launchApp');
        
        await launcher.launchAppFromStartMenu('terminal');
        
        expect(launchSpy).toHaveBeenCalledWith('terminal', { focusExisting: false });
      });
    });

    describe('launchAppWithData', () => {
      it('should launch with data and focusExisting: false', async () => {
        const launchSpy = vi.spyOn(launcher, 'launchApp');
        const data = { projectId: '123' };
        
        await launcher.launchAppWithData('projects', data);
        
        expect(launchSpy).toHaveBeenCalledWith('projects', { 
          data, 
          focusExisting: false 
        });
      });
    });
  });
});