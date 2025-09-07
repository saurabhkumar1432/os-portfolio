import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { KeyboardShortcut } from '../types';

interface KeyboardShortcutContextValue {
  pressedKeys: string[];
  isKeyPressed: (key: string) => boolean;
  getSystemShortcuts: () => KeyboardShortcut[];
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextValue | null>(null);

interface KeyboardShortcutProviderProps {
  children: ReactNode;
  enabled?: boolean;
  shortcuts?: KeyboardShortcut[];
}

/**
 * Provider component that manages global keyboard shortcuts for the desktop OS
 */
export const KeyboardShortcutProvider: React.FC<KeyboardShortcutProviderProps> = ({
  children,
  enabled = true,
  shortcuts = []
}) => {
  const keyboardState = useKeyboardShortcuts(shortcuts, { 
    enabled, 
    context: 'desktop' 
  });

  return (
    <KeyboardShortcutContext.Provider value={keyboardState}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
};

/**
 * Hook to access keyboard shortcut context
 */
export const useKeyboardShortcutContext = () => {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error('useKeyboardShortcutContext must be used within a KeyboardShortcutProvider');
  }
  return context;
};

/**
 * Hook for components that need to register their own keyboard shortcuts
 */
export const useComponentKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  options?: { enabled?: boolean; context?: 'desktop' | 'window' | 'app' }
) => {
  return useKeyboardShortcuts(shortcuts, options);
};