import { useState, useEffect } from 'react';
import { useWindowStore } from '../store/windowStore';
import { useSnapZones } from './useSnapZones';

interface GlobalSnapOverlayState {
  visible: boolean;
  activeZone: string | null;
  snapZones: Array<{
    id: 'left' | 'right' | 'maximize';
    bounds: { x: number; y: number; w: number; h: number };
    active: boolean;
  }>;
}

/**
 * Hook to manage global snap overlay state during window dragging
 */
export const useGlobalSnapOverlay = (): GlobalSnapOverlayState => {
  const { dragState } = useWindowStore();
  const [overlayState, setOverlayState] = useState<GlobalSnapOverlayState>({
    visible: false,
    activeZone: null,
    snapZones: [],
  });

  const { snapZones, getActiveSnapZone } = useSnapZones({ 
    enabled: !!dragState 
  });

  useEffect(() => {
    if (!dragState) {
      setOverlayState({
        visible: false,
        activeZone: null,
        snapZones: [],
      });
      return;
    }

    // Show overlay when dragging
    setOverlayState({
      visible: true,
      activeZone: null, // Will be updated by mouse move events
      snapZones,
    });

    let currentActiveZone: string | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const activeZone = getActiveSnapZone(e.clientX, e.clientY);
      if (activeZone !== currentActiveZone) {
        currentActiveZone = activeZone;
        setOverlayState(prev => ({
          ...prev,
          activeZone,
        }));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const activeZone = getActiveSnapZone(touch.clientX, touch.clientY);
        if (activeZone !== currentActiveZone) {
          currentActiveZone = activeZone;
          setOverlayState(prev => ({
            ...prev,
            activeZone,
          }));
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [dragState, snapZones, getActiveSnapZone]);

  return overlayState;
};