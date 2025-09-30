import React from 'react';
import { motion } from 'framer-motion';
import { useWindowStore } from '../../store/windowStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useDragOptimized } from '../../hooks/useDragOptimized';
import { useCloseConfirmation } from '../../hooks/useCloseConfirmation';
import type { WindowState } from '../../types';

interface WindowTitleBarProps {
  window: WindowState;
}

export const WindowTitleBar: React.FC<WindowTitleBarProps> = ({ window }) => {
  const { minimizeWindow, maximizeWindow, dragState } = useWindowStore();
  const { theme } = usePreferencesStore();
  const { requestClose } = useCloseConfirmation();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  const dragHandlers = useDragOptimized({
    windowId: window.id,
    enableSnapping: true,
  });

  const handleDoubleClick = () => {
    maximizeWindow(window.id);
  };

  const isDragging = dragState?.windowId === window.id;

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
    <div
      className={`flex items-center justify-between h-8 px-3 select-none border-b transition-colors ${
        isDragging ? 'cursor-grabbing' : 'cursor-move'
      } ${
        window.focused
          ? isDark
            ? 'bg-gray-700 border-gray-600'
            : 'bg-gray-50 border-gray-200'
          : isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-gray-100 border-gray-300'
      } ${
        isDragging
          ? isDark
            ? 'bg-gray-600'
            : 'bg-gray-200'
          : ''
      }`}
      onMouseDown={dragHandlers.onMouseDown}
      onTouchStart={dragHandlers.onTouchStart}
      onDoubleClick={handleDoubleClick}
    >
      {/* Left side - Icon and Title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getAppIcon()}
        <span className={`text-sm truncate ${
          window.focused
            ? isDark ? 'text-white' : 'text-gray-900'
            : isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {window.hasUnsavedState && '• '}
          {window.title}
        </span>
      </div>

      {/* Right side - Window Controls */}
      <div className="flex items-center gap-1">
        {/* Minimize Button */}
        <motion.button
          className={`w-6 h-6 rounded flex items-center justify-center hover:bg-opacity-20 ${
            isDark ? 'hover:bg-white' : 'hover:bg-black'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            minimizeWindow(window.id);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Minimize"
        >
          <div className={`w-3 h-0.5 ${isDark ? 'bg-gray-300' : 'bg-gray-600'}`} />
        </motion.button>

        {/* Maximize/Restore Button */}
        <motion.button
          className={`w-6 h-6 rounded flex items-center justify-center hover:bg-opacity-20 ${
            isDark ? 'hover:bg-white' : 'hover:bg-black'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            maximizeWindow(window.id);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={window.maximized ? "Restore" : "Maximize"}
        >
          {window.maximized ? (
            // Restore icon (two overlapping squares)
            <div className="relative w-3 h-3">
              <div className={`absolute w-2 h-2 border ${isDark ? 'border-gray-300' : 'border-gray-600'} top-0 right-0`} />
              <div className={`absolute w-2 h-2 border ${isDark ? 'border-gray-300' : 'border-gray-600'} bottom-0 left-0`} />
            </div>
          ) : (
            // Maximize icon (single square)
            <div className={`w-3 h-3 border ${isDark ? 'border-gray-300' : 'border-gray-600'}`} />
          )}
        </motion.button>

        {/* Close Button */}
        <motion.button
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-500 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            requestClose(window.id);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Close"
        >
          <div className="relative w-3 h-3">
            <div className={`absolute w-3 h-0.5 transform rotate-45 top-1/2 left-0 -translate-y-1/2 ${isDark ? 'bg-gray-300' : 'bg-gray-600'}`} />
            <div className={`absolute w-3 h-0.5 transform -rotate-45 top-1/2 left-0 -translate-y-1/2 ${isDark ? 'bg-gray-300' : 'bg-gray-600'}`} />
          </div>
        </motion.button>
      </div>
    </div>
  );
};