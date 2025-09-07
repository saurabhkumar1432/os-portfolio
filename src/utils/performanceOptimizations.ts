/**
 * Performance monitoring and optimization utilities
 */
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private observers = new Map<string, PerformanceObserver>();
  private metrics = new Map<string, number[]>();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Monitor component render performance
   */
  monitorComponent(componentName: string): void {
    if (!this.observers.has(componentName)) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntriesByType('measure');
        entries.forEach((entry) => {
          if (entry.name.includes(componentName)) {
            this.recordMetric(componentName, entry.duration);
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });
      this.observers.set(componentName, observer);
    }
  }

  /**
   * Record performance metric
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(value);

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Log performance warnings
    if (value > 16.67) { // > 60fps threshold
      console.warn(`Performance warning: ${name} took ${value.toFixed(2)}ms`);
    }
  }

  /**
   * Get performance statistics
   */
  getStats(name: string): { avg: number; max: number; min: number } | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;

    return {
      avg: metrics.reduce((sum, val) => sum + val, 0) / metrics.length,
      max: Math.max(...metrics),
      min: Math.min(...metrics),
    };
  }

  /**
   * Optimize images with lazy loading and format selection
   */
  optimizeImage(src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  } = {}): string {
    const { width, height, quality = 80, format = 'auto' } = options;

    // Check browser support for modern formats
    const supportsWebP = this.checkWebPSupport();
    const supportsAVIF = this.checkAVIFSupport();

    let optimizedSrc = src;

    // Add format optimization
    if (format === 'auto') {
      if (supportsAVIF) {
        optimizedSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.avif');
      } else if (supportsWebP) {
        optimizedSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      }
    }

    // Add resize parameters if supported
    if (width || height) {
      const params = new URLSearchParams();
      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      params.set('q', quality.toString());

      optimizedSrc += `?${params.toString()}`;
    }

    return optimizedSrc;
  }

  private checkWebPSupport(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  private checkAVIFSupport(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    try {
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch {
      return false;
    }
  }

  /**
   * Cleanup performance monitoring
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();
