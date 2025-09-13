import { useCallback, useRef } from 'react';
import { useWindowStore } from '../store/windowStore';
import type { ResizeState } from '../types';

interface UseResizeOptions {
  windowId: string;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

interface ResizeHandlers {
  onMouseDown: (handle: ResizeState['handle']) => (e: React.MouseEvent) => void;
  onTouchStart: (handle: ResizeState['handle']) => (e: React.TouchEvent) => void;
}

const MIN_WIDTH = 320;
const MIN_HEIGHT = 240;

export const useResize = ({ windowId, onResizeStart, onResizeEnd }: UseResizeOptions): ResizeHandlers => {
  const { windows, setResizeState, updateWindowBounds } = useWindowStore();
  const resizeStateRef = useRef<ResizeState | null>(null);
  const isResizingRef = useRef(false);

  const getViewportConstraints = useCallback(() => {
    // Dynamically calculate taskbar height based on responsive state
    const isMobile = window.innerWidth < 768;
    const taskbarHeight = isMobile ? 0 : 48; // No taskbar on mobile, 48px on desktop
    return {
      minX: 0,
      minY: 0,
      maxX: window.innerWidth,
      maxY: window.innerHeight - taskbarHeight,
    };
  }, []);

  const calculateNewBounds = useCallback((
    handle: ResizeState['handle'],
    startBounds: { x: number; y: number; w: number; h: number },
    deltaX: number,
    deltaY: number
  ) => {
    const constraints = getViewportConstraints();
    let newBounds = { ...startBounds };

    switch (handle) {
      case 'n': // North (top edge)
        newBounds.h = Math.max(MIN_HEIGHT, startBounds.h - deltaY);
        newBounds.y = Math.max(constraints.minY, Math.min(
          startBounds.y + deltaY,
          startBounds.y + startBounds.h - MIN_HEIGHT
        ));
        break;

      case 's': // South (bottom edge)
        newBounds.h = Math.max(MIN_HEIGHT, startBounds.h + deltaY);
        // Ensure window doesn't go below taskbar
        if (newBounds.y + newBounds.h > constraints.maxY) {
          newBounds.h = constraints.maxY - newBounds.y;
        }
        break;

      case 'e': // East (right edge)
        newBounds.w = Math.max(MIN_WIDTH, startBounds.w + deltaX);
        // Ensure window doesn't go beyond viewport
        if (newBounds.x + newBounds.w > constraints.maxX) {
          newBounds.w = constraints.maxX - newBounds.x;
        }
        break;

      case 'w': // West (left edge)
        newBounds.w = Math.max(MIN_WIDTH, startBounds.w - deltaX);
        newBounds.x = Math.max(constraints.minX, Math.min(
          startBounds.x + deltaX,
          startBounds.x + startBounds.w - MIN_WIDTH
        ));
        break;

      case 'ne': // Northeast (top-right corner)
        newBounds.w = Math.max(MIN_WIDTH, startBounds.w + deltaX);
        newBounds.h = Math.max(MIN_HEIGHT, startBounds.h - deltaY);
        newBounds.y = Math.max(constraints.minY, Math.min(
          startBounds.y + deltaY,
          startBounds.y + startBounds.h - MIN_HEIGHT
        ));
        // Ensure window doesn't go beyond viewport
        if (newBounds.x + newBounds.w > constraints.maxX) {
          newBounds.w = constraints.maxX - newBounds.x;
        }
        break;

      case 'nw': // Northwest (top-left corner)
        newBounds.w = Math.max(MIN_WIDTH, startBounds.w - deltaX);
        newBounds.h = Math.max(MIN_HEIGHT, startBounds.h - deltaY);
        newBounds.x = Math.max(constraints.minX, Math.min(
          startBounds.x + deltaX,
          startBounds.x + startBounds.w - MIN_WIDTH
        ));
        newBounds.y = Math.max(constraints.minY, Math.min(
          startBounds.y + deltaY,
          startBounds.y + startBounds.h - MIN_HEIGHT
        ));
        break;

      case 'se': // Southeast (bottom-right corner)
        newBounds.w = Math.max(MIN_WIDTH, startBounds.w + deltaX);
        newBounds.h = Math.max(MIN_HEIGHT, startBounds.h + deltaY);
        // Ensure window doesn't go beyond viewport
        if (newBounds.x + newBounds.w > constraints.maxX) {
          newBounds.w = constraints.maxX - newBounds.x;
        }
        if (newBounds.y + newBounds.h > constraints.maxY) {
          newBounds.h = constraints.maxY - newBounds.y;
        }
        break;

      case 'sw': // Southwest (bottom-left corner)
        newBounds.w = Math.max(MIN_WIDTH, startBounds.w - deltaX);
        newBounds.h = Math.max(MIN_HEIGHT, startBounds.h + deltaY);
        newBounds.x = Math.max(constraints.minX, Math.min(
          startBounds.x + deltaX,
          startBounds.x + startBounds.w - MIN_WIDTH
        ));
        // Ensure window doesn't go below taskbar
        if (newBounds.y + newBounds.h > constraints.maxY) {
          newBounds.h = constraints.maxY - newBounds.y;
        }
        break;
    }

    return newBounds;
  }, [getViewportConstraints]);

  const startResize = useCallback((handle: ResizeState['handle'], clientX: number, clientY: number) => {
    const window = windows[windowId];
    if (!window || window.maximized) return;

    const resizeState: ResizeState = {
      windowId,
      handle,
      startBounds: { ...window.bounds },
      startPosition: { x: clientX, y: clientY },
    };

    resizeStateRef.current = resizeState;
    isResizingRef.current = true;
    setResizeState(resizeState);
    onResizeStart?.();

    // Add global event listeners
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !resizeStateRef.current) return;

      e.preventDefault();
      
      const deltaX = e.clientX - resizeStateRef.current.startPosition.x;
      const deltaY = e.clientY - resizeStateRef.current.startPosition.y;
      
      const newBounds = calculateNewBounds(
        resizeStateRef.current.handle,
        resizeStateRef.current.startBounds,
        deltaX,
        deltaY
      );

      updateWindowBounds(windowId, newBounds);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizingRef.current || !resizeStateRef.current || e.touches.length === 0) return;

      e.preventDefault();
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - resizeStateRef.current.startPosition.x;
      const deltaY = touch.clientY - resizeStateRef.current.startPosition.y;
      
      const newBounds = calculateNewBounds(
        resizeStateRef.current.handle,
        resizeStateRef.current.startBounds,
        deltaX,
        deltaY
      );

      updateWindowBounds(windowId, newBounds);
    };

