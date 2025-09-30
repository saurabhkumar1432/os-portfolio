import React, { useMemo } from 'react';
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

  // Memoize window style calculations
  const windowStyle = useMemo(() => {
    if (window.maximized) {
      const isMobile = globalThis.window?.innerWidth < 768;
      const taskbarHeight = isMobile ? 0 : 48;
      return { 
        x: 0, 
        y: 0, 
        width: '100vw', 
        height: `calc(100vh - ${taskbarHeight}px)` 
      };
    }
    return { 
      x: window.bounds.x, 
      y: window.bounds.y, 
      width: window.bounds.w, 
      height: window.bounds.h 
    };
  }, [window.maximized, window.bounds.x, window.bounds.y, window.bounds.w, window.bounds.h]);

  // Memoize animation variants
  const animationVariants = useMemo(() => {
    if (reduceMotion) return {};
    
    return {
      initial: { scale: 0.95, opacity: 0 },
      animate: { 
        scale: 1, 
        opacity: 1,
      },
      exit: { scale: 0.95, opacity: 0 },
    };
  }, [reduceMotion]);

  // Optimize transition for drag/resize
  const transition = useMemo(() => {
    if (isDragging || isResizing) {
      return {
        duration: 0,
      };
    }
    return {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as const,
    };
  }, [isDragging, isResizing]);

  // Handle minimized state after all hooks
  if (window.minimized) {
    return null;
  }

  return (
    <motion.div
      className={`absolute border rounded-lg shadow-2xl overflow-hidden flex flex-col cursor-default ${
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
        zIndex: window.zIndex + 1000,
        willChange: isDragging || isResizing ? 'transform' : 'auto',
      }}
      onClick={handleWindowClick}
      {...animationVariants}
      transition={transition}
    >
      {/* Window Title Bar */}
      <WindowTitleBar window={window} />

      {/* Window Content */}
      <div className="flex-1 overflow-hidden bg-inherit">
        {children}
      </div>

      {/* Resize Handles */}
      {!window.maximized && <ResizeHandles window={window} />}
    </motion.div>
  );
};