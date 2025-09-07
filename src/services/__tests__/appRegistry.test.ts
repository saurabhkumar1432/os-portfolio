import { describe, it, expect, beforeEach } from 'vitest';
import { AppRegistry } from '../appRegistry';
import type { BaseApp, AppId } from '../../types';

describe('AppRegistry', () => {
  let registry: AppRegistry;

  beforeEach(() => {
    // Get fresh instance for each test
    registry = AppRegistry.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AppRegistry.getInstance();
      const instance2 = AppRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getApp', () => {
    it('should return app configuration for valid app ID', () => {
      const app = registry.getApp('projects');
      expect(app).toBeDefined();
      expect(app?.id).toBe('projects');
      expect(app?.name).toBe('Projects');
    });

    it('should return undefined for invalid app ID', () => {
      const app = registry.getApp('invalid' as AppId);
      expect(app).toBeUndefined();
    });
  });

  describe('getAllApps', () => {
    it('should return all registered apps', () => {
      const apps = registry.getAllApps();
      expect(apps).toHaveLength(7); // All 7 apps should be registered
      
      const appIds = apps.map(app => app.id);
      expect(appIds).toContain('projects');
      expect(appIds).toContain('file-explorer');
      expect(appIds).toContain('terminal');
      expect(appIds).toContain('about');
      expect(appIds).toContain('notepad');
      expect(appIds).toContain('settings');
      expect(appIds).toContain('resume-viewer');
    });
  });

  describe('getMultiInstanceApps', () => {
    it('should return only apps that support multiple instances', () => {
      const multiInstanceApps = registry.getMultiInstanceApps();
      const multiInstanceIds = multiInstanceApps.map(app => app.id);
      
      expect(multiInstanceIds).toContain('file-explorer');
      expect(multiInstanceIds).toContain('terminal');
      expect(multiInstanceIds).toContain('notepad');
      
      // Single instance apps should not be included
      expect(multiInstanceIds).not.toContain('projects');
      expect(multiInstanceIds).not.toContain('about');
      expect(multiInstanceIds).not.toContain('settings');
      expect(multiInstanceIds).not.toContain('resume-viewer');
    });
  });

  describe('getSingleInstanceApps', () => {
    it('should return only apps that support single instance', () => {
      const singleInstanceApps = registry.getSingleInstanceApps();
      const singleInstanceIds = singleInstanceApps.map(app => app.id);
      
      expect(singleInstanceIds).toContain('projects');
      expect(singleInstanceIds).toContain('about');
      expect(singleInstanceIds).toContain('settings');
      expect(singleInstanceIds).toContain('resume-viewer');
      
      // Multi instance apps should not be included
      expect(singleInstanceIds).not.toContain('file-explorer');
      expect(singleInstanceIds).not.toContain('terminal');
      expect(singleInstanceIds).not.toContain('notepad');
    });
  });

  describe('hasApp', () => {
    it('should return true for registered apps', () => {
      expect(registry.hasApp('projects')).toBe(true);
      expect(registry.hasApp('terminal')).toBe(true);
    });

    it('should return false for unregistered apps', () => {
      expect(registry.hasApp('invalid' as AppId)).toBe(false);
    });
  });

  describe('registerApp', () => {
    it('should register new app', () => {
      const newApp: BaseApp = {
        id: 'test-app' as AppId,
        name: 'Test App',
        icon: 'Test',
        component: () => null,
        defaultSize: { width: 400, height: 300 },
        minSize: { width: 200, height: 150 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      };

      registry.registerApp(newApp);
      expect(registry.hasApp('test-app' as AppId)).toBe(true);
      expect(registry.getApp('test-app' as AppId)).toEqual(newApp);
    });
  });

  describe('unregisterApp', () => {
    it('should unregister existing app', () => {
      const newApp: BaseApp = {
        id: 'temp-app' as AppId,
        name: 'Temp App',
        icon: 'Temp',
        component: () => null,
        defaultSize: { width: 400, height: 300 },
        minSize: { width: 200, height: 150 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      };

      registry.registerApp(newApp);
      expect(registry.hasApp('temp-app' as AppId)).toBe(true);

      const result = registry.unregisterApp('temp-app' as AppId);
      expect(result).toBe(true);
      expect(registry.hasApp('temp-app' as AppId)).toBe(false);
    });

    it('should return false for non-existent app', () => {
      const result = registry.unregisterApp('non-existent' as AppId);
      expect(result).toBe(false);
    });
  });

  describe('getAppWindowConfig', () => {
    it('should return window configuration for valid app', () => {
      const config = registry.getAppWindowConfig('projects');
      expect(config).toBeDefined();
      expect(config?.defaultSize).toEqual({ width: 900, height: 700 });
      expect(config?.minSize).toEqual({ width: 400, height: 300 });
      expect(config?.resizable).toBe(true);
      expect(config?.maximizable).toBe(true);
    });

    it('should return null for invalid app', () => {
      const config = registry.getAppWindowConfig('invalid' as AppId);
      expect(config).toBeNull();
    });
  });

  describe('app configurations', () => {
    it('should have correct configuration for projects app', () => {
      const app = registry.getApp('projects');
      expect(app).toMatchObject({
        id: 'projects',
        name: 'Projects',
        icon: 'FolderOpen',
        defaultSize: { width: 900, height: 700 },
        minSize: { width: 400, height: 300 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      });
    });

    it('should have correct configuration for terminal app', () => {
      const app = registry.getApp('terminal');
      expect(app).toMatchObject({
        id: 'terminal',
        name: 'Terminal',
        icon: 'Terminal',
        defaultSize: { width: 700, height: 500 },
        minSize: { width: 400, height: 200 },
        resizable: true,
        maximizable: true,
        multiInstance: true,
      });
    });
  });
});