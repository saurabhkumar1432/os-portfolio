import React from 'react';
import { motion } from 'framer-motion';
import { useWindowStore } from '../../store/windowStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useStartMenuStore } from '../../store/startMenuStore';
import { useResponsive } from '../../hooks/useResponsive';
import { StartButton } from './StartButton';
import { StartMenu } from './StartMenu';
import { MobileStartMenu } from './MobileStartMenu';
import { TaskbarButton } from './TaskbarButton';
import { SystemTray } from './SystemTray';

export const Taskbar: React.FC = () => {
  const { windows, zOrder } = useWindowStore();
  const { theme } = usePreferencesStore();
  const { isOpen: startMenuOpen, toggleStartMenu } = useStartMenuStore();
  const { isMobile } = useResponsive();

  // Get all windows (including minimized) in z-order for taskbar
  const allWindows = zOrder
    .map(id => windows[id])
    .filter(Boolean);

  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <>
      {/* Desktop Taskbar */}
      {!isMobile && (
        <motion.div
          className={`fixed bottom-0 left-0 right-0 h-12 flex items-center px-2 border-t z-40 ${
            isDark 
              ? 'bg-gray-900/95 border-gray-700 backdrop-blur-sm' 
              : 'bg-white/95 border-gray-200 backdrop-blur-sm'
          }`}
          initial={{ y: 48 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Start Button */}
          <StartButton 
            isOpen={startMenuOpen} 
            onClick={toggleStartMenu} 
          />

          {/* Start Menu */}
          <StartMenu />

          {/* Taskbar Buttons */}
          <div className="flex-1 flex items-center gap-1 px-2">
            {allWindows.map((window) => (
              <TaskbarButton key={window.id} window={window} />
            ))}
          </div>

          {/* System Tray */}
          <SystemTray />
        </motion.div>
      )}

      {/* Mobile Start Menu */}
      <MobileStartMenu />
    </>
  );
};