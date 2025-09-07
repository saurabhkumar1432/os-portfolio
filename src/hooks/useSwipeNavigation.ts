import { useCallback } from 'react';
import { useWindowStore } from '../store/windowStore';
import { useResponsive } from './useResponsive';
import { useTouchGestures, type SwipeGesture } from './useTouchGestures';

interface SwipeNavigationOptions {
  enabled?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export const useSwipeNavigation = (options: SwipeNavigationOptions = {}) => {
  const { enabled = true } = options;
  const { windows, zOrder, focusWindow } = useWindowStore();
  const { isMobile } = useResponsive();

  // Get visible windows in order
  const visibleWindows = zOrder
    .map(id => windows[id])
    .filter(window => window && !window.minimized);

  const currentWindowIndex = visibleWindows.findIndex(window => window.focused);

  const switchToNextWindow = useCallback(() => {
    if (visibleWindows.length <= 1) return;
    
    const nextIndex = (currentWindowIndex + 1) % visibleWindows.length;
    const nextWindow = visibleWindows[nextIndex];
    
    if (nextWindow) {
      focusWindow(nextWindow.id);
    }
  }, [visibleWindows, currentWindowIndex, focusWindow]);

  const switchToPreviousWindow = useCallback(() => {
    if (visibleWindows.length <= 1) return;
    
    const prevIndex = currentWindowIndex === 0 
      ? visibleWindows.length - 1 
      : currentWindowIndex - 1;
    const prevWindow = visibleWindows[prevIndex];
    
    if (prevWindow) {
      focusWindow(prevWindow.id);
    }
  }, [visibleWindows, currentWindowIndex, focusWindow]);

  const handleSwipe = useCallback((gesture: SwipeGesture) => {
    if (!enabled || !isMobile) return;

    switch (gesture.direction) {
      case 'left':
        if (options.onSwipeLeft) {
          options.onSwipeLeft();
        } else {
          // Default: switch to next window
          switchToNextWindow();
        }
        break;
      case 'right':
        if (options.onSwipeRight) {
          options.onSwipeRight();
        } else {
          // Default: switch to previous window
          switchToPreviousWindow();
        }
        break;
      case 'up':
        options.onSwipeUp?.();
        break;
      case 'down':
        options.onSwipeDown?.();
        break;
    }
  }, [
    enabled,
    isMobile,
    options,
    switchToNextWindow,
    switchToPreviousWindow,
  ]);

  const { attachListeners } = useTouchGestures({
    onSwipe: handleSwipe,
  }, {
    swipeThreshold: 100, // Require longer swipe for navigation
    swipeVelocityThreshold: 0.5, // Require faster swipe
  });

  return {
    attachListeners,
    switchToNextWindow,
    switchToPreviousWindow,
    canSwipeNext: visibleWindows.length > 1,
    canSwipePrevious: visibleWindows.length > 1,
    currentWindowIndex,
    totalWindows: visibleWindows.length,
  };
};