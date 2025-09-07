import { useMemo, useCallback } from 'react';
import { windowUtils } from '../utils';

interface SnapZone {
  id: 'left' | 'right' | 'maximize';
  bounds: { x: number; y: number; w: number; h: number };
  active: boolean;
  triggerBounds: { x: number; y: number; w: number; h: number };
}

interface UseSnapZonesOptions {
  enabled: boolean;
}

interface UseSnapZonesReturn {
  snapZones: SnapZone[];
  getActiveSnapZone: (x: number, y: number) => string | null;
  getSnapBounds: (zoneId: string) => { x: number; y: number; w: number; h: number } | null;
}

export const useSnapZones = ({ enabled }: UseSnapZonesOptions): UseSnapZonesReturn => {
  const snapZones = useMemo(() => {
    if (!enabled) return [];

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const taskbarHeight = 48;
    const snapTriggerWidth = 20; // Pixels from edge to trigger snap
    const topSnapTriggerHeight = 10; // Pixels from top to trigger maximize

    const zones: SnapZone[] = [
      // Left snap zone
      {
        id: 'left',
        bounds: windowUtils.getSnapBounds('left', viewportWidth, viewportHeight),
        active: false,
        triggerBounds: {
          x: 0,
          y: 0,
          w: snapTriggerWidth,
          h: viewportHeight - taskbarHeight,
        },
      },
      // Right snap zone
      {
        id: 'right',
        bounds: windowUtils.getSnapBounds('right', viewportWidth, viewportHeight),
        active: false,
        triggerBounds: {
          x: viewportWidth - snapTriggerWidth,
          y: 0,
          w: snapTriggerWidth,
          h: viewportHeight - taskbarHeight,
        },
      },
      // Maximize zone (top edge)
      {
        id: 'maximize',
        bounds: windowUtils.getSnapBounds('maximized', viewportWidth, viewportHeight),
        active: false,
        triggerBounds: {
          x: 0,
          y: 0,
          w: viewportWidth,
          h: topSnapTriggerHeight,
        },
      },
    ];

    return zones;
  }, [enabled]);

  const getActiveSnapZone = useCallback((x: number, y: number): string | null => {
    if (!enabled) return null;

    for (const zone of snapZones) {
      const { triggerBounds } = zone;
      if (
        x >= triggerBounds.x &&
        x <= triggerBounds.x + triggerBounds.w &&
        y >= triggerBounds.y &&
        y <= triggerBounds.y + triggerBounds.h
      ) {
        return zone.id;
      }
    }

    return null;
  }, [enabled, snapZones]);

  const getSnapBounds = useCallback((zoneId: string) => {
    const zone = snapZones.find(z => z.id === zoneId);
    return zone ? zone.bounds : null;
  }, [snapZones]);

  // Update active state based on current zones
  const zonesWithActiveState = useMemo(() => {
    return snapZones.map(zone => ({
      ...zone,
      active: true, // Always show zones when dragging
    }));
  }, [snapZones]);

  return {
    snapZones: zonesWithActiveState,
    getActiveSnapZone,
    getSnapBounds,
  };
};