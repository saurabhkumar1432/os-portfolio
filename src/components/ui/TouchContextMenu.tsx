import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';
import { usePreferencesStore } from '../../store/preferencesStore';
import type { ContextMenuItem } from '../../types';

interface TouchContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
  onItemClick: (item: ContextMenuItem) => void;
}

export const TouchContextMenu: React.FC<TouchContextMenuProps> = ({
  isOpen,
  position,
  items,
  onClose,
  onItemClick,
}) => {
  const { isMobile, screenWidth, screenHeight } = useResponsive();
  const { theme } = usePreferencesStore();
  const menuRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  // Calculate menu position to keep it on screen
  const getMenuPosition = () => {
    if (!isMobile) return position;

    const menuWidth = 280; // Estimated menu width for mobile
    const menuHeight = items.length * 56 + 16; // Estimated height

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + menuWidth > screenWidth) {
      x = screenWidth - menuWidth - 16;
    }
    if (x < 16) {
      x = 16;
    }

    // Adjust vertical position
    if (y + menuHeight > screenHeight) {
      y = screenHeight - menuHeight - 16;
    }
    if (y < 16) {
      y = 16;
    }

    return { x, y };
  };

  const menuPosition = getMenuPosition();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle item click
  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled && item.action) {
      onItemClick(item);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 z-[9998]"
          onClick={onClose}
        />
      )}

      {/* Context Menu */}
      <AnimatePresence>
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`fixed z-[9999] rounded-lg shadow-xl border ${
            isMobile ? 'min-w-[280px]' : 'min-w-[200px]'
          } ${
            isDark
              ? 'bg-gray-800 border-gray-600'
              : 'bg-white border-gray-200'
          }`}
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
          }}
        >
          <div className={`py-2 ${isMobile ? 'px-1' : 'px-1'}`}>
            {items.map((item, _index) => (
              <React.Fragment key={item.id}>
                {item.separator ? (
                  <div className={`my-1 border-t ${
                    isDark ? 'border-gray-600' : 'border-gray-200'
                  }`} />
                ) : (
                  <TouchContextMenuItem
                    item={item}
                    onClick={() => handleItemClick(item)}
                    isMobile={isMobile}
                    isDark={isDark}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

interface TouchContextMenuItemProps {
  item: ContextMenuItem;
  onClick: () => void;
  isMobile: boolean;
  isDark: boolean;
}

const TouchContextMenuItem: React.FC<TouchContextMenuItemProps> = ({
  item,
  onClick,
  isMobile,
  isDark,
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={item.disabled}
      className={`w-full flex items-center gap-3 text-left transition-colors rounded-md ${
        isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm'
      } ${
        item.disabled
          ? isDark
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-gray-400 cursor-not-allowed'
          : isDark
            ? 'text-gray-200 hover:bg-gray-700 active:bg-gray-600'
            : 'text-gray-800 hover:bg-gray-100 active:bg-gray-200'
      }`}
    >
      {/* Icon */}
      {item.icon && (
        <span className={`flex-shrink-0 ${isMobile ? 'text-lg' : 'text-sm'}`}>
          {item.icon}
        </span>
      )}

      {/* Label */}
      <span className="flex-1 font-medium">
        {item.label}
      </span>

      {/* Submenu indicator */}
      {item.children && item.children.length > 0 && (
        <span className={`flex-shrink-0 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          ▶
        </span>
      )}
    </motion.button>
  );
};