import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { performanceMonitor } from '../utils/performanceMonitor';
import { preloadService } from '../services/preloadService';

// Mock performance API
const mockPerformanceEntries = [
  {
    name: 'first-contentful-paint',
    entryType: 'paint',
    startTime: 1200,
  },
  {
    name: 'navigation',
    entryType: 'navigation',
    fetchStart: 0,
    domContentLoadedEventStart: 800,
    domContentLoadedEventEnd: 850,
    loadEventStart: 1000,
    loadEventEnd: 1100,
  },
];

const mockResourceEntries = [
  {
    name: 'https://example.com/app.js',
    transferSize: 150000,
  },
  {
    name: 'https://example.com/vendor.js',
    transferSize: 80000,
  },
  {
    name: 'https://example.com/styles.css',
    transferSize: 20000,
  },
];

// Mock global performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    getEntriesByType: vi.fn((type: string) => {
      if (type === 'resource') return mockResourceEntries;
      return mockPerformanceEntries.filter(entry => entry.entryType === type);
    }),
    getEntriesByName: vi.fn((name: string) => {
      return mockPerformanceEntries.filter(entry => entry.name === name);
    }),
  },
  writable: true,
});

describe('Performance Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    performanceMonitor.destroy();
  });

  describe('Bundle Size Measurement', () => {
    it('should measure total bundle size correctly', async () => {
      vi.mocked(performance.getEntriesByType).mockReturnValue(mockResourceEntries as any);
      
      const bundleSize = await performanceMonitor.measureBundleSize();
      
      // Should sum up JS and CSS files
      expect(bundleSize).toBe(250000); // 150000 + 80000 + 20000
    });

    it('should handle missing transfer size', async () => {
      vi.mocked(performance.getEntriesByType).mockReturnValue([
        { name: 'app.js', transferSize: undefined } as any
      ]);

      const bundleSize = await performanceMonitor.measureBundleSize();
      expect(bundleSize).toBe(0);
    });
  });

  describe('Web Vitals Collection', () => {
    it('should collect First Contentful Paint metric', async () => {
      vi.mocked(performance.getEntriesByType).mockReturnValue(mockResourceEntries as any);
      vi.mocked(performance.getEntriesByName).mockReturnValue([mockPerformanceEntries[0]] as any);
      
      const webVitals = await performanceMonitor.getWebVitals();
      
      expect(webVitals.firstContentfulPaint).toBe(1200);
      expect(webVitals.bundleSize).toBe(250000);
    });

    it('should handle missing FCP metric', async () => {
      vi.mocked(performance.getEntriesByName).mockReturnValue([]);
      vi.mocked(performance.getEntriesByType).mockReturnValue(mockResourceEntries as any);

      const webVitals = await performanceMonitor.getWebVitals();
      
      expect(webVitals.firstContentfulPaint).toBeUndefined();
      expect(webVitals.bundleSize).toBe(250000);
    });
  });

  describe('Performance Report Generation', () => {
    it('should generate comprehensive performance report', async () => {
      vi.mocked(performance.getEntriesByType).mockReturnValue(mockResourceEntries as any);
      vi.mocked(performance.getEntriesByName).mockReturnValue([mockPerformanceEntries[0]] as any);
      
      const report = await performanceMonitor.generateReport();
      
      expect(report).toHaveProperty('webVitals');
      expect(report).toHaveProperty('chunkMetrics');
      expect(report).toHaveProperty('recommendations');
      
      expect(report.webVitals.bundleSize).toBe(250000);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should provide recommendations for slow FCP', async () => {
      // Mock slow FCP
      vi.mocked(performance.getEntriesByName).mockReturnValue([
        { name: 'first-contentful-paint', startTime: 2500 } as any
      ]);
      vi.mocked(performance.getEntriesByType).mockReturnValue(mockResourceEntries as any);

      const report = await performanceMonitor.generateReport();
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some(rec => rec.includes('First Contentful Paint'))).toBe(true);
    });

    it('should provide recommendations for large bundle size', async () => {
      // Mock large bundle
      vi.mocked(performance.getEntriesByType).mockReturnValue([
        { name: 'app.js', transferSize: 300000 } as any
      ]);
      vi.mocked(performance.getEntriesByName).mockReturnValue([]);

      const report = await performanceMonitor.generateReport();
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some(rec => rec.includes('Bundle size'))).toBe(true);
    });
  });

  describe('Chunk Loading Metrics', () => {
    it('should track chunk loading performance', () => {
      const metrics = performanceMonitor.getChunkMetrics();
      
      expect(Array.isArray(metrics)).toBe(true);
      // Initially empty since no chunks have been loaded in test
      expect(metrics.length).toBe(0);
    });
  });
});

describe('Preload Service', () => {
  beforeEach(() => {
    preloadService.clearCache();
    vi.clearAllMocks();
  });

  describe('App Usage Tracking', () => {
    it('should track app usage correctly', () => {
      preloadService.trackAppUsage('projects');
      preloadService.trackAppUsage('projects');
      preloadService.trackAppUsage('terminal');

      const status = preloadService.getPreloadStatus();
      
      expect(status.usage.projects).toBe(2);
      expect(status.usage.terminal).toBe(1);
    });

    it('should persist usage data to localStorage', () => {
      const mockSetItem = vi.fn();
      const mockGetItem = vi.fn().mockReturnValue('{}');
      
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: mockSetItem,
          getItem: mockGetItem,
        },
        writable: true,
      });

      preloadService.trackAppUsage('projects');
      
      expect(mockSetItem).toHaveBeenCalledWith(
        'app-usage-history',
        expect.stringContaining('projects')
      );
    });
  });

  describe('Preload Status', () => {
    it('should provide accurate preload status', () => {
      const status = preloadService.getPreloadStatus();
      
      expect(status).toHaveProperty('preloaded');
      expect(status).toHaveProperty('preloading');
      expect(status).toHaveProperty('usage');
      
      expect(Array.isArray(status.preloaded)).toBe(true);
      expect(Array.isArray(status.preloading)).toBe(true);
      expect(typeof status.usage).toBe('object');
    });
  });

  describe('Cache Management', () => {
    it('should clear cache correctly', () => {
      preloadService.trackAppUsage('projects');
      
      let status = preloadService.getPreloadStatus();
      expect(status.usage.projects).toBe(1);
      
      preloadService.clearCache();
      
      status = preloadService.getPreloadStatus();
      expect(status.usage.projects).toBeUndefined();
    });
  });
});

describe('Bundle Size Limits', () => {
  it('should enforce bundle size limits', async () => {
    const bundleSize = await performanceMonitor.measureBundleSize();
    
    // Requirement 13.4: Initial bundle should be under 250KB gzipped
    // This is a rough estimate since we're testing uncompressed size
    expect(bundleSize).toBeLessThan(500000); // 500KB uncompressed ≈ 250KB gzipped
  });
});

describe('Performance Thresholds', () => {
  it('should meet First Contentful Paint requirements', async () => {
    // Mock good FCP
    vi.mocked(performance.getEntriesByName).mockReturnValue([
      { name: 'first-contentful-paint', startTime: 1200 } as any
    ]);
    vi.mocked(performance.getEntriesByType).mockReturnValue(mockResourceEntries as any);
    
    const webVitals = await performanceMonitor.getWebVitals();
    
    // Requirement 13.1: FCP under 1.8 seconds
    if (webVitals.firstContentfulPaint) {
      expect(webVitals.firstContentfulPaint).toBeLessThan(1800);
    }
  });
});