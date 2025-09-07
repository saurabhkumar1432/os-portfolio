import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getMemoryUsage,
  measureRenderTime,
  debounce,
  throttle,
  isLowEndDevice,
  getRecommendedPerformanceSettings,
  getPerformanceRecommendations,
} from '../utils/performanceUtils';

// Mock performance API
const mockPerformance = {
  now: vi.fn(),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
  },
};

// Mock navigator
const mockNavigator = {
  hardwareConcurrency: 8,
  connection: {
    effectiveType: '4g',
  },
};

describe('Performance Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock global performance
    Object.defineProperty(global, 'performance', {
      writable: true,
      value: mockPerformance,
    });
    
    // Mock global navigator
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: mockNavigator,
    });

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getMemoryUsage', () => {
    it('returns memory usage in MB when available', () => {
      const memory = getMemoryUsage();
      expect(memory).toBe(50); // 50MB
    });

    it('returns undefined when memory API is not available', () => {
      const performanceWithoutMemory = { now: vi.fn() };
      Object.defineProperty(global, 'performance', {
        writable: true,
        value: performanceWithoutMemory,
      });

      const memory = getMemoryUsage();
      expect(memory).toBeUndefined();
    });
  });

  describe('measureRenderTime', () => {
    it('measures and returns render time', () => {
      mockPerformance.now.mockReturnValueOnce(100).mockReturnValueOnce(150);
      
      const mockFn = vi.fn();
      const duration = measureRenderTime('test-component', mockFn);
      
      expect(mockFn).toHaveBeenCalled();
      expect(duration).toBe(50);
    });

    it('logs render time in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockPerformance.now.mockReturnValueOnce(100).mockReturnValueOnce(125);
      
      measureRenderTime('test-component', () => {});
      
      expect(consoleSpy).toHaveBeenCalledWith('Render time for test-component: 25.00ms');
      
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe('debounce', () => {
    it('debounces function calls', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');
      
      expect(mockFn).not.toHaveBeenCalled();
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });
  });

  describe('throttle', () => {
    it('throttles function calls', async () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);
      
      throttledFn('arg1');
      throttledFn('arg2');
      throttledFn('arg3');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg1');
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      throttledFn('arg4');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('arg4');
    });
  });

  describe('isLowEndDevice', () => {
    it('returns false for high-end device', () => {
      // Reset to high-end device settings
      mockPerformance.memory.usedJSHeapSize = 50 * 1024 * 1024; // 50MB
      Object.defineProperty(global, 'navigator', {
        writable: true,
        value: { ...mockNavigator, hardwareConcurrency: 8 },
      });
      
      expect(isLowEndDevice()).toBe(false);
    });

    it('returns true for low memory device', () => {
      mockPerformance.memory.usedJSHeapSize = 150 * 1024 * 1024; // 150MB
      expect(isLowEndDevice()).toBe(true);
    });

    it('returns true for low CPU device', () => {
      Object.defineProperty(global, 'navigator', {
        writable: true,
        value: { ...mockNavigator, hardwareConcurrency: 2 },
      });
      expect(isLowEndDevice()).toBe(true);
    });

    it('returns true for slow connection', () => {
      Object.defineProperty(global, 'navigator', {
        writable: true,
        value: {
          ...mockNavigator,
          connection: { effectiveType: '2g' },
        },
      });
      expect(isLowEndDevice()).toBe(true);
    });
  });

  describe('getRecommendedPerformanceSettings', () => {
    it('returns high performance settings for high-end device', () => {
      // Reset to high-end device settings
      mockPerformance.memory.usedJSHeapSize = 50 * 1024 * 1024; // 50MB
      Object.defineProperty(global, 'navigator', {
        writable: true,
        value: { 
          ...mockNavigator, 
          hardwareConcurrency: 8,
          connection: { effectiveType: '4g' }
        },
      });
      
      const settings = getRecommendedPerformanceSettings();
      
      expect(settings).toEqual({
        enableAnimations: true,
        enableSounds: true,
        enableParticles: true,
        enableBlur: true,
        maxConcurrentWindows: 10,
        imageQuality: 'high',
      });
    });

    it('returns low performance settings for low-end device', () => {
      mockPerformance.memory.usedJSHeapSize = 150 * 1024 * 1024; // 150MB
      
      const settings = getRecommendedPerformanceSettings();
      
      expect(settings).toEqual({
        enableAnimations: false,
        enableSounds: false,
        enableParticles: false,
        enableBlur: false,
        maxConcurrentWindows: 3,
        imageQuality: 'low',
      });
    });
  });

  describe('getPerformanceRecommendations', () => {
    it('returns memory recommendation for high memory usage', () => {
      mockPerformance.memory.usedJSHeapSize = 200 * 1024 * 1024; // 200MB
      
      const recommendations = getPerformanceRecommendations();
      
      expect(recommendations).toContain(
        'Consider reducing the number of open windows to improve memory usage'
      );
    });

    it('returns low-end device recommendations', () => {
      mockPerformance.memory.usedJSHeapSize = 150 * 1024 * 1024; // 150MB
      
      const recommendations = getPerformanceRecommendations();
      
      expect(recommendations).toContain(
        'Disable animations and visual effects for better performance'
      );
      expect(recommendations).toContain('Use lower image quality settings');
    });

    it('returns reduced motion recommendation when system prefers it', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockReturnValue({
          matches: true, // prefers-reduced-motion: reduce
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
      });
      
      const recommendations = getPerformanceRecommendations();
      
      expect(recommendations).toContain(
        'System preference detected: Consider enabling reduced motion'
      );
    });

    it('returns empty array for optimal conditions', () => {
      // Reset to optimal conditions
      mockPerformance.memory.usedJSHeapSize = 50 * 1024 * 1024; // 50MB
      Object.defineProperty(global, 'navigator', {
        writable: true,
        value: { 
          ...mockNavigator, 
          hardwareConcurrency: 8,
          connection: { effectiveType: '4g' }
        },
      });
      
      // Reset matchMedia to not prefer reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockReturnValue({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
      });
      
      const recommendations = getPerformanceRecommendations();
      
      expect(recommendations).toEqual([]);
    });
  });
});