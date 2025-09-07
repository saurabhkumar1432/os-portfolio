/**
 * Performance monitoring utilities for tracking bundle sizes,
 * load times, and runtime performance metrics
 */

interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

interface ChunkLoadMetrics {
  chunkName: string;
  loadTime: number;
  size: number;
  cached: boolean;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private chunkMetrics: ChunkLoadMetrics[] = [];
  private performanceObserver?: PerformanceObserver;

  private constructor() {
    this.initializeObservers();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if ('PerformanceObserver' in window) {
      // Observe navigation timing
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      try {
        this.performanceObserver.observe({ 
          entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] 
        });
      } catch (error) {
        console.warn('Performance observer not fully supported:', error);
      }
    }

    // Monitor chunk loading
    this.monitorChunkLoading();
  }

  /**
   * Process performance entries
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        this.handleNavigationTiming(entry as PerformanceNavigationTiming);
        break;
      case 'paint':
        this.handlePaintTiming(entry as PerformancePaintTiming);
        break;
      case 'largest-contentful-paint':
        this.handleLCPTiming(entry);
        break;
      case 'layout-shift':
        this.handleLayoutShift(entry);
        break;
      case 'first-input':
        this.handleFirstInputDelay(entry);
        break;
    }
  }

  /**
   * Handle navigation timing
   */
  private handleNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      totalLoadTime: entry.loadEventEnd - entry.fetchStart,
      dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
      tcpConnection: entry.connectEnd - entry.connectStart,
      serverResponse: entry.responseEnd - entry.requestStart,
    };

    this.logMetrics('Navigation Timing', metrics);
  }

  /**
   * Handle paint timing
   */
  private handlePaintTiming(entry: PerformancePaintTiming): void {
    if (entry.name === 'first-contentful-paint') {
      this.logMetrics('First Contentful Paint', { time: entry.startTime });
    }
  }

  /**
   * Handle Largest Contentful Paint
   */
  private handleLCPTiming(entry: PerformanceEntry): void {
    this.logMetrics('Largest Contentful Paint', { time: entry.startTime });
  }

  /**
   * Handle layout shift
   */
  private handleLayoutShift(entry: any): void {
    if (!entry.hadRecentInput) {
      this.logMetrics('Layout Shift', { value: entry.value });
    }
  }

  /**
   * Handle first input delay
   */
  private handleFirstInputDelay(entry: any): void {
    this.logMetrics('First Input Delay', { delay: entry.processingStart - entry.startTime });
  }

  /**
   * Monitor chunk loading performance
   */
  private monitorChunkLoading(): void {
    // Override dynamic import to track chunk loading
    const vitePreload = (window as any).__vitePreload;
    const originalImport = vitePreload || (() => Promise.resolve());
    
    if (typeof originalImport === 'function') {
      (window as any).__vitePreload = async (preloadDeps: string[], importerUrl?: string) => {
        const startTime = performance.now();
        
        try {
          const result = await originalImport(preloadDeps, importerUrl);
          const endTime = performance.now();
          
          preloadDeps.forEach(dep => {
            this.chunkMetrics.push({
              chunkName: dep,
              loadTime: endTime - startTime,
              size: 0, // Size would need to be tracked separately
              cached: false // Would need cache detection
            });
          });
          
          return result;
        } catch (error) {
          console.error('Chunk loading failed:', error);
          throw error;
        }
      };
    }
  }

  /**
   * Measure bundle size impact
   */
  public measureBundleSize(): Promise<number> {
    return new Promise((resolve) => {
      // Use Resource Timing API to estimate bundle size
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let totalSize = 0;

      resources.forEach(resource => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          totalSize += resource.transferSize || 0;
        }
      });

      resolve(totalSize);
    });
  }

  /**
   * Get Web Vitals metrics
   */
  public async getWebVitals(): Promise<Partial<PerformanceMetrics>> {
    const metrics: Partial<PerformanceMetrics> = {};

    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      metrics.firstContentfulPaint = fcpEntry.startTime;
    }

    // Bundle size
    metrics.bundleSize = await this.measureBundleSize();

    return metrics;
  }

  /**
   * Get chunk loading performance
   */
  public getChunkMetrics(): ChunkLoadMetrics[] {
    return [...this.chunkMetrics];
  }

  /**
   * Log performance metrics
   */
  private logMetrics(category: string, metrics: Record<string, number>): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚀 Performance: ${category}`);
      Object.entries(metrics).forEach(([key, value]) => {
        console.log(`${key}: ${value.toFixed(2)}ms`);
      });
      console.groupEnd();
    }
  }

  /**
   * Generate performance report
   */
  public async generateReport(): Promise<{
    webVitals: Partial<PerformanceMetrics>;
    chunkMetrics: ChunkLoadMetrics[];
    recommendations: string[];
  }> {
    const webVitals = await this.getWebVitals();
    const chunkMetrics = this.getChunkMetrics();
    const recommendations = this.generateRecommendations(webVitals, chunkMetrics);

    return {
      webVitals,
      chunkMetrics,
      recommendations
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    webVitals: Partial<PerformanceMetrics>, 
    chunkMetrics: ChunkLoadMetrics[]
  ): string[] {
    const recommendations: string[] = [];

    // Check FCP
    if (webVitals.firstContentfulPaint && webVitals.firstContentfulPaint > 1800) {
      recommendations.push('First Contentful Paint is slow. Consider reducing initial bundle size.');
    }

    // Check bundle size
    if (webVitals.bundleSize && webVitals.bundleSize > 250000) {
      recommendations.push('Bundle size is large. Consider more aggressive code splitting.');
    }

    // Check chunk loading
    const slowChunks = chunkMetrics.filter(chunk => chunk.loadTime > 1000);
    if (slowChunks.length > 0) {
      recommendations.push(`${slowChunks.length} chunks are loading slowly. Consider preloading or optimization.`);
    }

    return recommendations;
  }

  /**
   * Clean up observers
   */
  public destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  // Generate report after page load
  window.addEventListener('load', () => {
    setTimeout(async () => {
      const report = await performanceMonitor.generateReport();
      console.log('📊 Performance Report:', report);
    }, 2000);
  });
}