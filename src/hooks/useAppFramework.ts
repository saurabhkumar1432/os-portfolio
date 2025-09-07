import { useCallback, useEffect, useRef } from 'react';
import { useWindowStore } from '../store/windowStore';
import { windowLifecycleManager } from '../services/windowLifecycleManager';
import { useAccessibilitySettings } from './useAccessibilitySettings';
import type { AppId, AppProps, WindowState } from '../types';
import { appLauncher, appLifecycleManager, type AppLifecycleEvent } from '../services';

interface UseAppFrameworkOptions {
  appId: AppId;
  windowId: string;
  onTitleChange?: (title: string) => void;
  onUnsavedStateChange?: (hasUnsaved: boolean) => void;
}

/**
 * Hook for individual app framework integration
 * Provides lifecycle management for specific app instances
 */
export function useAppFramework({
  appId,
  windowId,
  onTitleChange,
  onUnsavedStateChange
}: UseAppFrameworkOptions) {
  const { windows, updateWindow } = useWindowStore();
  const { announceToScreenReader } = useAccessibilitySettings();
  const previousStateRef = useRef<Partial<WindowState>>({});
  
  const window = windows[windowId];
  const isFocused = window?.focused || false;
  const isMinimized = window?.minimized || false;

  // Register window with lifecycle manager
  useEffect(() => {
    windowLifecycleManager.registerWindow(windowId, appId);
    
    return () => {
      windowLifecycleManager.unregisterWindow(windowId);
    };
  }, [windowId, appId]);

  // Handle window state changes
  useEffect(() => {
    if (window) {
      const currentState = {
        focused: window.focused,
        minimized: window.minimized,
        maximized: window.maximized,
      };

      windowLifecycleManager.handleWindowStateChange(
        windowId,
        previousStateRef.current,
        currentState
      );

      previousStateRef.current = currentState;
    }
  }, [windowId, window?.focused, window?.minimized, window?.maximized]);

  // Handle title changes
  const handleTitleChange = useCallback((title: string) => {
    if (window && window.title !== title) {
      updateWindow(windowId, { title });
      onTitleChange?.(title);
    }
  }, [windowId, window?.title, updateWindow, onTitleChange]);

  // Handle unsaved state changes
  const handleUnsavedStateChange = useCallback((hasUnsaved: boolean) => {
    if (window && window.hasUnsavedState !== hasUnsaved) {
      updateWindow(windowId, { hasUnsavedState: hasUnsaved });
      onUnsavedStateChange?.(hasUnsaved);
      
      // Announce state change for accessibility
      if (hasUnsaved) {
        announceToScreenReader(`${window.title} has unsaved changes`);
      }
    }
  }, [windowId, window, updateWindow, onUnsavedStateChange, announceToScreenReader]);

  // Handle focus events
  const handleFocus = useCallback(() => {
    if (window && !window.focused) {
      windowLifecycleManager.handleWindowFocus(windowId);
    }
  }, [windowId, window?.focused]);

  // Keyboard shortcuts for window management
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isFocused) return;

    // Ctrl+W: Close window
    if (event.ctrlKey && event.key === 'w') {
      event.preventDefault();
      const { closeWindow } = useWindowStore.getState();
      closeWindow(windowId);
    }

    // Ctrl+M: Minimize window
    if (event.ctrlKey && event.key === 'm') {
      event.preventDefault();
      const { minimizeWindow } = useWindowStore.getState();
      minimizeWindow(windowId);
    }

    // F11: Toggle fullscreen
    if (event.key === 'F11') {
      event.preventDefault();
      const { maximizeWindow } = useWindowStore.getState();
      maximizeWindow(windowId);
    }
  }, [windowId, isFocused]);

  // Set up global keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    window,
    isFocused,
    isMinimized,
    handleTitleChange,
    handleUnsavedStateChange,
    handleFocus,
  };
}

/**
 * Hook for general app framework functionality
 * Provides easy access to app launching, lifecycle management, and event handling
 */
export function useAppLauncher() {
  const listenerIdRef = useRef<string | undefined>(undefined);

  // Cleanup listener on unmount
  useEffect(() => {
    return () => {
      if (listenerIdRef.current) {
        appLifecycleManager.removeEventListener(listenerIdRef.current);
      }
    };
  }, []);

  const launchApp = useCallback(async (appId: AppId, options?: Parameters<typeof appLauncher.launchApp>[1]) => {
    return appLauncher.launchApp(appId, options);
  }, []);

  const closeApp = useCallback(async (windowId: string, force = false) => {
    return appLauncher.closeApp(windowId, force);
  }, []);

  const focusApp = useCallback((windowId: string) => {
    appLauncher.focusApp(windowId);
  }, []);

  const getRunningApps = useCallback(() => {
    return appLauncher.getRunningApps();
  }, []);

  const canLaunchApp = useCallback((appId: AppId) => {
    return appLauncher.canLaunchApp(appId);
  }, []);

  const getAppInfo = useCallback((appId: AppId) => {
    return appLauncher.getAppInfo(appId);
  }, []);

  const addEventListener = useCallback((listener: (event: AppLifecycleEvent) => void) => {
    const id = `hook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    listenerIdRef.current = id;
    appLifecycleManager.addEventListener(id, listener);
    
    return () => {
      appLifecycleManager.removeEventListener(id);
      if (listenerIdRef.current === id) {
        listenerIdRef.current = undefined;
      }
    };
  }, []);

  return {
    launchApp,
    closeApp,
    focusApp,
    getRunningApps,
    canLaunchApp,
    getAppInfo,
    addEventListener,
  };
}

/**
 * Hook for app component integration
 * Provides lifecycle management for individual app components
 */
export function useAppComponent(props: AppProps) {
  const { windowId, focused, onTitleChange, onUnsavedStateChange } = props;

  // Handle focus/blur events
  useEffect(() => {
    // This will be called when the focused prop changes
    // The actual focus/blur is handled by the window manager
  }, [focused]);

  const setTitle = useCallback((title: string) => {
    onTitleChange(title);
  }, [onTitleChange]);

  const setUnsavedState = useCallback((hasUnsaved: boolean) => {
    onUnsavedStateChange(hasUnsaved);
  }, [onUnsavedStateChange]);

  return {
    windowId,
    focused,
    setTitle,
    setUnsavedState,
  };
}

/**
 * Hook for desktop integration
 * Provides methods for launching apps from desktop icons, start menu, etc.
 */
export function useDesktopIntegration() {
  const launchFromDesktop = useCallback(async (appId: AppId) => {
    return appLauncher.launchAppFromDesktop(appId);
  }, []);

  const launchFromStartMenu = useCallback(async (appId: AppId) => {
    return appLauncher.launchAppFromStartMenu(appId);
  }, []);

  const launchWithData = useCallback(async (appId: AppId, data: Record<string, unknown>) => {
    return appLauncher.launchAppWithData(appId, data);
  }, []);

  return {
    launchFromDesktop,
    launchFromStartMenu,
    launchWithData,
  };
}