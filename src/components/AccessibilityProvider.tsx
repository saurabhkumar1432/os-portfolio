import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { useWindowStore } from '../store/windowStore';
import { useStartMenuStore } from '../store/startMenuStore';

interface AccessibilityContextValue {
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  setAriaLabel: (elementId: string, label: string) => void;
  setAriaDescription: (elementId: string, description: string) => void;
  registerFocusableElement: ReturnType<typeof useFocusManagement>['registerFocusableElement'];
  unregisterFocusableElement: ReturnType<typeof useFocusManagement>['unregisterFocusableElement'];
  focusElement: ReturnType<typeof useFocusManagement>['focusElement'];
  isReducedMotion: boolean;
  isHighContrast: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages accessibility features for the desktop OS
 */
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [ariaLabels, setAriaLabels] = useState<Map<string, string>>(new Map());
  const [ariaDescriptions, setAriaDescriptions] = useState<Map<string, string>>(new Map());
  
  // Use the state variables to prevent TypeScript warnings
  void ariaLabels;
  void ariaDescriptions;
  
  const windowStore = useWindowStore();
  const startMenuStore = useStartMenuStore();
  
  const focusManagement = useFocusManagement({
    enabled: true,
    restoreFocus: true,
  });

  // Detect user preferences
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleMotionChange);

    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(contrastQuery.matches);
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };
    
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Create live region for announcements
  useEffect(() => {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'accessibility-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(liveRegion);

    return () => {
      document.body.removeChild(liveRegion);
    };
  }, []);

  // Announce messages to screen readers
  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = document.getElementById('accessibility-live-region');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;
      
      // Clear the message after a short delay to allow for re-announcements
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

  // Set ARIA label for an element
  const setAriaLabel = (elementId: string, label: string) => {
    setAriaLabels(prev => new Map(prev).set(elementId, label));
    
    // Apply to DOM element if it exists
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('aria-label', label);
    }
  };

  // Set ARIA description for an element
  const setAriaDescription = (elementId: string, description: string) => {
    setAriaDescriptions(prev => new Map(prev).set(elementId, description));
    
    // Apply to DOM element if it exists
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('aria-describedby', `${elementId}-description`);
      
      // Create or update description element
      let descElement = document.getElementById(`${elementId}-description`);
      if (!descElement) {
        descElement = document.createElement('div');
        descElement.id = `${elementId}-description`;
        descElement.className = 'sr-only';
        element.parentNode?.appendChild(descElement);
      }
      descElement.textContent = description;
    }
  };

  // Announce window state changes
  useEffect(() => {
    const focusedWindow = windowStore.getFocusedWindow();
    if (focusedWindow) {
      const appName = focusedWindow.title || focusedWindow.appId;
      
      if (focusedWindow.maximized) {
        announceMessage(`${appName} window maximized`);
      } else if (focusedWindow.minimized) {
        announceMessage(`${appName} window minimized`);
      } else {
        announceMessage(`${appName} window focused`);
      }
    }
  }, [windowStore.windows]);

  // Announce start menu state changes
  useEffect(() => {
    if (startMenuStore.isOpen) {
      announceMessage('Start menu opened');
    } else {
      announceMessage('Start menu closed');
    }
  }, [startMenuStore.isOpen]);

  // Apply accessibility attributes to body
  useEffect(() => {
    document.body.setAttribute('role', 'application');
    document.body.setAttribute('aria-label', 'Portfolio OS Desktop');
    
    if (isReducedMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
    
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isReducedMotion, isHighContrast]);

  const contextValue: AccessibilityContextValue = {
    announceMessage,
    setAriaLabel,
    setAriaDescription,
    registerFocusableElement: focusManagement.registerFocusableElement,
    unregisterFocusableElement: focusManagement.unregisterFocusableElement,
    focusElement: focusManagement.focusElement,
    isReducedMotion,
    isHighContrast,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

/**
 * Hook to access accessibility context
 */
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};