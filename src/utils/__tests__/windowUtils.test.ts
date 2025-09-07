import { describe, it, expect } from 'vitest';
import { windowUtils, WINDOW_CONSTRAINTS } from '../index';
import type { WindowState } from '../../types';

describe('windowUtils', () => {
  describe('constrainWindowBounds', () => {
    const viewportWidth = 1920;
    const viewportHeight = 1080;

    it('should enforce minimum window size', () => {
      const bounds = { x: 100, y: 100, w: 200, h: 150 };
      const constrained = windowUtils.constrainWindowBounds(
        bounds,
        viewportWidth,
        viewportHeight
      );

      expect(constrained.w).toBe(WINDOW_CONSTRAINTS.MIN_WIDTH);
      expect(constrained.h).toBe(WINDOW_CONSTRAINTS.MIN_HEIGHT);
    });

    it('should keep window within viewport horizontally', () => {
      const bounds = { x: 1800, y: 100, w: 400, h: 300 };
      const constrained = windowUtils.constrainWindowBounds(
        bounds,
        viewportWidth,
        viewportHeight
      );

      expect(constrained.x).toBeLessThanOrEqual(viewportWidth - constrained.w);
      expect(constrained.x).toBeGreaterThanOrEqual(0);
    });

    it('should keep window within viewport vertically', () => {
      const bounds = { x: 100, y: 1000, w: 400, h: 300 };
      const constrained = windowUtils.constrainWindowBounds(
        bounds,
        viewportWidth,
        viewportHeight
      );

      const maxY = viewportHeight - constrained.h - WINDOW_CONSTRAINTS.TASKBAR_HEIGHT;
      expect(constrained.y).toBeLessThanOrEqual(maxY);
      expect(constrained.y).toBeGreaterThanOrEqual(0);
    });

    it('should handle negative positions', () => {
      const bounds = { x: -100, y: -50, w: 400, h: 300 };
      const constrained = windowUtils.constrainWindowBounds(
        bounds,
        viewportWidth,
        viewportHeight
      );

      expect(constrained.x).toBe(0);
      expect(constrained.y).toBe(0);
    });

    it('should preserve valid bounds', () => {
      const bounds = { x: 200, y: 150, w: 800, h: 600 };
      const constrained = windowUtils.constrainWindowBounds(
        bounds,
        viewportWidth,
        viewportHeight
      );

      expect(constrained).toEqual(bounds);
    });
  });

  describe('getDefaultWindowPosition', () => {
    it('should return base position for first window', () => {
      const position = windowUtils.getDefaultWindowPosition(
        [],
        { width: 800, height: 600 }
      );

      expect(position).toEqual({
        x: 100,
        y: 100,
        w: 800,
        h: 600,
      });
    });

    it('should cascade position for multiple windows', () => {
      const existingWindows: WindowState[] = [
        {
          id: 'window1',
          appId: 'projects',
          title: 'Projects',
          bounds: { x: 100, y: 100, w: 800, h: 600 },
          zIndex: 1,
          minimized: false,
          maximized: false,
          focused: false,
        },
        {
          id: 'window2',
          appId: 'terminal',
          title: 'Terminal',
          bounds: { x: 130, y: 130, w: 700, h: 400 },
          zIndex: 2,
          minimized: false,
          maximized: false,
          focused: true,
        },
      ];

      const position = windowUtils.getDefaultWindowPosition(
        existingWindows,
        { width: 600, height: 500 }
      );

      expect(position).toEqual({
        x: 160, // 100 + (2 * 30)
        y: 160, // 100 + (2 * 30)
        w: 600,
        h: 500,
      });
    });

    it('should reset cascade after 10 windows', () => {
      const existingWindows: WindowState[] = Array.from({ length: 10 }, (_, i) => ({
        id: `window${i}`,
        appId: 'terminal',
        title: 'Terminal',
        bounds: { x: 100 + i * 30, y: 100 + i * 30, w: 700, h: 400 },
        zIndex: i + 1,
        minimized: false,
        maximized: false,
        focused: i === 9,
      }));

      const position = windowUtils.getDefaultWindowPosition(
        existingWindows,
        { width: 600, height: 500 }
      );

      expect(position).toEqual({
        x: 100, // Reset to base position
        y: 100,
        w: 600,
        h: 500,
      });
    });
  });

  describe('getSnapBounds', () => {
    const viewportWidth = 1920;
    const viewportHeight = 1080;
    const availableHeight = viewportHeight - WINDOW_CONSTRAINTS.TASKBAR_HEIGHT;

    it('should return left snap bounds', () => {
      const bounds = windowUtils.getSnapBounds('left', viewportWidth, viewportHeight);

      expect(bounds).toEqual({
        x: 0,
        y: 0,
        w: 960, // Half of viewport width
        h: availableHeight,
      });
    });

    it('should return right snap bounds', () => {
      const bounds = windowUtils.getSnapBounds('right', viewportWidth, viewportHeight);

      expect(bounds).toEqual({
        x: 960, // Half of viewport width
        y: 0,
        w: 960,
        h: availableHeight,
      });
    });

    it('should return maximized bounds', () => {
      const bounds = windowUtils.getSnapBounds('maximized', viewportWidth, viewportHeight);

      expect(bounds).toEqual({
        x: 0,
        y: 0,
        w: viewportWidth,
        h: availableHeight,
      });
    });

    it('should throw error for invalid snap state', () => {
      expect(() => {
        windowUtils.getSnapBounds('invalid' as any, viewportWidth, viewportHeight);
      }).toThrow('Invalid snap state: invalid');
    });
  });

  describe('isPointInWindow', () => {
    const window: WindowState = {
      id: 'test-window',
      appId: 'projects',
      title: 'Test Window',
      bounds: { x: 100, y: 100, w: 400, h: 300 },
      zIndex: 1,
      minimized: false,
      maximized: false,
      focused: true,
    };

    it('should return true for point inside window', () => {
      const point = { x: 200, y: 200 };
      expect(windowUtils.isPointInWindow(point, window)).toBe(true);
    });

    it('should return true for point on window edge', () => {
      const point = { x: 100, y: 100 }; // Top-left corner
      expect(windowUtils.isPointInWindow(point, window)).toBe(true);

      const point2 = { x: 500, y: 400 }; // Bottom-right corner
      expect(windowUtils.isPointInWindow(point2, window)).toBe(true);
    });

    it('should return false for point outside window', () => {
      const point = { x: 50, y: 50 };
      expect(windowUtils.isPointInWindow(point, window)).toBe(false);

      const point2 = { x: 600, y: 500 };
      expect(windowUtils.isPointInWindow(point2, window)).toBe(false);
    });
  });

  describe('generateWindowId', () => {
    it('should generate unique IDs', () => {
      const id1 = windowUtils.generateWindowId('projects');
      const id2 = windowUtils.generateWindowId('projects');

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^projects-\d+-\w+$/);
      expect(id2).toMatch(/^projects-\d+-\w+$/);
    });

    it('should include app ID in generated ID', () => {
      const id = windowUtils.generateWindowId('terminal');
      expect(id).toMatch(/^terminal-/);
    });
  });

  describe('calculateZIndex', () => {
    it('should return correct z-index based on position in z-order', () => {
      const zOrder = ['window1', 'window2', 'window3'];

      expect(windowUtils.calculateZIndex('window1', zOrder)).toBe(1);
      expect(windowUtils.calculateZIndex('window2', zOrder)).toBe(2);
      expect(windowUtils.calculateZIndex('window3', zOrder)).toBe(3);
    });

    it('should return 1 for window not in z-order', () => {
      const zOrder = ['window1', 'window2'];
      expect(windowUtils.calculateZIndex('window3', zOrder)).toBe(1);
    });
  });
});