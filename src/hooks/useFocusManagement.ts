import { useEffect, useCallback, useRef, useState } from 'react';
import { useWindowStore } from '../store/windowStore';
import { useStartMenuStore } from '../store/startMenuStore';

interface FocusableElement {
  id: string;
  element: HTMLElement;
  type: 'desktop-icon' | 'window' | 'taskbar-button' | 'start-menu-item';
  priority: number; // Lower numbers = higher priority
}

interface UseFocusManagementOptions {
  enabled?: boolean;
  trapFocus?: boolean;
  restoreFocus?: boolean;
}

/**
 * Hook for managing focus order and keyboard navigation throughout the desktop OS
 */
export const useFocusManagement = (options: UseFocusManagementOptions = {}) => {
  const { enabled = true, trapFocus = false, restoreFocus = true } = options;
  const focusableElementsRef = useRef<Map<string, FocusableElement>>(new Map());
  const [currentFocusId, setCurrentFocusId] = useState<string | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const windowStore = useWindowStore();
  const startMenuStore = useStartMenuStore();

  // Register a focusable element
  const registerFocusableElement = useCallback((
    id: string,
    element: HTMLElement,
    type: FocusableElement['type'],
    priority: number = 0
  ) => {
    if (!enabled) return;

    focusableElementsRef.current.set(id, {
      id,
      element,
      type,
      priority,
    });

    // Add focus event listeners
    const handleFocus = () => {
      setCurrentFocusId(id);
      lastFocusedElementRef.current = element;
    };

    const handleBlur = () => {
      // Clear focus when element loses focus
      setCurrentFocusId(null);
    };

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    // Cleanup function
    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
      focusableElementsRef.current.delete(id);
    };
  }, [enabled, currentFocusId]);

  // Unregister a focusable element
  const unregisterFocusableElement = useCallback((id: string) => {
    focusableElementsRef.current.delete(id);
    if (currentFocusId === id) {
      setCurrentFocusId(null);
    }
  }, [currentFocusId]);

  // Get all focusable elements in tab order
  const getFocusableElements = useCallback((): FocusableElement[] => {
    const elements = Array.from(focusableElementsRef.current.values());
    
    // Filter out elements that are not visible or disabled
    const visibleElements = elements.filter(({ element, type, id }) => {
      // Check if element is visible and not disabled
      if (element.style.display === 'none' || 
          element.hasAttribute('disabled') ||
          element.getAttribute('aria-hidden') === 'true') {
        return false;
      }

      // Special handling for windows - only include focused or visible windows
      if (type === 'window') {
        const windowState = windowStore.windows[id];
        return windowState && !windowState.minimized;
      }

      // Special handling for start menu items - only include if start menu is open
      if (type === 'start-menu-item') {
        return startMenuStore.isOpen;
      }

      return true;
    });

    // Sort by priority (lower numbers first), then by type
    return visibleElements.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Type-based ordering: desktop-icons -> taskbar -> windows -> start-menu
      const typeOrder = {
        'desktop-icon': 0,
        'taskbar-button': 1,
        'window': 2,
        'start-menu-item': 3,
      };
      
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }, [windowStore.windows, startMenuStore.isOpen]);

  // Focus the next element in tab order
  const focusNext = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const currentIndex = currentFocusId 
      ? elements.findIndex(el => el.id === currentFocusId)
      : -1;
    
    const nextIndex = (currentIndex + 1) % elements.length;
    const nextElement = elements[nextIndex];
    
    if (nextElement) {
      nextElement.element.focus();
    }
  }, [currentFocusId, getFocusableElements]);

  // Focus the previous element in tab order
  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const currentIndex = currentFocusId 
      ? elements.findIndex(el => el.id === currentFocusId)
      : -1;
    
    const prevIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
    const prevElement = elements[prevIndex];
    
    if (prevElement) {
      prevElement.element.focus();
    }
  }, [currentFocusId, getFocusableElements]);

  // Focus a specific element by ID
  const focusElement = useCallback((id: string) => {
    const element = focusableElementsRef.current.get(id);
    if (element) {
      element.element.focus();
    }
  }, []);

  // Focus the first focusable element
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].element.focus();
    }
  }, [getFocusableElements]);

  // Focus the last focusable element
  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].element.focus();
    }
  }, [getFocusableElements]);

  // Restore focus to the last focused element
  const restoreFocusToLast = useCallback(() => {
    if (restoreFocus && lastFocusedElementRef.current) {
      try {
        lastFocusedElementRef.current.focus();
      } catch (error) {
        // Element might no longer be in DOM, focus first available element
        focusFirst();
      }
    }
  }, [restoreFocus, focusFirst]);

  // Handle keyboard navigation
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Handle Tab navigation
    if (event.key === 'Tab') {
      event.preventDefault();
      
      if (event.shiftKey) {
        focusPrevious();
      } else {
        focusNext();
      }
    }

    // Handle Arrow key navigation for desktop icons
    if (currentFocusId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      const currentElement = focusableElementsRef.current.get(currentFocusId);
      
      if (currentElement && currentElement.type === 'desktop-icon') {
        event.preventDefault();
        handleDesktopIconNavigation(event.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight');
      }
    }

    // Handle Escape key
    if (event.key === 'Escape') {
      // Close start menu if open
      if (startMenuStore.isOpen) {
        startMenuStore.setIsOpen(false);
        // Focus the start button
        const startButton = focusableElementsRef.current.get('start-button');
        if (startButton) {
          startButton.element.focus();
        }
      }
    }
  }, [enabled, currentFocusId, focusNext, focusPrevious, startMenuStore]);

  // Handle desktop icon arrow key navigation
  const handleDesktopIconNavigation = useCallback((direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') => {
    const desktopIcons = Array.from(focusableElementsRef.current.values())
      .filter(el => el.type === 'desktop-icon')
      .sort((a, b) => {
        // Sort by position for spatial navigation
        const aRect = a.element.getBoundingClientRect();
        const bRect = b.element.getBoundingClientRect();
        
        // Primary sort by Y position, secondary by X position
        if (Math.abs(aRect.top - bRect.top) < 10) {
          return aRect.left - bRect.left;
        }
        return aRect.top - bRect.top;
      });

    if (desktopIcons.length === 0) return;

    const currentIndex = currentFocusId 
      ? desktopIcons.findIndex(el => el.id === currentFocusId)
      : -1;

    if (currentIndex === -1) return;

    const currentRect = desktopIcons[currentIndex].element.getBoundingClientRect();
    let targetIndex = currentIndex;

    switch (direction) {
      case 'ArrowUp':
        // Find the closest icon above
        for (let i = currentIndex - 1; i >= 0; i--) {
          const rect = desktopIcons[i].element.getBoundingClientRect();
          if (rect.top < currentRect.top - 10) {
            targetIndex = i;
            break;
          }
        }
        break;
      
      case 'ArrowDown':
        // Find the closest icon below
        for (let i = currentIndex + 1; i < desktopIcons.length; i++) {
          const rect = desktopIcons[i].element.getBoundingClientRect();
          if (rect.top > currentRect.top + 10) {
            targetIndex = i;
            break;
          }
        }
        break;
      
      case 'ArrowLeft':
        // Find the closest icon to the left
        targetIndex = Math.max(0, currentIndex - 1);
        break;
      
      case 'ArrowRight':
        // Find the closest icon to the right
        targetIndex = Math.min(desktopIcons.length - 1, currentIndex + 1);
        break;
    }

    if (targetIndex !== currentIndex && desktopIcons[targetIndex]) {
      desktopIcons[targetIndex].element.focus();
    }
  }, [currentFocusId]);

  // Set up global keyboard event listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyboardNavigation);

    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
    };
  }, [enabled, handleKeyboardNavigation]);

  // Focus trap effect
  useEffect(() => {
    if (!trapFocus || !enabled) return;

    const handleFocusOut = (event: FocusEvent) => {
      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const target = event.target as HTMLElement;
      const isWithinFocusableElements = elements.some(el => 
        el.element === target || el.element.contains(target)
      );

      if (!isWithinFocusableElements) {
        // Focus escaped the trap, bring it back
        elements[0].element.focus();
      }
    };

    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [trapFocus, enabled, getFocusableElements]);

  return {
    registerFocusableElement,
    unregisterFocusableElement,
    focusNext,
    focusPrevious,
    focusElement,
    focusFirst,
    focusLast,
    restoreFocusToLast,
    currentFocusId,
    getFocusableElements,
  };
};