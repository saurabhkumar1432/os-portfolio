import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useWindowStore } from '../../store/windowStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useResponsive } from '../../hooks/useResponsive';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';
import type { WindowState } from '../../types';

interface MobileWindowManagerProps {
  children: React.ReactNode;
}

export const MobileWindowManager: React.FC<MobileWindowManagerProps> = ({ children }) => {
  const { windows, zOrder, focusWindow, closeWindow } = useWindowStore();
  const { theme } = usePreferencesStore();
  const { isMobile } = useResponsive();
  const [showTabOverflow, setShowTabOverflow] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  // Get visible windows in z-order
  const visibleWindows = zOrder
    .map(id => windows[id])
    .filter(window => window && !window.minimized);

  const focusedWindow = visibleWindows.find(window => window.focused);

  // Set up swipe navigation
  const { attachListeners } = useSwipeNavigation({
    enabled: visibleWindows.length > 1,
  });

  // Attach swipe listeners to content area
  useEffect(() => {
    if (contentRef.current && isMobile) {
      return attachListeners(contentRef.current);
    }
  }, [attachListeners, isMobile]);

  if (!isMobile || visibleWindows.length === 0) {
    return <>{children}</>;
  }

  const handleTabClick = (windowId: string) => {
    focusWindow(windowId);
  };

  const handleCloseTab = (e: React.MouseEvent, windowId: string) => {
    e.stopPropagation();
    closeWindow(windowId);
  };

  const handleTabOverflow = () => {
    setShowTabOverflow(!showTabOverflow);
  };

  // Calculate visible tabs (show max 3 tabs + overflow)
  const maxVisibleTabs = 3;
  const visibleTabs = visibleWindows.slice(0, maxVisibleTabs);
  const overflowTabs = visibleWindows.slice(maxVisibleTabs);

  return (
    <div className="fixed inset-0 flex flex-col z-[1000]">
      {/* Mobile Tab Bar */}
      <div className={`flex-shrink-0 border-b ${
        isDark 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center h-12 px-2">
          {/* Visible Tabs */}
          <div className="flex-1 flex items-center gap-1 overflow-hidden">
            {visibleTabs.map((window) => (
              <MobileTab
                key={window.id}
                window={window}
                isActive={window.focused}
                onClick={() => handleTabClick(window.id)}
                onClose={(e) => handleCloseTab(e, window.id)}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Overflow Menu */}
          {overflowTabs.length > 0 && (
            <div className="relative">
              <button
                onClick={handleTabOverflow}
                className={`p-2 rounded-md transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <MoreHorizontal size={16} />
              </button>

              {/* Overflow Dropdown */}
              <AnimatePresence>
                {showTabOverflow && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 top-full mt-1 min-w-48 rounded-md shadow-lg border z-50 ${
                      isDark
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {overflowTabs.map((window) => (
                      <button
                        key={window.id}
                        onClick={() => {
                          handleTabClick(window.id);
                          setShowTabOverflow(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                          isDark
                            ? 'hover:bg-gray-700 text-gray-200'
                            : 'hover:bg-gray-50 text-gray-800'
                        }`}
                      >
                        <span className="truncate">{window.title}</span>
                        <button
                          onClick={(e) => handleCloseTab(e, window.id)}
                          className={`ml-2 p-1 rounded transition-colors ${
                            isDark
                              ? 'hover:bg-gray-600 text-gray-400'
                              : 'hover:bg-gray-200 text-gray-500'
                          }`}
                        >
                          <X size={12} />
                        </button>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Window Content */}
      <div ref={contentRef} className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {focusedWindow && (
            <motion.div
              key={focusedWindow.id}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swipe Indicator */}
        {visibleWindows.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              isDark
                ? 'bg-gray-800/80 text-gray-300 border border-gray-600'
                : 'bg-white/80 text-gray-600 border border-gray-200'
            } backdrop-blur-sm`}>
              <ChevronLeft size={12} />
              <span>Swipe to switch</span>
              <ChevronRight size={12} />
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close overflow */}
      {showTabOverflow && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowTabOverflow(false)}
        />
      )}
    </div>
  );
};

interface MobileTabProps {
  window: WindowState;
  isActive: boolean;
  onClick: () => void;
  onClose: (e: React.MouseEvent) => void;
  isDark: boolean;
}

const MobileTab: React.FC<MobileTabProps> = ({ 
  window, 
  isActive, 
  onClick, 
  onClose, 
  isDark 
}) => {
  return (
    <motion.button
      layout
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all min-w-0 flex-1 max-w-32 ${
        isActive
          ? isDark
            ? 'bg-blue-600 text-white'
            : 'bg-blue-500 text-white'
          : isDark
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {/* Window Title */}
      <span className="truncate flex-1 text-left">
        {window.title}
      </span>

      {/* Unsaved Indicator */}
      {window.hasUnsavedState && (
        <div className={`w-2 h-2 rounded-full ${
          isActive ? 'bg-white' : 'bg-orange-400'
        }`} />
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className={`p-1 rounded transition-colors ${
          isActive
            ? 'hover:bg-white/20'
            : isDark
              ? 'hover:bg-gray-600'
              : 'hover:bg-gray-300'
        }`}
      >
        <X size={12} />
      </button>
    </motion.button>
  );
};