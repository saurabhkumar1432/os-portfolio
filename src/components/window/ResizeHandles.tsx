import React from 'react';
import { useResize } from '../../hooks/useResize';
import { useWindowStore } from '../../store/windowStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import type { WindowState, ResizeState } from '../../types';

interface ResizeHandlesProps {
  window: WindowState;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({ window }) => {
  const { resizeState } = useWindowStore();
  const { theme } = usePreferencesStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const resizeHandlers = useResize({
    windowId: window.id,
    onResizeStart: () => {
      // Add visual feedback during resize
      document.body.style.userSelect = 'none';
    },
    onResizeEnd: () => {
      // Remove visual feedback
      document.body.style.userSelect = '';
    },
  });

  // Don't show resize handles for maximized windows
  if (window.maximized) {
    return null;
  }

  const isResizing = resizeState?.windowId === window.id;
  const activeHandle = resizeState?.handle;

  const getHandleClasses = (handle: ResizeState['handle']) => {
    const isActive = isResizing && activeHandle === handle;
    const baseClasses = 'absolute transition-all duration-150';
    const hoverClasses = 'hover:bg-blue-500/30';
    const activeClasses = isActive ? 'bg-blue-500/50' : '';
    
    return `${baseClasses} ${hoverClasses} ${activeClasses}`;
  };

  const getCursorClass = (handle: ResizeState['handle']) => {
    const cursors: Record<ResizeState['handle'], string> = {
      'n': 'cursor-ns-resize',
      's': 'cursor-ns-resize',
      'e': 'cursor-ew-resize',
      'w': 'cursor-ew-resize',
      'ne': 'cursor-nesw-resize',
      'nw': 'cursor-nwse-resize',
      'se': 'cursor-nwse-resize',
      'sw': 'cursor-nesw-resize',
    };
    return cursors[handle];
  };

  return (
    <>
      {/* Corner handles */}
      {/* Top-left corner */}
      <div
        className={`${getHandleClasses('nw')} ${getCursorClass('nw')} -top-1 -left-1 w-3 h-3`}
        onMouseDown={resizeHandlers.onMouseDown('nw')}
        onTouchStart={resizeHandlers.onTouchStart('nw')}
        title="Resize"
      />

      {/* Top-right corner */}
      <div
        className={`${getHandleClasses('ne')} ${getCursorClass('ne')} -top-1 -right-1 w-3 h-3`}
        onMouseDown={resizeHandlers.onMouseDown('ne')}
        onTouchStart={resizeHandlers.onTouchStart('ne')}
        title="Resize"
      />

      {/* Bottom-left corner */}
      <div
        className={`${getHandleClasses('sw')} ${getCursorClass('sw')} -bottom-1 -left-1 w-3 h-3`}
        onMouseDown={resizeHandlers.onMouseDown('sw')}
        onTouchStart={resizeHandlers.onTouchStart('sw')}
        title="Resize"
      />

      {/* Bottom-right corner */}
      <div
        className={`${getHandleClasses('se')} ${getCursorClass('se')} -bottom-1 -right-1 w-3 h-3`}
        onMouseDown={resizeHandlers.onMouseDown('se')}
        onTouchStart={resizeHandlers.onTouchStart('se')}
        title="Resize"
      />

      {/* Edge handles */}
      {/* Top edge */}
      <div
        className={`${getHandleClasses('n')} ${getCursorClass('n')} -top-1 left-3 right-3 h-2`}
        onMouseDown={resizeHandlers.onMouseDown('n')}
        onTouchStart={resizeHandlers.onTouchStart('n')}
        title="Resize"
      />

      {/* Bottom edge */}
      <div
        className={`${getHandleClasses('s')} ${getCursorClass('s')} -bottom-1 left-3 right-3 h-2`}
        onMouseDown={resizeHandlers.onMouseDown('s')}
        onTouchStart={resizeHandlers.onTouchStart('s')}
        title="Resize"
      />

      {/* Left edge */}
      <div
        className={`${getHandleClasses('w')} ${getCursorClass('w')} -left-1 top-3 bottom-3 w-2`}
        onMouseDown={resizeHandlers.onMouseDown('w')}
        onTouchStart={resizeHandlers.onTouchStart('w')}
        title="Resize"
      />

      {/* Right edge */}
      <div
        className={`${getHandleClasses('e')} ${getCursorClass('e')} -right-1 top-3 bottom-3 w-2`}
        onMouseDown={resizeHandlers.onMouseDown('e')}
        onTouchStart={resizeHandlers.onTouchStart('e')}
        title="Resize"
      />

      {/* Visual feedback overlay when resizing */}
      {isResizing && (
        <div className={`absolute inset-0 pointer-events-none border-2 border-blue-500 rounded-lg ${
          isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'
        }`} />
      )}
    </>
  );
};