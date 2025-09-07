import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSnapZones } from '../useSnapZones';

// Mock window dimensions
const mockWindowDimensions = {
  innerWidth: 1920,
  innerHeight: 1080,
};

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: mockWindowDimensions.innerWidth,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: mockWindowDimensions.innerHeight,
});

describe('useSnapZones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when enabled', () => {
    it('should return snap zones with correct bounds', () => {
      const { result } = renderHook(() => useSnapZones({ enabled: true }));

      expect(result.current.snapZones).toHaveLength(3);
      
      // Check left snap zone
      const leftZone = result.current.snapZones.find(z => z.id === 'left');
      expect(leftZone).toBeDefined();
      expect(leftZone?.bounds).toEqual({
        x: 0,
        y: 0,
        w: 960, // Half of 1920
        h: 1032, // 1080 - 48 (taskbar)
      });

      // Check right snap zone
      const rightZone = result.current.snapZones.find(z => z.id === 'right');
      expect(rightZone).toBeDefined();
      expect(rightZone?.bounds).toEqual({
        x: 960,
        y: 0,
        w: 960,
        h: 1032,
      });

      // Check maximize zone
      const maximizeZone = result.current.snapZones.find(z => z.id === 'maximize');
      expect(maximizeZone).toBeDefined();
      expect(maximizeZone?.bounds).toEqual({
        x: 0,
        y: 0,
        w: 1920,
        h: 1032,
      });
    });

    it('should detect active snap zone based on cursor position', () => {
      const { result } = renderHook(() => useSnapZones({ enabled: true }));

      // Test left edge detection
      expect(result.current.getActiveSnapZone(10, 500)).toBe('left');
      
      // Test right edge detection
      expect(result.current.getActiveSnapZone(1910, 500)).toBe('right');
      
      // Test top edge detection (maximize)
      expect(result.current.getActiveSnapZone(960, 5)).toBe('maximize');
      
      // Test no snap zone
      expect(result.current.getActiveSnapZone(960, 500)).toBeNull();
    });

    it('should return correct snap bounds for zone ID', () => {
      const { result } = renderHook(() => useSnapZones({ enabled: true }));

      const leftBounds = result.current.getSnapBounds('left');
      expect(leftBounds).toEqual({
        x: 0,
        y: 0,
        w: 960,
        h: 1032,
      });

      const rightBounds = result.current.getSnapBounds('right');
      expect(rightBounds).toEqual({
        x: 960,
        y: 0,
        w: 960,
        h: 1032,
      });

      const maximizeBounds = result.current.getSnapBounds('maximize');
      expect(maximizeBounds).toEqual({
        x: 0,
        y: 0,
        w: 1920,
        h: 1032,
      });
    });

    it('should return null for invalid zone ID', () => {
      const { result } = renderHook(() => useSnapZones({ enabled: true }));

      expect(result.current.getSnapBounds('invalid')).toBeNull();
    });

    it('should mark all zones as active when enabled', () => {
      const { result } = renderHook(() => useSnapZones({ enabled: true }));

      result.current.snapZones.forEach(zone => {
        expect(zone.active).toBe(true);
      });
    });
  });

  describe('when disabled', () => {
    it('should return empty snap zones array', () => {
      const { result } = renderHook(() => useSnapZones({ enabled: false }));

      expect(result.current.snapZones).toEqual([]);
    });

    it('should return null for active snap zone detection', () => {
      const { result } = renderHook(() => useSnapZones({ enabled: false }));

      expect(result.current.getActiveSnapZone(10, 500)).toBeNull();
      expect(result.current.getActiveSnapZone(1910, 500)).toBeNull();
      expect(result.current.getActiveSnapZone(960, 5)).toBeNull();
    });

    it('should return null for snap bounds', () => {
      const { result } = renderHook(() => useSnapZones({ enabled: false }));

      expect(result.current.getSnapBounds('left')).toBeNull();
      expect(result.current.getSnapBounds('right')).toBeNull();
      expect(result.current.getSnapBounds('maximize')).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle cursor at exact trigger boundaries', () => {
      const { result } = renderHook(() => useSnapZones({ enabled: true }));

      // Test exact left edge
      expect(result.current.getActiveSnapZone(0, 500)).toBe('left');
      expect(result.current.getActiveSnapZone(20, 500)).toBe('left');
      expect(result.current.getActiveSnapZone(21, 500)).toBeNull();

      // Test exact right edge
      expect(result.current.getActiveSnapZone(1900, 500)).toBe('right');
      expect(result.current.getActiveSnapZone(1920, 500)).toBe('right');

      // Test exact top edge
      expect(result.current.getActiveSnapZone(960, 0)).toBe('maximize');
      expect(result.current.getActiveSnapZone(960, 10)).toBe('maximize');
      expect(result.current.getActiveSnapZone(960, 11)).toBeNull();
    });

    it('should handle taskbar area correctly', () => {
      const { result } = renderHook(() => useSnapZones({ enabled: true }));

      // Cursor in taskbar area should not trigger left/right snap
      expect(result.current.getActiveSnapZone(10, 1050)).toBeNull();
      expect(result.current.getActiveSnapZone(1910, 1050)).toBeNull();
    });
  });
});