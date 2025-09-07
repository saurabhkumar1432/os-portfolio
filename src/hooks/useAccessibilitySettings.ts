import { useEffect, useState, useCallback } from 'react';
import { usePreferencesStore } from '../store/preferencesStore';

/**
 * Hook to apply accessibility settings to the document
 */
export const useAccessibilitySettings = () => {
  const { 
    highContrast,
    largeText,
    reduceMotion,
    focusIndicators,
    screenReaderOptimized,
    updatePreferences 
  } = usePreferencesStore();
  const [announceQueue, setAnnounceQueue] = useState<string[]>([]);
  
  // High contrast support
  const [isHighContrast, setIsHighContrast] = useState(highContrast);
  
  // Large text support
  const [isLargeText, setIsLargeText] = useState(largeText);
  
  // Reduced motion (already exists but enhanced)
  const isReducedMotion = reduceMotion;

  useEffect(() => {
    // Check system preferences and apply system classes regardless of user settings
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateSystemPreferences = () => {
      // Always apply system classes when system preferences are detected
      if (highContrastQuery.matches) {
        document.documentElement.classList.add('system-high-contrast');
      } else {
        document.documentElement.classList.remove('system-high-contrast');
      }
      
      if (reducedMotionQuery.matches) {
        document.documentElement.classList.add('system-reduce-motion');
      } else {
        document.documentElement.classList.remove('system-reduce-motion');
      }
      
      // Only update preferences if they are undefined (first time detection)
      if (highContrast === undefined) {
        setIsHighContrast(highContrastQuery.matches);
      }
      
      if (reduceMotion === undefined) {
        updatePreferences({ reduceMotion: reducedMotionQuery.matches });
      }
    };

    updateSystemPreferences();
    
    highContrastQuery.addEventListener('change', updateSystemPreferences);
    reducedMotionQuery.addEventListener('change', updateSystemPreferences);
    
    return () => {
      highContrastQuery.removeEventListener('change', updateSystemPreferences);
      reducedMotionQuery.removeEventListener('change', updateSystemPreferences);
    };
  }, [highContrast, reduceMotion, updatePreferences]);

  useEffect(() => {
    // Apply high contrast
    const shouldUseHighContrast = highContrast ?? isHighContrast;
    if (shouldUseHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast, isHighContrast]);

  useEffect(() => {
    // Apply large text scaling
    const shouldUseLargeText = largeText ?? isLargeText;
    if (shouldUseLargeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  }, [largeText, isLargeText]);

  useEffect(() => {
    // Apply enhanced focus indicators
    if (focusIndicators) {
      document.documentElement.classList.add('enhanced-focus');
    } else {
      document.documentElement.classList.remove('enhanced-focus');
    }
  }, [focusIndicators]);

  useEffect(() => {
    // Apply screen reader optimizations
    if (screenReaderOptimized) {
      document.documentElement.classList.add('screen-reader-optimized');
    } else {
      document.documentElement.classList.remove('screen-reader-optimized');
    }
  }, [screenReaderOptimized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove(
        'high-contrast',
        'large-text',
        'enhanced-focus',
        'screen-reader-optimized'
      );
    };
  }, []);

  // Screen reader announcements
  const announceToScreenReader = useCallback((message: string) => {
    setAnnounceQueue(prev => [...prev, message]);
    
    // Create a temporary live region for the announcement
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
      setAnnounceQueue(prev => prev.filter(msg => msg !== message));
    }, 1000);
  }, []);

  const toggleHighContrast = () => {
    const newValue = !(highContrast ?? isHighContrast);
    updatePreferences({ highContrast: newValue });
    setIsHighContrast(newValue);
  };

  const toggleLargeText = () => {
    const newValue = !(largeText ?? isLargeText);
    updatePreferences({ largeText: newValue });
    setIsLargeText(newValue);
  };

  const toggleReducedMotion = () => {
    updatePreferences({ reduceMotion: !isReducedMotion });
  };

  return {
    // Match test expectations for property names
    highContrast: highContrast ?? isHighContrast,
    largeText: largeText ?? isLargeText,
    focusIndicators: focusIndicators ?? false,
    screenReaderOptimized: screenReaderOptimized ?? false,
    // Keep additional functionality
    isHighContrast: highContrast ?? isHighContrast,
    isLargeText: largeText ?? isLargeText,
    isReducedMotion,
    announceToScreenReader,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
    announceQueue,
  };
};