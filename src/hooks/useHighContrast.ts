import { useEffect, useState } from 'react';
import { usePreferencesStore } from '../store';

export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const { highContrast, updatePreferences } = usePreferencesStore();

  useEffect(() => {
    // Check system high contrast preference
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const checkHighContrast = () => {
      const systemHighContrast = mediaQuery.matches;
      const userHighContrast = highContrast;
      setIsHighContrast(userHighContrast ?? systemHighContrast);
    };

    checkHighContrast();
    mediaQuery.addEventListener('change', checkHighContrast);

    return () => mediaQuery.removeEventListener('change', checkHighContrast);
  }, [highContrast]);

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  const toggleHighContrast = () => {
    updatePreferences({ highContrast: !isHighContrast });
  };

  return {
    isHighContrast,
    toggleHighContrast,
  };
};
