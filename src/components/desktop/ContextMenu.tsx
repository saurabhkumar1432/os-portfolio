import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useDesktopStore } from '../../store/desktopStore';
import { useAccessibility } from '../AccessibilityProvider';
import type { ContextMenuItem } from '../../types';

interface ContextMenuItemProps {
  item: ContextMenuItem;
  onClose: () => void;
}

const ContextMenuItemComponent: React.FC<ContextMenuItemProps> = ({ item, onClose }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLButtonElement>(null);
  const { announceMessage } = useAccessibility();

  const handleMouseEnter = () => {
    if (item.children && item.children.length > 0) {
      setShowSubmenu(true);
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        setSubmenuPosition({
          x: rect.width - 8, // Slight overlap
          y: 0,
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setShowSubmenu(false);
  };

  const handleClick = () => {
    if (item.action) {
      item.action();
      announceMessage(`${item.label} activated`);
      onClose();
    } else if (item.children && item.children.length > 0) {
      setShowSubmenu(!showSubmenu);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleClick();
        break;
      case 'ArrowRight':
        if (item.children && item.children.length > 0) {
          e.preventDefault();
          setShowSubmenu(true);
        }
        break;
      case 'ArrowLeft':
        if (showSubmenu) {
          e.preventDefault();
          setShowSubmenu(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  if (item.separator) {
    return <div className="border-t border-gray-200 dark:border-gray-700 my-1" />;
  }

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        ref={itemRef}
        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between gap-2 ${
          item.disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={item.disabled}
        role="menuitem"
        aria-haspopup={item.children && item.children.length > 0 ? true : undefined}
        aria-expanded={item.children && item.children.length > 0 ? showSubmenu : undefined}
      >
        <div className="flex items-center gap-2">
          {item.icon && <span className="w-4 h-4 text-xs">{item.icon}</span>}
          {item.label}
        </div>
        {item.children && item.children.length > 0 && (
          <ChevronRight className="w-3 h-3 opacity-60" />
        )}
      </button>

      <AnimatePresence>
        {showSubmenu && item.children && item.children.length > 0 && (
          <motion.div
            className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50 min-w-48"
            style={{
              left: submenuPosition.x,
              top: submenuPosition.y,
            }}
            initial={{ opacity: 0, scale: 0.95, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -10 }}
            transition={{ duration: 0.1 }}
            role="menu"
          >
            {item.children.map((childItem) => (
              <ContextMenuItemComponent
                key={childItem.id}
                item={childItem}
                onClose={onClose}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ContextMenu: React.FC = () => {
  const { contextMenu, hideContextMenu } = useDesktopStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        hideContextMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideContextMenu();
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      
      // Focus the first menu item
      setTimeout(() => {
        const firstButton = menuRef.current?.querySelector('button[role="menuitem"]') as HTMLButtonElement;
        firstButton?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu, hideContextMenu]);

  if (!contextMenu) return null;

  // Adjust position to keep menu within viewport
  const adjustedPosition = {
    x: Math.min(contextMenu.x, window.innerWidth - 200), // 200px estimated menu width
    y: Math.min(contextMenu.y, window.innerHeight - 300), // 300px estimated menu height
  };

  return (
    <motion.div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-[2000] min-w-48"
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      role="menu"
      aria-label="Desktop context menu"
    >
      {contextMenu.items.map((item) => (
        <ContextMenuItemComponent
          key={item.id}
          item={item}
          onClose={hideContextMenu}
        />
      ))}
    </motion.div>
  );
};