import { useCallback, useRef } from 'react';
import { useWindowStore } from '../store/windowStore';
import { useSnapZones } from './useSnapZones';
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

export const useDrag = ({ 
  windowId, 
  onDragStart, 
  onDragEnd, 
  enableSnapping = true 
}: UseDragOptions): DragHookState => {
  const { windows, setDragState, updateWindowBounds, focusWindow, updateWindowSnapState } = useWindowStore();
  const dragStateRef = useRef<DragState | null>(null);
  const isDraggingRef = useRef(false);
  const activeSnapZoneRef = useRef<string | null>(null);
  
  const { getActiveSnapZone, getSnapBounds } = useSnapZones({ 
    enabled: enableSnapping 
  });

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

  const constrainPosition = useCallback((x: number, y: number, width: number, _height: number) => {
    const constraints = getViewportConstraints();
    
    // Keep window fully within bounds, but allow some flexibility for title bar
    const minVisibleWidth = Math.min(100, width * 0.2);
    const titleBarHeight = 32;
    
    // Constrain X position - allow partial off-screen but keep some window visible
    const constrainedX = Math.max(
      constraints.minX - width + minVisibleWidth,
      Math.min(x, constraints.maxX - minVisibleWidth)
    );
    
    // Constrain Y position - keep title bar fully visible and above taskbar
    const constrainedY = Math.max(
      constraints.minY,
      Math.min(y, constraints.maxY - titleBarHeight)
    );
    
    return { x: constrainedX, y: constrainedY };
  }, [getViewportConstraints]);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    const window = windows[windowId];
    if (!window || window.maximized) return;

    // Focus the window when starting drag
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
    onDragStart?.();

    // Add global event listeners
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !dragStateRef.current) return;

      e.preventDefault();
      
      const newX = e.clientX - dragStateRef.current.offset.x;
      const newY = e.clientY - dragStateRef.current.offset.y;
      
      // Check for snap zones if snapping is enabled
      if (enableSnapping) {
        const currentSnapZone = getActiveSnapZone(e.clientX, e.clientY);
        activeSnapZoneRef.current = currentSnapZone;
      }
      
      const constrained = constrainPosition(
        newX,
        newY,
        dragStateRef.current.startBounds.w,
        dragStateRef.current.startBounds.h
      );

      updateWindowBounds(windowId, {
        x: constrained.x,
        y: constrained.y,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !dragStateRef.current || e.touches.length === 0) return;

      e.preventDefault();
      
      const touch = e.touches[0];
      const newX = touch.clientX - dragStateRef.current.offset.x;
      const newY = touch.clientY - dragStateRef.current.offset.y;
      
      // Check for snap zones if snapping is enabled
      if (enableSnapping) {
        const currentSnapZone = getActiveSnapZone(touch.clientX, touch.clientY);
        activeSnapZoneRef.current = currentSnapZone;
      }
      
      const constrained = constrainPosition(
        newX,
        newY,
        dragStateRef.current.startBounds.w,
        dragStateRef.current.startBounds.h
      );

      updateWindowBounds(windowId, {
        x: constrained.x,
        y: constrained.y,
      });
    };

    const handleEnd = () => {
      if (!isDraggingRef.current) return;

      // Handle snapping if there's an active snap zone
      if (enableSnapping && activeSnapZoneRef.current) {
        const snapBounds = getSnapBounds(activeSnapZoneRef.current);
        if (snapBounds) {
          updateWindowBounds(windowId, snapBounds);
          
          // Update snap state based on the zone
          const snapState = activeSnapZoneRef.current === 'maximize' ? 'maximized' : activeSnapZoneRef.current;
          updateWindowSnapState(windowId, snapState as 'left' | 'right' | 'maximized');
          
          // Update maximized state if snapping to maximize
          if (activeSnapZoneRef.current === 'maximize') {
            const window = windows[windowId];
            if (window && !window.maximized) {
              // This will be handled by the window store's maximize logic
            }
          }
        }
      }

      isDraggingRef.current = false;
      dragStateRef.current = null;
      setDragState(null);
      activeSnapZoneRef.current = null;
      onDragEnd?.();

      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDraggingRef.current) {
        // Cancel drag and restore original position
        if (dragStateRef.current) {
          updateWindowBounds(windowId, {
            x: dragStateRef.current.startBounds.x,
            y: dragStateRef.current.startBounds.y,
          });
        }
        // Clear snap state when canceling
        activeSnapZoneRef.current = null;
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
  }, [windowId, windows, focusWindow, setDragState, updateWindowBounds, updateWindowSnapState, constrainPosition, onDragStart, onDragEnd, enableSnapping, getActiveSnapZone, getSnapBounds]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    startDrag(e.clientX, e.clientY);
  }, [startDrag]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only handle single touch
    if (e.touches.length !== 1) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  }, [startDrag]);

  return {
    onMouseDown: handleMouseDown,
    onTouchStart: handleTouchStart,
    isDragging: isDraggingRef.current,
  };
};