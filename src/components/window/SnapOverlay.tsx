import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePreferencesStore } from '../../store/preferencesStore';

interface SnapZone {
  id: 'left' | 'right' | 'maximize';
  bounds: { x: number; y: number; w: number; h: number };
  active: boolean;
}

interface SnapOverlayProps {
  visible: boolean;
  snapZones: SnapZone[];
  activeZone: string | null;
}

export const SnapOverlay: React.FC<SnapOverlayProps> = ({ 
  visible, 
  snapZones, 
  activeZone 
}) => {
  const { theme, reduceMotion } = usePreferencesStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[9999]"
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {snapZones.map((zone) => (
            <motion.div
              key={zone.id}
              className={`absolute border-2 border-dashed transition-all duration-200 ${
                activeZone === zone.id
                  ? isDark
                    ? 'bg-blue-500/30 border-blue-400'
                    : 'bg-blue-500/20 border-blue-500'
                  : zone.active
                  ? isDark
                    ? 'bg-blue-500/15 border-blue-500/60'
                    : 'bg-blue-500/10 border-blue-500/50'
                  : 'bg-transparent border-transparent'
              }`}
              style={{
                left: zone.bounds.x,
                top: zone.bounds.y,
                width: zone.bounds.w,
                height: zone.bounds.h,
              }}
              initial={reduceMotion ? undefined : { scale: 0.95 }}
              animate={reduceMotion ? undefined : { 
                scale: activeZone === zone.id ? 1.02 : 1,
              }}
              transition={{ 
                duration: 0.2, 
                ease: 'easeOut',
                scale: { type: 'spring', stiffness: 300, damping: 30 }
              }}
            >
              {/* Zone label */}
              {zone.active && (
                <motion.div
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-md text-sm font-medium ${
                    isDark
                      ? 'bg-gray-800/90 text-white border border-gray-600'
                      : 'bg-white/90 text-gray-900 border border-gray-300'
                  }`}
                  initial={reduceMotion ? undefined : { scale: 0, opacity: 0 }}
                  animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.15 }}
                >
                  {zone.id === 'left' && 'Snap Left'}
                  {zone.id === 'right' && 'Snap Right'}
                  {zone.id === 'maximize' && 'Maximize'}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};