    const handleEnd = () => {
      if (!isResizingRef.current) return;

      isResizingRef.current = false;
      resizeStateRef.current = null;
      setResizeState(null);
      onResizeEnd?.();

      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isResizingRef.current) {
        // Cancel resize and restore original bounds
        if (resizeStateRef.current) {
          updateWindowBounds(windowId, resizeStateRef.current.startBounds);
        }
        handleEnd();
      }
    };

    const handleEndWithKeyCleanup = () => {
      document.removeEventListener('keydown', handleKeyDown);
      handleEnd();
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleEndWithKeyCleanup);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEndWithKeyCleanup);
    document.addEventListener('touchcancel', handleEndWithKeyCleanup);
    document.addEventListener('keydown', handleKeyDown);
  }, [windowId, windows, setResizeState, updateWindowBounds, calculateNewBounds, onResizeStart, onResizeEnd]);

  const handleMouseDown = useCallback((handle: ResizeState['handle']) => (e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    startResize(handle, e.clientX, e.clientY);
  }, [startResize]);

  const handleTouchStart = useCallback((handle: ResizeState['handle']) => (e: React.TouchEvent) => {
    // Only handle single touch
    if (e.touches.length !== 1) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    startResize(handle, touch.clientX, touch.clientY);
  }, [startResize]);

  return {
    onMouseDown: handleMouseDown,
    onTouchStart: handleTouchStart,
  };
};