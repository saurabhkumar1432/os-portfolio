import { useEffect, useCallback, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { deepLinkService } from '../services/deepLinkService';
import type { AppId } from '../types';

/**
 * Hook for handling deep link restoration in components
 */
export function useDeepLinkRestoration() {
  const routerState = useRouterState();
  const [isRestoring, setIsRestoring] = useState(false);
  const [restorationError, setRestorationError] = useState<string | null>(null);

  // Restore state when the component mounts or route changes
  useEffect(() => {
    const restoreState = async () => {
      setIsRestoring(true);
      setRestorationError(null);

      try {
        const success = await deepLinkService.restoreFromCurrentURL();
        if (!success) {
          setRestorationError('Failed to restore application state from URL');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown restoration error';
        setRestorationError(errorMessage);
        
        // Try to handle the invalid URL
        try {
          await deepLinkService.handleInvalidURL(routerState.location.pathname, error as Error);
        } catch (fallbackError) {
          console.error('Failed to handle invalid URL:', fallbackError);
        }
      } finally {
        setIsRestoring(false);
      }
    };

    restoreState();
  }, []); // Only run on mount for now

  // Manual restoration function
  const restoreFromURL = useCallback(async (pathname: string, searchParams: any) => {
    setIsRestoring(true);
    setRestorationError(null);

    try {
      const success = await deepLinkService.restoreFromURL(pathname, searchParams);
      if (!success) {
        setRestorationError('Failed to restore state from specified URL');
      }
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown restoration error';
      setRestorationError(errorMessage);
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  // Save current state for restoration
  const saveStateForRestoration = useCallback((windowId: string) => {
    try {
      deepLinkService.saveWindowStateForRestoration(windowId);
    } catch (error) {
      console.error('Failed to save state for restoration:', error);
    }
  }, []);

  // Clear restoration attempts
  const clearRestorationAttempts = useCallback(() => {
    deepLinkService.clearRestorationAttempts(
      routerState.location.pathname,
      routerState.location.search
    );
  }, [routerState.location.pathname, routerState.location.search]);

  return {
    isRestoring,
    restorationError,
    restoreFromURL,
    saveStateForRestoration,
    clearRestorationAttempts,
  };
}

/**
 * Hook for app components to handle deep link events
 */
export function useDeepLinkEvents(appId: AppId) {
  const [deepLinkData, setDeepLinkData] = useState<any>(null);

  useEffect(() => {
    const handleProjectSelect = (event: CustomEvent) => {
      if (appId === 'projects') {
        setDeepLinkData({ type: 'project-select', ...event.detail });
      }
    };

    const handleFileNavigate = (event: CustomEvent) => {
      if (appId === 'file-explorer') {
        setDeepLinkData({ type: 'file-navigate', ...event.detail });
      }
    };

    const handleProjectDeepLink = (event: CustomEvent) => {
      if (appId === 'projects') {
        setDeepLinkData({ type: 'deep-link', ...event.detail });
      }
    };

    const handleFileExplorerDeepLink = (event: CustomEvent) => {
      if (appId === 'file-explorer') {
        setDeepLinkData({ type: 'deep-link', ...event.detail });
      }
    };

    // Listen for deep link events
    window.addEventListener('deep-link-project-select', handleProjectSelect as EventListener);
    window.addEventListener('deep-link-file-navigate', handleFileNavigate as EventListener);
    window.addEventListener('project-deep-link', handleProjectDeepLink as EventListener);
    window.addEventListener('file-explorer-deep-link', handleFileExplorerDeepLink as EventListener);

    return () => {
      window.removeEventListener('deep-link-project-select', handleProjectSelect as EventListener);
      window.removeEventListener('deep-link-file-navigate', handleFileNavigate as EventListener);
      window.removeEventListener('project-deep-link', handleProjectDeepLink as EventListener);
      window.removeEventListener('file-explorer-deep-link', handleFileExplorerDeepLink as EventListener);
    };
  }, [appId]);

  // Clear deep link data after it's been processed
  const clearDeepLinkData = useCallback(() => {
    setDeepLinkData(null);
  }, []);

  return {
    deepLinkData,
    clearDeepLinkData,
  };
}

/**
 * Hook for window components to automatically save state for restoration
 */
export function useWindowStateRestoration(windowId: string, enabled = true) {
  const { saveStateForRestoration } = useDeepLinkRestoration();

  useEffect(() => {
    if (!enabled || !windowId) return;

    // Save state periodically
    const saveInterval = setInterval(() => {
      saveStateForRestoration(windowId);
    }, 5000); // Save every 5 seconds

    // Save state on window events
    const handleBeforeUnload = () => {
      saveStateForRestoration(windowId);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveStateForRestoration(windowId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Save state one final time
      saveStateForRestoration(windowId);
    };
  }, [windowId, enabled, saveStateForRestoration]);
}

/**
 * Hook for handling URL validation and fallback behavior
 */
export function useURLValidation() {
  const routerState = useRouterState();
  const [isValidURL, setIsValidURL] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const validateURL = () => {
      const { pathname, search } = routerState.location;
      
      try {
        // Validate app routes
        if (pathname.startsWith('/apps/')) {
          const appId = pathname.match(/^\/apps\/(.+)$/)?.[1];
          const validAppIds = ['projects', 'file-explorer', 'terminal', 'about', 'notepad', 'settings', 'resume-viewer'];
          
          if (!appId || !validAppIds.includes(appId)) {
            throw new Error(`Invalid app ID: ${appId}`);
          }
        }

        // Validate project routes
        if (pathname.startsWith('/projects/')) {
          const slug = pathname.match(/^\/projects\/(.+)$/)?.[1];
          if (!slug || slug.length === 0) {
            throw new Error('Invalid project slug');
          }
        }

        // Validate search parameters
        if (search && typeof search === 'object') {
          const params = search as any;
          
          // Validate numeric parameters
          if (params.x !== undefined && (typeof params.x !== 'number' || isNaN(params.x))) {
            throw new Error('Invalid x coordinate');
          }
          if (params.y !== undefined && (typeof params.y !== 'number' || isNaN(params.y))) {
            throw new Error('Invalid y coordinate');
          }
          if (params.w !== undefined && (typeof params.w !== 'number' || isNaN(params.w) || params.w < 320)) {
            throw new Error('Invalid width');
          }
          if (params.h !== undefined && (typeof params.h !== 'number' || isNaN(params.h) || params.h < 240)) {
            throw new Error('Invalid height');
          }

          // Validate boolean parameters
          if (params.maximized !== undefined && typeof params.maximized !== 'boolean') {
            throw new Error('Invalid maximized state');
          }
          if (params.minimized !== undefined && typeof params.minimized !== 'boolean') {
            throw new Error('Invalid minimized state');
          }
        }

        setIsValidURL(true);
        setValidationError(null);
      } catch (error) {
        setIsValidURL(false);
        setValidationError(error instanceof Error ? error.message : 'Unknown validation error');
      }
    };

    validateURL();
  }, []); // Only run on mount for now

  return {
    isValidURL,
    validationError,
  };
}