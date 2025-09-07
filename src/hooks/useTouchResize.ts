import { useRef, useCallback } from 'react';
import { useWindowStore } from '../store/windowStore';
import { useResponsive } from './useResponsive';
import { useTouchGestures } from './useTouchGestures';
import type { WindowState, ResizeState } from '../types';

interface TouchResizeOptions {
  windowId: string;
  handle: ResizeState['handle'];
  enabled?: boolean;
  minWidth?: number;
  minHeight?: number;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

export const useTouchResize = ({ 
  windowId, 
  handle, 
  enabled = true, 
  minWidth = 320, 
  minHeight = 240,
  onResizeStart,
  onResizeEnd 
}: TouchResizeOptions) => {
  const { updateWindowBounds, setResizeState } = useWindowStore();
  const { isMobile, screenWidth, screenHeight } = useResponsive();
  const isResizingRef = useRef(false);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);
  const startBoundsRef = useRef<WindowState['bounds'] | null>(null);

  const calculateNewBounds = useCallback((
    startBounds: WindowState['bounds'],
    deltaX: number,
    deltaY: number,
    handle: ResizeState['handle']
  ): Partial<WindowState['bounds']> => {
    const newBounds: Partial<WindowState['bounds']> = {};

    switch (handle) {
      case 'n':
        newBounds.y = Math.max(0, startBounds.y + deltaY);
        newBounds.h = Math.max(minHeight, startBounds.h - deltaY);
        break;
      case 's':
        newBounds.h = Math.max(minHeight, Math.min(screenHeight - startBounds.y, startBounds.h + deltaY));
        break;
      case 'e':
        newBounds.w = Math.max(minWidth, Math.min(screenWidth - startBounds.x, startBounds.w + deltaX));
        break;
      case 'w':
        newBounds.x = Math.max(0, startBounds.x + deltaX);
        newBounds.w = Math.max(minWidth, startBounds.w - deltaX);
        break;
      case 'ne':
        newBounds.y = Math.max(0, startBounds.y + deltaY);
        newBounds.h = Math.max(minHeight, startBounds.h - deltaY);
        newBounds.w = Math.max(minWidth, Math.min(screenWidth - startBounds.x, startBounds.w + deltaX));
        break;
      case 'nw':
        newBounds.x = Math.max(0, startBounds.x + deltaX);
        newBounds.y = Math.max(0, startBounds.y + deltaY);
        newBounds.w = Math.max(minWidth, startBounds.w - deltaX);
        newBounds.h = Math.max(minHeight, startBounds.h - deltaY);
        break;
      case 'se':
        newBounds.w = Math.max(minWidth, Math.min(screenWidth - startBounds.x, startBounds.w + deltaX));
        newBounds.h = Math.max(minHeight, Math.min(screenHeight - startBounds.y, startBounds.h + deltaY));
        break;
      case 'sw':
        newBounds.x = Math.max(0, startBounds.x + deltaX);
        newBounds.w = Math.max(minWidth, startBounds.w - deltaX);
        newBounds.h = Math.max(minHeight, Math.min(screenHeight - startBounds.y, startBounds.h + deltaY));
        break;
    }

    return newBounds;
  }, [minWidth, minHeight, screenWidth, screenHeight]);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled || !isMobile) return;

    const touch = event.touches[0];
    if (!touch) return;

    const window = useWindowStore.getState().windows[windowId];
    if (!window) return;

    isResizingRef.current = true;
    startPositionRef.current = { x: touch.clientX, y: touch.clientY };
    startBoundsRef.current = { ...window.bounds };

    setResizeState({
      windowId,
      handle,
      startBounds: startBoundsRef.current,
      startPosition: startPositionRef.current,
    });

    onResizeStart?.();

    // Prevent default to avoid scrolling
    event.preventDefault();
  }, [enabled, isMobile, windowId, handle, setResizeState, onResizeStart]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isResizingRef.current || !startPositionRef.current || !startBoundsRef.current) return;

    const touch = event.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - startPositionRef.current.x;
    const deltaY = touch.clientY - startPositionRef.current.y;

    const newBounds = calculateNewBounds(startBoundsRef.current, deltaX, deltaY, handle);

    updateWindowBounds(windowId, newBounds);

    event.preventDefault();
  }, [windowId, updateWindowBounds, calculateNewBounds, handle]);

  const handleTouchEnd = useCallback(() => {
    if (!isResizingRef.current) return;

    isResizingRef.current = false;
    startPositionRef.current = null;
    startBoundsRef.current = null;

    setResizeState(null);
    onResizeEnd?.();
  }, [setResizeState, onResizeEnd]);

  const { attachListeners } = useTouchGestures({
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  });

  return {
    attachListeners,
    isResizing: isResizingRef.current,
  };
};