import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDesktopStore } from '../../store/desktopStore';
import { useWindowStore } from '../../store/windowStore';
import { useAccessibility } from '../AccessibilityProvider';
import { FocusRing } from '../ui';
import { appLauncher } from '../../services/appLauncher';
import type { DesktopIcon as DesktopIconType } from '../../types';

interface DesktopIconProps {
  icon: DesktopIconType;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ icon }) => {
  const { iconSize, selectIcon } = useDesktopStore();
  const { createWindow } = useWindowStore();
  const { registerFocusableElement, unregisterFocusableElement, announceMessage, isReducedMotion } = useAccessibility();
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const multiSelect = e.ctrlKey || e.metaKey;
    const rangeSelect = e.shiftKey;
    
    if (rangeSelect) {
      // TODO: Implement range selection logic
      selectIcon(icon.id, true);
    } else if (multiSelect) {
      // For multi-select (Ctrl/Cmd+click), always pass true to toggle selection
      selectIcon(icon.id, true);
    } else {
      // For regular click, pass false to select only this icon
      selectIcon(icon.id, false);
    }
    
    if (icon.selected) {
      announceMessage(`${icon.label} selected`);
    } else {
      announceMessage(`${icon.label} deselected`);
    }
  };

  const handleDoubleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (icon.appId) {
      try {
        const result = await appLauncher.launchApp(icon.appId);
        if (result.success) {
          announceMessage(`Opening ${icon.label}`);
        } else {
          announceMessage(`Failed to open ${icon.label}`);
          console.error('Failed to launch app:', result.error);
        }
      } catch (error) {
        announceMessage(`Error opening ${icon.label}`);
        console.error('Error launching app:', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (icon.appId) {
          createWindow(icon.appId);
          announceMessage(`Opening ${icon.label}`);
        }
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        // Handle delete action if needed
        announceMessage(`${icon.label} delete action`);
        break;
    }
  };

  const getSizeClasses = () => {
    switch (iconSize) {
      case 'sm':
        return 'w-12 h-12 text-xs';
      case 'lg':
        return 'w-20 h-20 text-sm';
      default:
        return 'w-16 h-16 text-xs';
    }
  };

  const getIconContent = () => {
    // For now, using simple colored squares as placeholders
    // These will be replaced with proper icons later
    const iconColors: Record<string, string> = {
      'projects': 'bg-blue-500',
      'file-explorer': 'bg-yellow-500',
      'terminal': 'bg-green-500',
      'about': 'bg-purple-500',
      'notepad': 'bg-orange-500',
      'settings': 'bg-gray-500',
      'resume-viewer': 'bg-red-500',
    };

    const colorClass = icon.appId ? iconColors[icon.appId] || 'bg-gray-400' : 'bg-gray-400';
    
    return (
      <div className={`w-full h-full rounded-lg ${colorClass} flex items-center justify-center text-white font-bold`}>
        {icon.label.charAt(0).toUpperCase()}
      </div>
    );
  };

  const getIconSize = () => {
    switch (iconSize) {
      case 'sm': return { width: 48, height: 64 }; // 12*4 + 16 for label
      case 'lg': return { width: 80, height: 96 }; // 20*4 + 16 for label  
      default: return { width: 64, height: 80 }; // 16*4 + 16 for label
    }
  };

  const updateDragConstraints = () => {
    const iconDimensions = getIconSize();
    const taskbarHeight = 48;
    const padding = 8; // Small padding from edges
    
    const maxX = Math.max(0, window.innerWidth - iconDimensions.width - padding);
    const maxY = Math.max(0, window.innerHeight - taskbarHeight - iconDimensions.height - padding);
    
    setDragConstraints({
      left: padding,
      right: maxX,
      top: padding,
      bottom: maxY
    });
  };

  useEffect(() => {
    updateDragConstraints();
    
    const handleResize = () => updateDragConstraints();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [iconSize]);

  // Register with focus management
  useEffect(() => {
    if (iconRef.current) {
      const cleanup = registerFocusableElement(
        icon.id,
        iconRef.current,
        'desktop-icon',
        0 // High priority for desktop icons
      );
      
      return cleanup;
    }
  }, [icon.id, registerFocusableElement]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unregisterFocusableElement(icon.id);
    };
  }, [icon.id, unregisterFocusableElement]);

  const constrainPosition = (x: number, y: number) => {
    const iconDimensions = getIconSize();
    const taskbarHeight = 48;
    const padding = 8;
    
    const maxX = Math.max(0, window.innerWidth - iconDimensions.width - padding);
    const maxY = Math.max(0, window.innerHeight - taskbarHeight - iconDimensions.height - padding);
    
    return {
      x: Math.max(padding, Math.min(x, maxX)),
      y: Math.max(padding, Math.min(y, maxY))
    };
  };

  return (
    <FocusRing>
      <motion.div
        ref={iconRef}
        id={icon.id}
        className={`absolute flex flex-col items-center cursor-pointer select-none ${getSizeClasses()}`}
        style={{ 
          left: icon.x, 
          top: icon.y,
          userSelect: 'none'
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        whileHover={!isReducedMotion ? { scale: 1.05 } : {}}
        whileTap={!isReducedMotion ? { scale: 0.95 } : {}}
        drag
        dragMomentum={false}
        dragConstraints={dragConstraints}
        dragElastic={0}
        onDragStart={() => {
          // If this icon isn't selected, select it and deselect others
          if (!icon.selected) {
            useDesktopStore.getState().selectIcon(icon.id, false);
          }
        }}
        onDragEnd={(_, info) => {
          const store = useDesktopStore.getState();
          const selectedIcons = store.icons.filter(i => i.selected);
          
          if (selectedIcons.length > 1) {
            // Move all selected icons by the same offset
            const updates = selectedIcons.map(selectedIcon => {
              const newPosition = constrainPosition(
                selectedIcon.x + info.offset.x,
                selectedIcon.y + info.offset.y
              );
              return {
                id: selectedIcon.id,
                x: newPosition.x,
                y: newPosition.y,
              };
            });
            store.updateMultipleIconPositions(updates);
            announceMessage(`${selectedIcons.length} icons moved`);
          } else {
            // Move single icon
            const newPosition = constrainPosition(
              icon.x + info.offset.x,
              icon.y + info.offset.y
            );
            store.updateIconPosition(icon.id, newPosition.x, newPosition.y);
            announceMessage(`${icon.label} moved`);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`${icon.label} desktop icon${icon.selected ? ', selected' : ''}`}
        aria-describedby={`${icon.id}-description`}
        draggable={false}
      >
        {/* Icon */}
        <div className={`${getSizeClasses()} mb-1`}>
          {getIconContent()}
        </div>
        
        {/* Selection indicator */}
        {icon.selected && (
          <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 rounded-lg pointer-events-none" />
        )}

        {/* Label */}
        <div
          className={`text-center text-white drop-shadow-lg max-w-20 leading-tight ${
            icon.selected ? 'bg-blue-500/70 px-1 rounded' : ''
          }`}
        >
          {icon.label}
        </div>

        {/* Screen reader description */}
        <div id={`${icon.id}-description`} className="sr-only">
          {icon.appId ? `Double-click or press Enter to open ${icon.label}` : `${icon.label} icon`}
        </div>
      </motion.div>
    </FocusRing>
  );
};