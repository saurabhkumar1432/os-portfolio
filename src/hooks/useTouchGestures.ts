import { useRef, useCallback, useEffect } from 'react';

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

export interface PinchGesture {
  scale: number;
  center: { x: number; y: number };
}

export interface TouchGestureHandlers {
  onSwipe?: (gesture: SwipeGesture) => void;
  onPinch?: (gesture: PinchGesture) => void;
  onTap?: (point: TouchPoint) => void;
  onDoubleTap?: (point: TouchPoint) => void;
  onLongPress?: (point: TouchPoint) => void;
  onTouchStart?: (event: TouchEvent) => void;
  onTouchMove?: (event: TouchEvent) => void;
  onTouchEnd?: (event: TouchEvent) => void;
}

export interface TouchGestureOptions {
  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
  doubleTapDelay?: number;
  longPressDelay?: number;
  pinchThreshold?: number;
}

const DEFAULT_OPTIONS: Required<TouchGestureOptions> = {
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.3,
  doubleTapDelay: 300,
  longPressDelay: 500,
  pinchThreshold: 0.1,
};

export const useTouchGestures = (
  handlers: TouchGestureHandlers,
  options: TouchGestureOptions = {}
) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const touchStartRef = useRef<TouchPoint | null>(null);
  const lastTapRef = useRef<TouchPoint | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const isGestureActiveRef = useRef(false);

  const getTouchPoint = useCallback((touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now(),
  }), []);

  const getDistance = useCallback((point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getSwipeDirection = useCallback((start: TouchPoint, end: TouchPoint): SwipeGesture['direction'] => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }, []);

  const getPinchDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getPinchCenter = useCallback((touches: TouchList): { x: number; y: number } => {
    if (touches.length < 2) return { x: 0, y: 0 };
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }, []);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touches = event.touches;
    
    if (touches.length === 1) {
      // Single touch
      const touchPoint = getTouchPoint(touches[0]);
      touchStartRef.current = touchPoint;
      isGestureActiveRef.current = false;

      // Start long press timer
      if (handlers.onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          if (touchStartRef.current && !isGestureActiveRef.current) {
            handlers.onLongPress!(touchStartRef.current);
            isGestureActiveRef.current = true;
          }
        }, opts.longPressDelay);
      }
    } else if (touches.length === 2) {
      // Pinch gesture start
      clearLongPressTimer();
      initialPinchDistanceRef.current = getPinchDistance(touches);
      isGestureActiveRef.current = true;
    }

    handlers.onTouchStart?.(event);
  }, [handlers, opts.longPressDelay, getTouchPoint, getPinchDistance, clearLongPressTimer]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    const touches = event.touches;

    if (touches.length === 1 && touchStartRef.current) {
      // Check if movement is significant enough to cancel long press
      const currentPoint = getTouchPoint(touches[0]);
      const distance = getDistance(touchStartRef.current, currentPoint);
      
      if (distance > 10) {
        clearLongPressTimer();
      }
    } else if (touches.length === 2 && initialPinchDistanceRef.current && handlers.onPinch) {
      // Pinch gesture
      const currentDistance = getPinchDistance(touches);
      const scale = currentDistance / initialPinchDistanceRef.current;
      const center = getPinchCenter(touches);

      if (Math.abs(scale - 1) > opts.pinchThreshold) {
        handlers.onPinch({ scale, center });
        isGestureActiveRef.current = true;
      }
    }

    handlers.onTouchMove?.(event);
  }, [
    handlers,
    opts.pinchThreshold,
    getTouchPoint,
    getDistance,
    getPinchDistance,
    getPinchCenter,
    clearLongPressTimer,
  ]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    const touches = event.changedTouches;
    
    if (touches.length === 1 && touchStartRef.current && !isGestureActiveRef.current) {
      const endPoint = getTouchPoint(touches[0]);
      const distance = getDistance(touchStartRef.current, endPoint);
      const duration = endPoint.timestamp - touchStartRef.current.timestamp;
      const velocity = distance / duration;

      clearLongPressTimer();

      // Check for swipe gesture
      if (distance > opts.swipeThreshold && velocity > opts.swipeVelocityThreshold && handlers.onSwipe) {
        const direction = getSwipeDirection(touchStartRef.current, endPoint);
        handlers.onSwipe({
          direction,
          distance,
          velocity,
          duration,
        });
      } else if (distance < 10 && duration < 300) {
        // Tap gesture
        const now = Date.now();
        
        if (lastTapRef.current && 
            now - lastTapRef.current.timestamp < opts.doubleTapDelay &&
            getDistance(lastTapRef.current, endPoint) < 50 &&
            handlers.onDoubleTap) {
          // Double tap
          handlers.onDoubleTap(endPoint);
          lastTapRef.current = null;
        } else {
          // Single tap
          if (handlers.onTap) {
            handlers.onTap(endPoint);
          }
          lastTapRef.current = endPoint;
        }
      }
    }

    // Reset state
    if (event.touches.length === 0) {
      touchStartRef.current = null;
      initialPinchDistanceRef.current = null;
      isGestureActiveRef.current = false;
      clearLongPressTimer();
    }

    handlers.onTouchEnd?.(event);
  }, [
    handlers,
    opts.swipeThreshold,
    opts.swipeVelocityThreshold,
    opts.doubleTapDelay,
    getTouchPoint,
    getDistance,
    getSwipeDirection,
    clearLongPressTimer,
  ]);

  const attachListeners = useCallback((element: HTMLElement) => {
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  return {
    attachListeners,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};