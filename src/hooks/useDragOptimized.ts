import { useCallback, useRef, useEffect } from 'react';
import { useWindowStore } from '../store/windowStore';
import type { DragState } from '../types';

interface UseDragOptions {
  windowId: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  enableSnapping?: boolean;
}

interface DragHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
}

interface DragHookState extends DragHandlers {
  isDragging: boolean;
}

/**
 * Optimized drag hook with RAF for smooth 60fps dragging
 */
export const useDragOptimized = ({ 
  windowId, 
  onDragStart, 
  onDragEnd, 
  enableSnapping = true 
}: UseDragOptions): DragHookState => {
  const { windows, setDragState, updateWindowBounds, focusWindow, updateWindowSnapState } = useWindowStore();
  const dragStateRef = useRef<DragState | null>(null);
  const isDraggingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const activeSnapZoneRef = useRef<'left' | 'right' | 'maximized' | null>(null);

  const getViewportConstraints = useCallback(() => {
    const isMobile = globalThis.window.innerWidth < 768;
    const taskbarHeight = isMobile ? 0 : 48;
    return {
      minX: 0,
      minY: 0,
      maxX: globalThis.window.innerWidth,
      maxY: globalThis.window.innerHeight - taskbarHeight,
    };
  }, []);

  const getSnapZone = useCallback((x: number, y: number, windowWidth: number): 'left' | 'right' | 'maximized' | null => {
    if (!enableSnapping) return null;

    const snapTriggerWidth = 20;
    const topSnapTriggerHeight = 10;
    const constraints = getViewportConstraints();

    // Left edge snap
    if (x < snapTriggerWidth && y > topSnapTriggerHeight) {
      return 'left';
    }
    
    // Right edge snap
    if (x + windowWidth > constraints.maxX - snapTriggerWidth && y > topSnapTriggerHeight) {
      return 'right';
    }
    
    // Top edge snap (maximize)
    if (y < topSnapTriggerHeight) {
      return 'maximized';
    }

    return null;
  }, [enableSnapping, getViewportConstraints]);

  const getSnapBounds = useCallback((zone: 'left' | 'right' | 'maximized') => {
    const constraints = getViewportConstraints();
    const taskbarHeight = 48;

    switch (zone) {
      case 'left':
        return {
          x: 0,
          y: 0,
          w: Math.floor(constraints.maxX / 2),
          h: constraints.maxY,
        };
      case 'right':
        return {
          x: Math.floor(constraints.maxX / 2),
          y: 0,
          w: Math.floor(constraints.maxX / 2),
          h: constraints.maxY,
        };
      case 'maximized':
        return {
          x: 0,
          y: 0,
          w: constraints.maxX,
          h: globalThis.window.innerHeight - taskbarHeight,
        };
    }
  }, [getViewportConstraints]);

  const constrainPosition = useCallback((x: number, y: number, width: number, _height: number) => {
    const constraints = getViewportConstraints();
    const minVisibleWidth = Math.min(100, width * 0.2);
    const titleBarHeight = 32;
    
    const constrainedX = Math.max(
      constraints.minX - width + minVisibleWidth,
      Math.min(x, constraints.maxX - minVisibleWidth)
    );
    
    const constrainedY = Math.max(
      constraints.minY,
      Math.min(y, constraints.maxY - titleBarHeight)
    );
    
    return { x: constrainedX, y: constrainedY };
  }, [getViewportConstraints]);

  // Update position using RAF for smooth animation
  const updatePosition = useCallback(() => {
    if (!lastPositionRef.current || !dragStateRef.current) return;

    const { x, y } = lastPositionRef.current;
    const window = windows[windowId];
    if (!window) return;

    const newX = x - dragStateRef.current.offset.x;
    const newY = y - dragStateRef.current.offset.y;

    // Check for snap zones
    const snapZone = getSnapZone(newX, newY, window.bounds.w);
    
    if (snapZone !== activeSnapZoneRef.current) {
      activeSnapZoneRef.current = snapZone;
      // Update snap state in store for visual feedback
      if (snapZone) {
        updateWindowSnapState(windowId, snapZone);
      } else {
        updateWindowSnapState(windowId, null);
      }
    }

    // Don't apply snapping during drag, only show preview
    const constrained = constrainPosition(newX, newY, window.bounds.w, window.bounds.h);
    
    updateWindowBounds(windowId, {
      ...window.bounds,
      x: Math.round(constrained.x),
      y: Math.round(constrained.y),
    });

    lastPositionRef.current = null;
  }, [windowId, windows, getSnapZone, getSnapBounds, constrainPosition, updateWindowBounds, updateWindowSnapState]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (isDraggingRef.current && lastPositionRef.current) {
        updatePosition();
      }
      
      if (isDraggingRef.current) {
        rafIdRef.current = requestAnimationFrame(animate);
      }
    };

    if (isDraggingRef.current) {
      rafIdRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isDraggingRef.current, updatePosition]);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    const window = windows[windowId];
    if (!window || window.maximized) return;

    focusWindow(windowId);

    const dragState: DragState = {
      windowId,
      startPosition: { x: clientX, y: clientY },
      startBounds: { ...window.bounds },
      offset: {
        x: clientX - window.bounds.x,
        y: clientY - window.bounds.y,
      },
    };

    dragStateRef.current = dragState;
    isDraggingRef.current = true;
    setDragState(dragState);
    activeSnapZoneRef.current = null;
    onDragStart?.();

    // Optimize: Add cursor style
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [windowId, windows, focusWindow, setDragState, onDragStart]);

  const handleDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current || !dragStateRef.current) return;
    
    // Store position for RAF to process
    lastPositionRef.current = { x: clientX, y: clientY };
  }, []);

  const endDrag = useCallback(() => {
    if (!isDraggingRef.current || !dragStateRef.current) return;

    const window = windows[windowId];
    if (window && activeSnapZoneRef.current) {
      // Apply snap on release
      const snapBounds = getSnapBounds(activeSnapZoneRef.current);
      if (snapBounds) {
        updateWindowBounds(windowId, snapBounds);
        updateWindowSnapState(windowId, activeSnapZoneRef.current);
      }
    } else {
      // Clear snap state
      updateWindowSnapState(windowId, null);
    }

    isDraggingRef.current = false;
    dragStateRef.current = null;
    lastPositionRef.current = null;
    activeSnapZoneRef.current = null;
    setDragState(null);
    
    // Restore cursor
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    onDragEnd?.();
  }, [windowId, windows, getSnapBounds, updateWindowBounds, updateWindowSnapState, setDragState, onDragEnd]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    e.stopPropagation();
    
    startDrag(e.clientX, e.clientY);

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleDrag(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      endDrag();
      globalThis.window.removeEventListener('mousemove', handleMouseMove);
      globalThis.window.removeEventListener('mouseup', handleMouseUp);
    };

    globalThis.window.addEventListener('mousemove', handleMouseMove, { passive: false });
    globalThis.window.addEventListener('mouseup', handleMouseUp);
  }, [startDrag, handleDrag, endDrag]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    e.stopPropagation();
    
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      handleDrag(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      endDrag();
      globalThis.window.removeEventListener('touchmove', handleTouchMove);
      globalThis.window.removeEventListener('touchend', handleTouchEnd);
    };

    globalThis.window.addEventListener('touchmove', handleTouchMove, { passive: true });
    globalThis.window.addEventListener('touchend', handleTouchEnd);
  }, [startDrag, handleDrag, endDrag]);

  return {
    onMouseDown,
    onTouchStart,
    isDragging: isDraggingRef.current,
  };
};
