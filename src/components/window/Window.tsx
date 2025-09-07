import React from 'react';
import { motion } from 'framer-motion';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useWindowStore } from '../../store/windowStore';
import type { WindowState } from '../../types';
import { WindowTitleBar } from './WindowTitleBar';
import { ResizeHandles } from './ResizeHandles';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ window, children }) => {
  const { theme, reduceMotion } = usePreferencesStore();
  const { dragState, resizeState, focusWindow } = useWindowStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);
  const isDragging = dragState?.windowId === window.id;
  const isResizing = resizeState?.windowId === window.id;

  const handleWindowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.focused) {
      focusWindow(window.id);
    }
  };

  if (window.minimized) {
    return null;
  }

  const windowStyle = window.maximized
    ? { x: 0, y: 0, width: '100vw', height: 'calc(100vh - 48px)' }
    : { 
        x: window.bounds.x, 
        y: window.bounds.y, 
        width: window.bounds.w, 
        height: window.bounds.h 
      };

  return (
    <motion.div
      className={`absolute border rounded-lg shadow-2xl overflow-hidden transition-all flex flex-col cursor-default ${
        isDark 
          ? 'bg-gray-800 border-gray-600' 
          : 'bg-white border-gray-300'
      } ${
        window.focused
          ? isDark
            ? 'border-blue-500/70 shadow-blue-500/20'
            : 'border-blue-500/70 shadow-blue-500/30'
          : ''
      } ${
        isDragging || isResizing
          ? isDark
            ? 'shadow-blue-500/40 border-blue-500/80'
            : 'shadow-blue-500/50 border-blue-500/80'
          : ''
      }`}
      style={{
        ...windowStyle,
        zIndex: window.zIndex + 1000, // Ensure windows are above desktop elements
      }}
      onClick={handleWindowClick}
      initial={reduceMotion ? undefined : { scale: 0.9, opacity: 0 }}
      animate={reduceMotion ? undefined : { 
        scale: isDragging ? 1.02 : 1, 
        opacity: 1,
        rotateZ: isDragging ? 0.5 : 0
      }}
      exit={reduceMotion ? undefined : { scale: 0.9, opacity: 0 }}
      transition={{ 
        duration: isDragging || isResizing ? 0.1 : 0.2, 
        ease: 'easeOut',
        scale: { type: 'spring', stiffness: 300, damping: 30 }
      }}
      layout={!reduceMotion && !isDragging && !isResizing}
    >
      {/* Window Title Bar */}
      <WindowTitleBar window={window} />

      {/* Window Content */}
      <div className="flex-1 overflow-hidden bg-inherit">
        {children}
      </div>

      {/* Resize Handles */}
      <ResizeHandles window={window} />
    </motion.div>
  );
};