import { useEffect } from 'react';
import { usePreferencesStore } from '../store/preferencesStore';

/**
 * Hook to apply reduce motion preference to the document
 */
export const useReduceMotion = () => {
  const { reduceMotion } = usePreferencesStore();

  useEffect(() => {
    const root = document.documentElement;
    
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    return () => {
      root.classList.remove('reduce-motion');
    };
  }, [reduceMotion]);

  // Also listen for system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => {
      const root = document.documentElement;
      
      // Only apply system preference if user hasn't explicitly set a preference
      if (mediaQuery.matches && !reduceMotion) {
        root.classList.add('reduce-motion');
      } else if (!reduceMotion) {
        root.classList.remove('reduce-motion');
      }
    };

    // Initial check
    handleChange();

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [reduceMotion]);

  return reduceMotion;
};