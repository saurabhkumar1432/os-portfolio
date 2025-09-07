import { describe, it, expect } from 'vitest';
import { appUtils } from '../index';

describe('appUtils', () => {
  describe('getDefaultAppConfig', () => {
    it('should return config for projects app', () => {
      const config = appUtils.getDefaultAppConfig('projects');

      expect(config).toEqual({
        name: 'Projects',
        icon: 'folder',
        defaultSize: { width: 900, height: 600 },
        minSize: { width: 600, height: 400 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      });
    });

    it('should return config for file-explorer app', () => {
      const config = appUtils.getDefaultAppConfig('file-explorer');

      expect(config).toEqual({
        name: 'File Explorer',
        icon: 'folder-open',
        defaultSize: { width: 800, height: 500 },
        minSize: { width: 500, height: 350 },
        resizable: true,
        maximizable: true,
        multiInstance: true,
      });
    });

    it('should return config for terminal app', () => {
      const config = appUtils.getDefaultAppConfig('terminal');

      expect(config).toEqual({
        name: 'Terminal',
        icon: 'terminal',
        defaultSize: { width: 700, height: 400 },
        minSize: { width: 400, height: 250 },
        resizable: true,
        maximizable: true,
        multiInstance: true,
      });
    });

    it('should return config for about app', () => {
      const config = appUtils.getDefaultAppConfig('about');

      expect(config).toEqual({
        name: 'About',
        icon: 'user',
        defaultSize: { width: 600, height: 500 },
        minSize: { width: 400, height: 350 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      });
    });

    it('should return config for notepad app', () => {
      const config = appUtils.getDefaultAppConfig('notepad');

      expect(config).toEqual({
        name: 'Notepad',
        icon: 'file-text',
        defaultSize: { width: 600, height: 400 },
        minSize: { width: 400, height: 300 },
        resizable: true,
        maximizable: true,
        multiInstance: true,
      });
    });

    it('should return config for settings app', () => {
      const config = appUtils.getDefaultAppConfig('settings');

      expect(config).toEqual({
        name: 'Settings',
        icon: 'settings',
        defaultSize: { width: 500, height: 600 },
        minSize: { width: 400, height: 500 },
        resizable: true,
        maximizable: false,
        multiInstance: false,
      });
    });

    it('should return config for resume-viewer app', () => {
      const config = appUtils.getDefaultAppConfig('resume-viewer');

      expect(config).toEqual({
        name: 'Resume',
        icon: 'file',
        defaultSize: { width: 800, height: 900 },
        minSize: { width: 600, height: 700 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      });
    });
  });
});