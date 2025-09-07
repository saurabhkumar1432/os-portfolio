import { useCallback } from 'react';
import { useRouter, useRouterState } from '@tanstack/react-router';
import { getURLStateService } from '../services/urlStateService';
import type { AppId } from '../types';

/**
 * Hook for interacting with URL state and navigation
 * Using router state for URL parsing and navigation
 */
export function useURLState() {
  const router = useRouter();
  const routerState = useRouterState();

  // Navigation functions
  const navigateToApp = useCallback((
    appId: AppId, 
    options?: {
      windowId?: string;
      bounds?: { x: number; y: number; w: number; h: number };
      maximized?: boolean;
      minimized?: boolean;
    }
  ) => {
    getURLStateService().navigateToApp(appId, options);
  }, []);

  const navigateToProject = useCallback((
    slug: string,
    options?: {
      windowId?: string;
      bounds?: { x: number; y: number; w: number; h: number };
    }
  ) => {
    getURLStateService().navigateToProject(slug, options);
  }, []);

  const navigateToFile = useCallback((
    path?: string,
    options?: {
      windowId?: string;
      bounds?: { x: number; y: number; w: number; h: number };
    }
  ) => {
    getURLStateService().navigateToFile(path, options);
  }, []);

  const navigateToDesktop = useCallback(() => {
    getURLStateService().navigateToDesktop();
  }, []);

  // Current route information (using router state)
  const currentRoute = routerState.location.pathname;
  const currentSearch = routerState.location.search || {};
  
  // Parse current route
  const getCurrentAppId = useCallback((): AppId | null => {
    if (currentRoute.startsWith('/apps/')) {
      const match = currentRoute.match(/^\/apps\/(.+)$/);
      return match ? match[1] as AppId : null;
    }
    if (currentRoute.startsWith('/projects/')) {
      return 'projects';
    }
    if (currentRoute.startsWith('/files')) {
      return 'file-explorer';
    }
    return null;
  }, [currentRoute]);

  const getCurrentProjectSlug = useCallback((): string | null => {
    if (currentRoute.startsWith('/projects/')) {
      const match = currentRoute.match(/^\/projects\/(.+)$/);
      return match ? match[1] : null;
    }
    return null;
  }, [currentRoute]);

  const getCurrentFilePath = useCallback((): string | null => {
    if (currentRoute.startsWith('/files')) {
      // Handle both string and object search params
      if (typeof currentSearch === 'string') {
        const urlParams = new URLSearchParams(currentSearch);
        return urlParams.get('path') || null;
      } else if (currentSearch && typeof currentSearch === 'object') {
        return (currentSearch as any).path || null;
      }
      return null;
    }
    return null;
  }, [currentRoute, currentSearch]);

  // Browser navigation (using router - fallback to false for unsupported features)
  const canGoBack = false; // Router state doesn't expose history length
  const canGoForward = false; // Not accessible with router

  const goBack = useCallback(() => {
    router.history.back();
  }, [router]);

  const goForward = useCallback(() => {
    router.history.forward();
  }, [router]);

  // URL state utilities
  const getWindowStateFromURL = useCallback(() => {
    // Handle both string and object search params
    let windowId = null;
    let bounds: { x?: number; y?: number; w?: number; h?: number } = {};
    let maximized = false;
    let minimized = false;

    if (typeof currentSearch === 'string') {
      const urlParams = new URLSearchParams(currentSearch);
      windowId = urlParams.get('windowId');
      bounds = {
        x: urlParams.get('x') ? parseInt(urlParams.get('x')!) : undefined,
        y: urlParams.get('y') ? parseInt(urlParams.get('y')!) : undefined,
        w: urlParams.get('w') ? parseInt(urlParams.get('w')!) : undefined,
        h: urlParams.get('h') ? parseInt(urlParams.get('h')!) : undefined,
      };
      maximized = urlParams.get('maximized') === 'true';
      minimized = urlParams.get('minimized') === 'true';
    } else if (currentSearch && typeof currentSearch === 'object') {
      const searchObj = currentSearch as any;
      windowId = searchObj.windowId || null;
      bounds = {
        x: searchObj.x ? parseInt(String(searchObj.x)) : undefined,
        y: searchObj.y ? parseInt(String(searchObj.y)) : undefined,
        w: searchObj.w ? parseInt(String(searchObj.w)) : undefined,
        h: searchObj.h ? parseInt(String(searchObj.h)) : undefined,
      };
      maximized = searchObj.maximized === 'true' || searchObj.maximized === true;
      minimized = searchObj.minimized === 'true' || searchObj.minimized === true;
    }

    return {
      windowId,
      bounds,
      maximized,
      minimized,
    };
  }, [currentSearch]);

  const updateWindowStateInURL = useCallback((windowState: {
    windowId?: string;
    bounds?: { x?: number; y?: number; w?: number; h?: number };
    maximized?: boolean;
    minimized?: boolean;
  }) => {
    const currentAppId = getCurrentAppId();
    const currentProjectSlug = getCurrentProjectSlug();
    const currentFilePath = getCurrentFilePath();

    if (currentProjectSlug) {
      navigateToProject(currentProjectSlug, {
        windowId: windowState.windowId,
        bounds: windowState.bounds as any,
      });
    } else if (currentFilePath !== null) {
      navigateToFile(currentFilePath, {
        windowId: windowState.windowId,
        bounds: windowState.bounds as any,
      });
    } else if (currentAppId) {
      navigateToApp(currentAppId, {
        windowId: windowState.windowId,
        bounds: windowState.bounds as any,
        maximized: windowState.maximized,
        minimized: windowState.minimized,
      });
    }
  }, [getCurrentAppId, getCurrentProjectSlug, getCurrentFilePath, navigateToApp, navigateToProject, navigateToFile]);

  return {
    // Navigation
    navigateToApp,
    navigateToProject,
    navigateToFile,
    navigateToDesktop,
    
    // Current state
    currentRoute,
    currentSearch,
    getCurrentAppId,
    getCurrentProjectSlug,
    getCurrentFilePath,
    
    // Browser navigation
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    
    // URL state management
    getWindowStateFromURL,
    updateWindowStateInURL,
  };
}

/**
 * Hook for components that need to sync their state with URL parameters
 */
export function useURLSync() {
  const { getWindowStateFromURL, updateWindowStateInURL } = useURLState();
  
  return {
    getWindowStateFromURL,
    updateWindowStateInURL,
  };
}