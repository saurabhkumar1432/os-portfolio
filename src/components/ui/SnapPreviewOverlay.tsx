import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '../../store/windowStore';
import { usePreferencesStore } from '../../store/preferencesStore';

/**
 * Visual snap zone overlay that shows when dragging windows
 * Provides visual feedback for snap areas (left/right/maximized)
 */
export const SnapPreviewOverlay: React.FC = () => {
  const { dragState, windows } = useWindowStore();
  const { theme } = usePreferencesStore();
  
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  // Only show when dragging
  if (!dragState) return null;

  const draggingWindow = windows[dragState.windowId];
  if (!draggingWindow || draggingWindow.maximized) return null;

  const snapState = draggingWindow.snapState;
  if (!snapState) return null;

  // Calculate snap zone bounds
  const getSnapBounds = () => {
    const taskbarHeight = 48;
    const viewportWidth = globalThis.window.innerWidth;
    const viewportHeight = globalThis.window.innerHeight - taskbarHeight;

    switch (snapState) {
      case 'left':
        return {
          x: 0,
          y: 0,
          width: viewportWidth / 2,
          height: viewportHeight,
        };
      case 'right':
        return {
          x: viewportWidth / 2,
          y: 0,
          width: viewportWidth / 2,
          height: viewportHeight,
        };
      case 'maximized':
        return {
          x: 0,
          y: 0,
          width: viewportWidth,
          height: viewportHeight,
        };
      default:
        return null;
    }
  };

  const bounds = getSnapBounds();
  if (!bounds) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="snap-preview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: bounds.x,
          top: bounds.y,
          width: bounds.width,
          height: bounds.height,
        }}
      >
        {/* Backdrop with blur */}
        <div className={`absolute inset-0 ${
          isDark
            ? 'bg-blue-500/20 border-2 border-blue-400/50'
            : 'bg-blue-500/20 border-2 border-blue-500/50'
        } backdrop-blur-sm rounded-lg`} />
        
        {/* Animated border effect */}
        <motion.div
          className={`absolute inset-0 rounded-lg ${
            isDark ? 'border-2 border-blue-400' : 'border-2 border-blue-500'
          }`}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Snap zone label */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg ${
          isDark
            ? 'bg-gray-900/90 text-blue-400 border border-blue-400/50'
            : 'bg-white/90 text-blue-600 border border-blue-500/50'
        } backdrop-blur-md shadow-lg`}>
          <div className="flex items-center gap-2">
            <SnapIcon type={snapState} />
            <span className="font-medium text-lg">
              {snapState === 'left' && 'Snap Left'}
              {snapState === 'right' && 'Snap Right'}
              {snapState === 'maximized' && 'Maximize'}
            </span>
          </div>
        </div>

        {/* Corner indicators */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
          <motion.div
            key={corner}
            className={`absolute w-6 h-6 ${
              isDark ? 'bg-blue-400/70' : 'bg-blue-500/70'
            } rounded-full`}
            style={{
              top: corner.includes('top') ? -3 : 'auto',
              bottom: corner.includes('bottom') ? -3 : 'auto',
              left: corner.includes('left') ? -3 : 'auto',
              right: corner.includes('right') ? -3 : 'auto',
            }}
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

// Icon component for different snap types
const SnapIcon: React.FC<{ type: string }> = ({ type }) => {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      {type === 'left' && (
        <path d="M3 3h8v18H3V3zm10 0h8v18h-8V3z" opacity="0.3" />
      )}
      {type === 'right' && (
        <path d="M3 3h8v18H3V3zm10 0h8v18h-8V3z" opacity="0.3" transform="translate(11, 0)" />
      )}
      {type === 'maximized' && (
        <rect x="2" y="2" width="20" height="20" rx="2" />
      )}
    </svg>
  );
};
