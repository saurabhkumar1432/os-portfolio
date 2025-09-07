import { useEffect, useCallback, useRef, useState } from 'react';
import { useWindowStore } from '../store/windowStore';
import { useStartMenuStore } from '../store/startMenuStore';
import { windowUtils } from '../utils';
import type { KeyboardShortcut } from '../types';

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  context?: 'desktop' | 'window' | 'app';
}

/**
 * Hook for managing keyboard shortcuts with support for global and contextual shortcuts
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[] = [],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true, context = 'desktop' } = options;
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const [pressedKeysState, setPressedKeysState] = useState<string[]>([]);
  const windowStore = useWindowStore();
  const startMenuStore = useStartMenuStore();

  // Normalize key names for consistent comparison
  const normalizeKey = useCallback((key: string): string => {
    const keyMap: Record<string, string> = {
      ' ': 'Space',
      'Meta': 'Win',
      'OS': 'Win',
      'Control': 'Ctrl',
      'Alt': 'Alt',
      'Shift': 'Shift',
      'Escape': 'Esc',
      'ArrowUp': 'Up',
      'ArrowDown': 'Down',
      'ArrowLeft': 'Left',
      'ArrowRight': 'Right',
    };
    
    return keyMap[key] || key;
  }, []);

  // Check if a shortcut matches the currently pressed keys
  const matchesShortcut = useCallback((shortcut: KeyboardShortcut, pressedKeys: Set<string>): boolean => {
    // All shortcut keys must be pressed, but there can be additional keys pressed
    return shortcut.keys.every(key => pressedKeys.has(normalizeKey(key)));
  }, [normalizeKey]);

  // Get default system shortcuts
  const getSystemShortcuts = useCallback((): KeyboardShortcut[] => {
    return [
      // Start menu
      {
        id: 'open-start-menu',
        keys: ['Win'],
        description: 'Open Start menu',
        action: () => {
          startMenuStore.toggleStartMenu();
        },
        preventDefault: true,
        global: true,
        context: 'desktop'
      },
      
      // Window cycling
      {
        id: 'cycle-windows',
        keys: ['Alt', 'Tab'],
        description: 'Cycle through open windows',
        action: () => {
          const visibleWindows = windowStore.getVisibleWindows();
          if (visibleWindows.length > 1) {
            const focusedWindow = windowStore.getFocusedWindow();
            const currentIndex = focusedWindow 
              ? visibleWindows.findIndex(w => w.id === focusedWindow.id)
              : -1;
            const nextIndex = (currentIndex + 1) % visibleWindows.length;
            windowStore.focusWindow(visibleWindows[nextIndex].id);
          }
        },
        preventDefault: true,
        global: true,
        context: 'desktop'
      },

      // Window snapping - Left
      {
        id: 'snap-window-left',
        keys: ['Win', 'Left'],
        description: 'Snap window to left half',
        action: () => {
          const focusedWindow = windowStore.getFocusedWindow();
          if (focusedWindow) {
            const snapBounds = windowUtils.getSnapBounds('left', window.innerWidth, window.innerHeight);
            windowStore.updateWindowBounds(focusedWindow.id, snapBounds);
            windowStore.updateWindowSnapState(focusedWindow.id, 'left');
          }
        },
        preventDefault: true,
        global: true,
        context: 'desktop'
      },

      // Window snapping - Right
      {
        id: 'snap-window-right',
        keys: ['Win', 'Right'],
        description: 'Snap window to right half',
        action: () => {
          const focusedWindow = windowStore.getFocusedWindow();
          if (focusedWindow) {
            const snapBounds = windowUtils.getSnapBounds('right', window.innerWidth, window.innerHeight);
            windowStore.updateWindowBounds(focusedWindow.id, snapBounds);
            windowStore.updateWindowSnapState(focusedWindow.id, 'right');
          }
        },
        preventDefault: true,
        global: true,
        context: 'desktop'
      },

      // Window maximize
      {
        id: 'maximize-window',
        keys: ['Win', 'Up'],
        description: 'Maximize focused window',
        action: () => {
          const focusedWindow = windowStore.getFocusedWindow();
          if (focusedWindow) {
            const snapBounds = windowUtils.getSnapBounds('maximized', window.innerWidth, window.innerHeight);
            windowStore.updateWindowBounds(focusedWindow.id, snapBounds);
            windowStore.updateWindowSnapState(focusedWindow.id, 'maximized');
            // Also update the maximized state in the store
            if (!focusedWindow.maximized) {
              windowStore.maximizeWindow(focusedWindow.id);
            }
          }
        },
        preventDefault: true,
        global: true,
        context: 'desktop'
      },

      // Close window
      {
        id: 'close-window',
        keys: ['Ctrl', 'w'],
        description: 'Close focused window',
        action: () => {
          const focusedWindow = windowStore.getFocusedWindow();
          if (focusedWindow) {
            windowStore.requestCloseWindow(focusedWindow.id);
          }
        },
        preventDefault: true,
        global: true,
        context: 'window'
      },

      // Minimize window
      {
        id: 'minimize-window',
        keys: ['Ctrl', 'm'],
        description: 'Minimize focused window',
        action: () => {
          const focusedWindow = windowStore.getFocusedWindow();
          if (focusedWindow) {
            windowStore.minimizeWindow(focusedWindow.id);
          }
        },
        preventDefault: true,
        global: true,
        context: 'window'
      },

      // Fullscreen toggle
      {
        id: 'toggle-fullscreen',
        keys: ['F11'],
        description: 'Toggle fullscreen mode',
        action: () => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
        },
        preventDefault: true,
        global: true,
        context: 'desktop'
      }
    ];
  }, [windowStore, startMenuStore]);

  // Handle keydown events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const key = normalizeKey(event.key);
    pressedKeysRef.current.add(key);
    setPressedKeysState(Array.from(pressedKeysRef.current));

    // Combine system shortcuts with custom shortcuts
    const allShortcuts = [...getSystemShortcuts(), ...shortcuts];
    
    // Find matching shortcuts and prioritize by specificity (more keys = higher priority)
    const matchingShortcuts = allShortcuts
      .filter(shortcut => {
        const matches = matchesShortcut(shortcut, pressedKeysRef.current);
        const contextMatches = shortcut.global || shortcut.context === context;
        return matches && contextMatches;
      })
      .sort((a, b) => b.keys.length - a.keys.length); // Sort by key count descending
    
    const matchingShortcut = matchingShortcuts[0]; // Take the most specific match

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      try {
        matchingShortcut.action();
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error);
      }
    }
  }, [enabled, context, shortcuts, normalizeKey, matchesShortcut, getSystemShortcuts]);

  // Handle keyup events
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = normalizeKey(event.key);
    pressedKeysRef.current.delete(key);
    setPressedKeysState(Array.from(pressedKeysRef.current));
  }, [normalizeKey]);

  // Clear pressed keys when window loses focus
  const handleBlur = useCallback(() => {
    pressedKeysRef.current.clear();
    setPressedKeysState([]);
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, handleKeyDown, handleKeyUp, handleBlur]);

  // Return utility functions
  return {
    pressedKeys: pressedKeysState,
    isKeyPressed: (key: string) => pressedKeysRef.current.has(normalizeKey(key)),
    getSystemShortcuts,
  };
};