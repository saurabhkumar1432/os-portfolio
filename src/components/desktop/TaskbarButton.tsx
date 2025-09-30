import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '../../store/windowStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import type { WindowState } from '../../types';
import { WindowPeek } from '../ui/WindowPeek';

interface TaskbarButtonProps {
  window: WindowState;
}

export const TaskbarButton: React.FC<TaskbarButtonProps> = ({ window }) => {
  const { focusWindow, minimizeWindow, maximizeWindow, closeWindow } = useWindowStore();
  const { theme } = usePreferencesStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showPeek, setShowPeek] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleClick = () => {
    // Hide peek on click
    setShowPeek(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (window.focused) {
      minimizeWindow(window.id);
    } else {
      focusWindow(window.id);
    }
  };

  const handleMouseEnter = () => {
    // Show peek after 500ms hover
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPeek(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    // Cancel pending peek
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Hide peek
    setShowPeek(false);
  };

  const getAppIcon = () => {
    // Simple colored squares as placeholders for now
    const iconColors: Record<string, string> = {
      'projects': 'bg-blue-500',
      'file-explorer': 'bg-yellow-500',
      'terminal': 'bg-green-500',
      'about': 'bg-purple-500',
      'notepad': 'bg-orange-500',
      'settings': 'bg-gray-500',
      'resume-viewer': 'bg-red-500',
    };

    const colorClass = iconColors[window.appId] || 'bg-gray-400';
    
    return (
      <div className={`w-4 h-4 rounded ${colorClass} flex items-center justify-center text-white text-xs font-bold`}>
        {window.appId.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <>
      <motion.button
        ref={buttonRef}
        className={`flex items-center gap-2 px-3 py-1 rounded text-sm max-w-48 transition-colors ${
          window.focused && !window.minimized
            ? isDark
              ? 'bg-blue-600/80 text-white border border-blue-500'
              : 'bg-blue-500/80 text-white border border-blue-400'
            : window.minimized
            ? isDark
              ? 'bg-gray-600/60 text-gray-400 border border-gray-600'
              : 'bg-gray-300/60 text-gray-600 border border-gray-300'
            : isDark
            ? 'hover:bg-gray-700 text-gray-300 border border-transparent'
            : 'hover:bg-gray-100 text-gray-700 border border-transparent'
        }`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title={`${window.title}${window.minimized ? ' (Minimized)' : ''}`}
      >
        {/* App Icon */}
        {getAppIcon()}
        
        {/* Window Title */}
        <span className="truncate">
          {window.hasUnsavedState && '• '}
          {window.title}
        </span>
      </motion.button>

      {/* Window Peek */}
      <AnimatePresence>
        {showPeek && buttonRef.current && (
          <WindowPeek
            window={window}
            triggerRef={buttonRef}
            onClose={() => {
              closeWindow(window.id);
              setShowPeek(false);
            }}
            onMaximize={() => {
              maximizeWindow(window.id);
              setShowPeek(false);
            }}
            onMinimize={() => {
              minimizeWindow(window.id);
              setShowPeek(false);
            }}
            onFocus={() => {
              focusWindow(window.id);
              setShowPeek(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};