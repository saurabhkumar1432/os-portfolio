import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3 } from 'lucide-react';
import { useDesktopStore } from '../../store/desktopStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useStartMenuStore } from '../../store/startMenuStore';
import { useResponsive } from '../../hooks/useResponsive';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { getWallpaperValue } from '../../assets/wallpapers';
import { DesktopIcon } from './DesktopIcon';
import { DesktopContextMenu } from '../ui/CustomContextMenu';
import { TouchContextMenu } from '../ui/TouchContextMenu';

export const Desktop: React.FC = () => {
  const { 
    icons, 
    contextMenu, 
    dragSelection,
    showContextMenu, 
    hideContextMenu, 
    clearSelection,
    startDragSelection,
    updateDragSelection,
    endDragSelection,
    loadIconLayout,
    setIconSize
  } = useDesktopStore();
  const { wallpaper, theme } = usePreferencesStore();
  const { toggleStartMenu } = useStartMenuStore();
  const { isMobile, isTouchDevice } = useResponsive();
  const desktopRef = useRef<HTMLDivElement>(null);

  // Load saved icon layout on mount
  React.useEffect(() => {
    loadIconLayout();
  }, [loadIconLayout]);

  // Touch gesture handlers
  const { attachListeners } = useTouchGestures({
    onLongPress: (point) => {
      if (isTouchDevice && !isMobile) {
        // Show context menu on long press for touch devices
        showContextMenu(point.x, point.y);
      }
    },
    onDoubleTap: (_point) => {
      if (isTouchDevice) {
        // Clear selection on double tap
        clearSelection();
        hideContextMenu();
      }
    },
  });

  // Attach touch listeners to desktop
  useEffect(() => {
    if (desktopRef.current && isTouchDevice) {
      return attachListeners(desktopRef.current);
    }
  }, [attachListeners, isTouchDevice]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Disable context menu on mobile
    if (!isMobile) {
      showContextMenu(e.clientX, e.clientY);
    }
  };

  const handleContextAction = (action: string) => {
    hideContextMenu();
    
    switch (action) {
      case 'refresh':
        // Reload the page
        window.location.reload();
        break;
      case 'view-large-icons':
        setIconSize('lg');
        break;
      case 'view-medium-icons':
        setIconSize('md');
        break;
      case 'view-small-icons':
        setIconSize('sm');
        break;
      case 'sort-name':
      case 'sort-date':
      case 'sort-type':
        // Sort icons - could be implemented in desktop store
        // Sort by: action.split('-')[1]
        break;
      case 'personalize':
        // Open Settings app
        toggleStartMenu();
        break;
      case 'settings':
        // Open Settings app
        toggleStartMenu();
        break;
      default:
        // Unhandled context menu action
        break;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start drag selection if clicking on empty desktop and not on mobile
    if (e.target === e.currentTarget && e.button === 0 && !isMobile) {
      const rect = e.currentTarget.getBoundingClientRect();
      startDragSelection(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragSelection?.active && !isMobile) {
      const rect = e.currentTarget.getBoundingClientRect();
      updateDragSelection(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseUp = () => {
    if (dragSelection?.active && !isMobile) {
      endDragSelection();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only clear selection and hide context menu if clicking on empty desktop
    if (e.target === e.currentTarget) {
      clearSelection();
      hideContextMenu();
    }
  };

  const wallpaperStyle = {
    background: getWallpaperValue(wallpaper),
  };

  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div
      ref={desktopRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={wallpaperStyle}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      {/* Desktop Icons */}
      <div className={`absolute inset-0 z-10 ${isMobile ? 'p-6' : 'p-4'}`}>
        {icons.length > 0 ? (
          icons.map((icon) => (
            <DesktopIcon key={icon.id} icon={icon} />
          ))
        ) : (
          <div className="text-white text-center mt-20 opacity-50">
            No desktop icons
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <motion.button
          onClick={toggleStartMenu}
          className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-[100] ${
            isDark
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 20,
            delay: 0.5 
          }}
        >
          <Grid3X3 size={24} />
        </motion.button>
      )}

      {/* Drag Selection Rectangle - Desktop only */}
      {!isMobile && dragSelection?.active && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
          style={{
            left: Math.min(dragSelection.startX, dragSelection.currentX),
            top: Math.min(dragSelection.startY, dragSelection.currentY),
            width: Math.abs(dragSelection.currentX - dragSelection.startX),
            height: Math.abs(dragSelection.currentY - dragSelection.startY),
          }}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        isTouchDevice ? (
          <TouchContextMenu
            isOpen={true}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            items={contextMenu.items}
            onClose={hideContextMenu}
            onItemClick={(item) => item.action?.()}
          />
        ) : (
          <DesktopContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={hideContextMenu}
            onAction={handleContextAction}
          />
        )
      )}
    </div>
  );
};