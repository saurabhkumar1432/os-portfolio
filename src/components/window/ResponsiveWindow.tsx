import React from 'react';
import { motion } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useWindowStore } from '../../store/windowStore';
import type { WindowState } from '../../types';
import { Window } from './Window';

interface ResponsiveWindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export const ResponsiveWindow: React.FC<ResponsiveWindowProps> = ({ 
  window, 
  children 
}) => {
  const { isMobile } = useResponsive();

  // On mobile, render as full-screen mobile window
  if (isMobile) {
    return (
      <MobileWindow window={window}>
        {children}
      </MobileWindow>
    );
  }

  // On desktop, render as regular window
  return (
    <Window window={window}>
      {children}
    </Window>
  );
};

// Mobile Window Component
const MobileWindow: React.FC<ResponsiveWindowProps> = ({ window, children }) => {
  const { theme, reduceMotion } = usePreferencesStore();
  const { focusWindow } = useWindowStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleWindowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.focused) {
      focusWindow(window.id);
    }
  };

  // Mobile windows are always full-screen and visible only when focused
  if (!window.focused || window.minimized) {
    return null;
  }

  return (
    <motion.div
      className={`absolute inset-0 flex flex-col overflow-hidden ${
        isDark 
          ? 'bg-gray-800 text-white' 
          : 'bg-white text-gray-900'
      }`}
      onClick={handleWindowClick}
      initial={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
      animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Mobile Window Content - No title bar needed as it's handled by MobileWindowManager */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};