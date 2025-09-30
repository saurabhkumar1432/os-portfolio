import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Maximize2, Minus } from 'lucide-react';
import type { WindowState } from '../../types';
import { usePreferencesStore } from '../../store/preferencesStore';
import { appRegistry } from '../../services/appRegistry';

interface WindowPeekProps {
  window: WindowState;
  triggerRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: () => void;
  onFocus: () => void;
}

export const WindowPeek: React.FC<WindowPeekProps> = ({
  window,
  triggerRef,
  onClose,
  onMaximize,
  onMinimize,
  onFocus,
}) => {
  const { theme } = usePreferencesStore();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const peekRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  // Get app info from registry
  const appInfo = appRegistry.getApp(window.appId);
  const appIcon = appInfo?.icon || '📄';

  // Calculate position based on trigger element
  useEffect(() => {
    if (triggerRef.current && peekRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const peekRect = peekRef.current.getBoundingClientRect();
      
      // Position above taskbar button, centered
      const x = triggerRect.left + (triggerRect.width / 2) - (peekRect.width / 2);
      const y = triggerRect.top - peekRect.height - 12; // 12px gap

      // Keep within viewport bounds
      const maxX = globalThis.window.innerWidth - peekRect.width - 8;
      const minX = 8;
      
      setPosition({
        x: Math.max(minX, Math.min(x, maxX)),
        y: Math.max(8, y),
      });
    }
  }, [triggerRef]);

  return (
    <motion.div
      ref={peekRef}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`fixed z-[60] rounded-xl shadow-2xl overflow-hidden ${
        isDark
          ? 'bg-gray-800/95 border border-gray-700'
          : 'bg-white/95 border border-gray-200'
      } backdrop-blur-xl`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '280px',
      }}
    >
      {/* Preview Header */}
      <div className={`px-3 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl">{appIcon}</span>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {window.title}
              </h3>
              <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {window.appId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content - Thumbnail */}
      <motion.div
        className={`relative w-full aspect-video cursor-pointer ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}
        onClick={onFocus}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Simulated Window Preview */}
        <div className="absolute inset-0 p-4">
          {/* Window Title Bar */}
          <div className={`h-6 rounded-t-lg flex items-center px-2 ${
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <div className={`flex-1 text-center text-[8px] font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {window.title}
            </div>
          </div>
          
          {/* Window Content Area */}
          <div className={`rounded-b-lg p-2 ${
            isDark ? 'bg-gray-700/50' : 'bg-white'
          } border ${isDark ? 'border-gray-600' : 'border-gray-200'}`} style={{ height: 'calc(100% - 24px)' }}>
            <div className="flex flex-col gap-1.5 h-full">
              {/* Simulated content lines */}
              <div className={`h-2 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ width: '80%' }} />
              <div className={`h-2 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ width: '60%' }} />
              <div className={`h-2 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ width: '70%' }} />
              <div className={`flex-1 rounded ${isDark ? 'bg-gray-600/30' : 'bg-gray-100'}`} />
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-blue-500/10"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      </motion.div>

      {/* Action Buttons */}
      <div className={`flex items-center justify-end gap-1 px-3 py-2 border-t ${
        isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
      }`}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className={`p-1.5 rounded hover:bg-opacity-10 ${
            isDark ? 'hover:bg-white text-gray-400' : 'hover:bg-black text-gray-600'
          }`}
          title="Minimize"
        >
          <Minus className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onMaximize();
          }}
          className={`p-1.5 rounded hover:bg-opacity-10 ${
            isDark ? 'hover:bg-white text-gray-400' : 'hover:bg-black text-gray-600'
          }`}
          title={window.maximized ? "Restore" : "Maximize"}
        >
          <Maximize2 className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={`p-1.5 rounded hover:bg-red-500 text-gray-400 hover:text-white transition-colors`}
          title="Close"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Arrow pointing to taskbar button */}
      <div 
        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 ${
          isDark ? 'bg-gray-800 border-r border-b border-gray-700' : 'bg-white border-r border-b border-gray-200'
        }`}
      />
    </motion.div>
  );
};

// Hook for managing window peek state
export const useWindowPeek = () => {
  const [peekWindow, setPeekWindow] = useState<WindowState | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showPeek = (window: WindowState) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Show peek after a short delay
    timeoutRef.current = setTimeout(() => {
      setPeekWindow(window);
      setIsHovering(true);
    }, 500); // 500ms delay before showing
  };

  const hidePeek = () => {
    // Clear timeout if hovering away before peek shows
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Hide immediately
    setIsHovering(false);
    
    // Remove from DOM after animation
    setTimeout(() => {
      setPeekWindow(null);
    }, 150);
  };

  const cancelPeek = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setPeekWindow(null);
    setIsHovering(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    peekWindow,
    isHovering,
    showPeek,
    hidePeek,
    cancelPeek,
  };
};
