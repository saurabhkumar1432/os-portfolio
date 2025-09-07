import { useRef, useCallback } from 'react';
import { useWindowStore } from '../store/windowStore';
import { useResponsive } from './useResponsive';
import { useTouchGestures } from './useTouchGestures';
import type { WindowState } from '../types';

interface TouchDragOptions {
  windowId: string;
  enabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const useTouchDrag = ({ windowId, enabled = true, onDragStart, onDragEnd }: TouchDragOptions) => {
  const { updateWindowBounds, setDragState } = useWindowStore();
  const { isMobile, screenWidth, screenHeight } = useResponsive();
  const isDraggingRef = useRef(false);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);
  const startBoundsRef = useRef<WindowState['bounds'] | null>(null);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled || !isMobile) return;

    const touch = event.touches[0];
    if (!touch) return;

    const window = useWindowStore.getState().windows[windowId];
    if (!window) return;

    isDraggingRef.current = true;
    startPositionRef.current = { x: touch.clientX, y: touch.clientY };
    startBoundsRef.current = { ...window.bounds };

    setDragState({
      windowId,
      startPosition: startPositionRef.current,
      startBounds: startBoundsRef.current,
      offset: { x: 0, y: 0 },
    });

    onDragStart?.();

    // Prevent default to avoid scrolling
    event.preventDefault();
  }, [enabled, isMobile, windowId, setDragState, onDragStart]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isDraggingRef.current || !startPositionRef.current || !startBoundsRef.current) return;

    const touch = event.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - startPositionRef.current.x;
    const deltaY = touch.clientY - startPositionRef.current.y;

    // Calculate new position with constraints
    const newX = Math.max(0, Math.min(screenWidth - startBoundsRef.current.w, startBoundsRef.current.x + deltaX));
    const newY = Math.max(0, Math.min(screenHeight - startBoundsRef.current.h, startBoundsRef.current.y + deltaY));

    updateWindowBounds(windowId, {
      x: newX,
      y: newY,
    });

    // Update drag state
    setDragState({
      windowId,
      startPosition: startPositionRef.current,
      startBounds: startBoundsRef.current,
      offset: { x: deltaX, y: deltaY },
    });

    event.preventDefault();
  }, [windowId, updateWindowBounds, setDragState, screenWidth, screenHeight]);

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    startPositionRef.current = null;
    startBoundsRef.current = null;

    setDragState(null);
    onDragEnd?.();
  }, [setDragState, onDragEnd]);

  const { attachListeners } = useTouchGestures({
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  });

  return {
    attachListeners,
    isDragging: isDraggingRef.current,
  };
};