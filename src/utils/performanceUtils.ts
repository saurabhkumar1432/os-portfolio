/**
 * Performance monitoring and optimization utilities
 */

export interface PerformanceMetrics {
  memoryUsage?: number;
  renderTime?: number;
  bundleSize?: number;
  networkLatency?: number;
}

export interface PerformanceSettings {
  enableAnimations: boolean;
  enableSounds: boolean;
  enableParticles: boolean;
  enableBlur: boolean;
  maxConcurrentWindows: number;
  imageQuality: 'low' | 'medium' | 'high';
}

/**
 * Get current memory usage if available
 */
export const getMemoryUsage = (): number | undefined => {
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
  }
  return undefined;
};

/**
 * Measure render time for a component
 */
export const measureRenderTime = (name: string, fn: () => void): number => {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Render time for ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return duration;
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if device is low-end based on various metrics
 */
export const isLowEndDevice = (): boolean => {
  // Check memory - use heap size directly for more accurate testing
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    const memoryMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    if (memoryMB > 100) return true; // More than 100MB used indicates potential memory pressure
  }
  
  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }
  
  // Check connection speed
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
      return true;
    }
  }
  
  return false;
};

/**
 * Get recommended performance settings based on device capabilities
 */
export const getRecommendedPerformanceSettings = (): Partial<PerformanceSettings> => {
  const isLowEnd = isLowEndDevice();
  
  if (isLowEnd) {
    return {
      enableAnimations: false,
      enableSounds: false,
      enableParticles: false,
      enableBlur: false,
      maxConcurrentWindows: 3,
      imageQuality: 'low',
    };
  }
  
  return {
    enableAnimations: true,
    enableSounds: true,
    enableParticles: true,
    enableBlur: true,
    maxConcurrentWindows: 10,
    imageQuality: 'high',
  };
};

/**
 * Monitor performance and suggest optimizations
 */
export const getPerformanceRecommendations = (): string[] => {
  const recommendations: string[] = [];
  
  // Check memory usage directly
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    const memoryMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    if (memoryMB > 150) {
      recommendations.push('Consider reducing the number of open windows to improve memory usage');
    }
  }
  
  if (isLowEndDevice()) {
    recommendations.push('Disable animations and visual effects for better performance');
    recommendations.push('Use lower image quality settings');
  }
  
  // Check if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    recommendations.push('System preference detected: Consider enabling reduced motion');
  }
  
  return recommendations;
};