import React from 'react';
import { useHighContrast } from '../hooks/useHighContrast';
import { useAccessibilitySettings } from '../hooks';
import { Contrast, Type, Eye } from 'lucide-react';

export const AccessibilityToolbar: React.FC = () => {
  const { isHighContrast, toggleHighContrast } = useHighContrast();
  const { 
    isLargeText, 
    toggleLargeText,
    isReducedMotion,
    toggleReducedMotion,
    announceToScreenReader 
  } = useAccessibilitySettings();

  const handleHighContrastToggle = () => {
    toggleHighContrast();
    announceToScreenReader(
      isHighContrast ? 'High contrast disabled' : 'High contrast enabled'
    );
  };

  const handleLargeTextToggle = () => {
    toggleLargeText();
    announceToScreenReader(
      isLargeText ? 'Large text disabled' : 'Large text enabled'
    );
  };

  const handleReducedMotionToggle = () => {
    toggleReducedMotion();
    announceToScreenReader(
      isReducedMotion ? 'Animations enabled' : 'Animations reduced'
    );
  };

  return (
    <div 
      className="fixed top-4 right-4 z-[9998] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg"
      role="toolbar"
      aria-label="Accessibility tools"
      data-testid="accessibility-toolbar"
    >
      <div className="flex gap-2">
        <button
          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          onClick={handleHighContrastToggle}
          aria-pressed={isHighContrast}
          aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast`}
          data-testid="high-contrast-toggle"
        >
          <Contrast className="h-4 w-4" />
        </button>
        
        <button
          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          onClick={handleLargeTextToggle}
          aria-pressed={isLargeText}
          aria-label={`${isLargeText ? 'Disable' : 'Enable'} large text`}
          data-testid="large-text-toggle"
        >
          <Type className="h-4 w-4" />
        </button>
        
        <button
          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          onClick={handleReducedMotionToggle}
          aria-pressed={isReducedMotion}
          aria-label={`${isReducedMotion ? 'Enable' : 'Reduce'} animations`}
          data-testid="reduced-motion-toggle"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
