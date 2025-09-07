import type { WindowState, AppId } from '@/types';

// Window constraint constants
export const WINDOW_CONSTRAINTS = {
  MIN_WIDTH: 320,
  MIN_HEIGHT: 240,
  TASKBAR_HEIGHT: 48,
  TITLE_BAR_HEIGHT: 32,
} as const;

// Window positioning utilities
export const windowUtils = {
  /**
   * Ensures window bounds are within viewport constraints
   */
  constrainWindowBounds: (
    bounds: WindowState['bounds'],
    viewportWidth: number,
    viewportHeight: number
  ): WindowState['bounds'] => {
    const { MIN_WIDTH, MIN_HEIGHT, TASKBAR_HEIGHT } = WINDOW_CONSTRAINTS;
    
    // Ensure minimum size
    const width = Math.max(bounds.w, MIN_WIDTH);
    const height = Math.max(bounds.h, MIN_HEIGHT);
    
    // Ensure window stays within viewport
    const maxX = viewportWidth - width;
    const maxY = viewportHeight - height - TASKBAR_HEIGHT;
    
    const x = Math.max(0, Math.min(bounds.x, maxX));
    const y = Math.max(0, Math.min(bounds.y, maxY));
    
    return { x, y, w: width, h: height };
  },

  /**
   * Calculates default window position with cascade offset
   */
  getDefaultWindowPosition: (
    existingWindows: WindowState[],
    defaultSize: { width: number; height: number }
  ): { x: number; y: number; w: number; h: number } => {
    const CASCADE_OFFSET = 30;
    const BASE_X = 100;
    const BASE_Y = 100;
    
    const windowCount = existingWindows.length;
    const offset = (windowCount % 10) * CASCADE_OFFSET;
    
    return {
      x: BASE_X + offset,
      y: BASE_Y + offset,
      w: defaultSize.width,
      h: defaultSize.height,
    };
  },

  /**
   * Calculates snap bounds for window snapping
   */
  getSnapBounds: (
    snapState: 'left' | 'right' | 'maximized',
    viewportWidth: number,
    viewportHeight: number
  ): WindowState['bounds'] => {
    const { TASKBAR_HEIGHT } = WINDOW_CONSTRAINTS;
    const availableHeight = viewportHeight - TASKBAR_HEIGHT;
    
    switch (snapState) {
      case 'left':
        return {
          x: 0,
          y: 0,
          w: Math.floor(viewportWidth / 2),
          h: availableHeight,
        };
      case 'right':
        return {
          x: Math.floor(viewportWidth / 2),
          y: 0,
          w: Math.floor(viewportWidth / 2),
          h: availableHeight,
        };
      case 'maximized':
        return {
          x: 0,
          y: 0,
          w: viewportWidth,
          h: availableHeight,
        };
      default:
        throw new Error(`Invalid snap state: ${snapState}`);
    }
  },

  /**
   * Checks if a point is within window bounds
   */
  isPointInWindow: (
    point: { x: number; y: number },
    window: WindowState
  ): boolean => {
    const { x, y, w, h } = window.bounds;
    return (
      point.x >= x &&
      point.x <= x + w &&
      point.y >= y &&
      point.y <= y + h
    );
  },

  /**
   * Generates a unique window ID
   */
  generateWindowId: (appId: AppId): string => {
    return `${appId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Calculates z-index for a window based on focus order
   */
  calculateZIndex: (windowId: string, zOrder: string[]): number => {
    const index = zOrder.indexOf(windowId);
    return index === -1 ? 1 : index + 1;
  },
};

// App registry utilities
export const appUtils = {
  /**
   * Gets default app configuration
   */
  getDefaultAppConfig: (appId: AppId) => {
    const configs = {
      'projects': {
        name: 'Projects',
        icon: 'folder',
        defaultSize: { width: 900, height: 600 },
        minSize: { width: 600, height: 400 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      },
      'file-explorer': {
        name: 'File Explorer',
        icon: 'folder-open',
        defaultSize: { width: 800, height: 500 },
        minSize: { width: 500, height: 350 },
        resizable: true,
        maximizable: true,
        multiInstance: true,
      },
      'terminal': {
        name: 'Terminal',
        icon: 'terminal',
        defaultSize: { width: 700, height: 400 },
        minSize: { width: 400, height: 250 },
        resizable: true,
        maximizable: true,
        multiInstance: true,
      },
      'about': {
        name: 'About',
        icon: 'user',
        defaultSize: { width: 600, height: 500 },
        minSize: { width: 400, height: 350 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      },
      'notepad': {
        name: 'Notepad',
        icon: 'file-text',
        defaultSize: { width: 600, height: 400 },
        minSize: { width: 400, height: 300 },
        resizable: true,
        maximizable: true,
        multiInstance: true,
      },
      'settings': {
        name: 'Settings',
        icon: 'settings',
        defaultSize: { width: 500, height: 600 },
        minSize: { width: 400, height: 500 },
        resizable: true,
        maximizable: false,
        multiInstance: false,
      },
      'resume-viewer': {
        name: 'Resume',
        icon: 'file',
        defaultSize: { width: 800, height: 900 },
        minSize: { width: 600, height: 700 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      },
    };
    
    return configs[appId];
  },
};

// Keyboard shortcut utilities
export const keyboardUtils = {
  /**
   * Checks if a keyboard event matches a shortcut
   */
  matchesShortcut: (
    event: KeyboardEvent,
    shortcut: {
      key: string;
      ctrl?: boolean;
      alt?: boolean;
      shift?: boolean;
      meta?: boolean;
    }
  ): boolean => {
    return (
      event.key.toLowerCase() === shortcut.key.toLowerCase() &&
      !!event.ctrlKey === !!shortcut.ctrl &&
      !!event.altKey === !!shortcut.alt &&
      !!event.shiftKey === !!shortcut.shift &&
      !!event.metaKey === !!shortcut.meta
    );
  },

  /**
   * Prevents default behavior for handled shortcuts
   */
  handleShortcut: (event: KeyboardEvent, handler: () => void): void => {
    event.preventDefault();
    event.stopPropagation();
    handler();
  },
};

// CSS class name utilities
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Performance utilities
export const performanceUtils = {
  /**
   * Debounces a function call
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttles a function call
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

// Export performance monitor
export { performanceMonitor } from './performanceMonitor';
