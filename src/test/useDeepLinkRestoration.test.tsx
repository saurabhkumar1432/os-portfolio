import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeepLinkRestoration, useDeepLinkEvents, useURLValidation } from '../hooks/useDeepLinkRestoration';

// Mock TanStack Router
const mockRouterState = {
  location: {
    pathname: '/apps/projects',
    search: { x: 100, y: 200 },
  },
};

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({}),
  useRouterState: () => mockRouterState,
}));

// Mock deep link service
vi.mock('../services/deepLinkService', () => ({
  deepLinkService: {
    restoreFromCurrentURL: vi.fn(),
    restoreFromURL: vi.fn(),
    saveWindowStateForRestoration: vi.fn(),
    clearRestorationAttempts: vi.fn(),
    handleInvalidURL: vi.fn(),
  },
}));

describe('useDeepLinkRestoration', () => {
  let mockDeepLinkService: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { deepLinkService } = await import('../services/deepLinkService');
    mockDeepLinkService = deepLinkService;
    
    mockDeepLinkService.restoreFromCurrentURL.mockResolvedValue(true);
  });

  it('should restore state on mount', async () => {
    renderHook(() => useDeepLinkRestoration());

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockDeepLinkService.restoreFromCurrentURL).toHaveBeenCalled();
  });

  it('should handle restoration success', async () => {
    mockDeepLinkService.restoreFromCurrentURL.mockResolvedValue(true);

    const { result } = renderHook(() => useDeepLinkRestoration());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isRestoring).toBe(false);
    expect(result.current.restorationError).toBe(null);
  });

  it('should handle restoration failure', async () => {
    mockDeepLinkService.restoreFromCurrentURL.mockResolvedValue(false);

    const { result } = renderHook(() => useDeepLinkRestoration());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isRestoring).toBe(false);
    expect(result.current.restorationError).toBe('Failed to restore application state from URL');
  });

  it('should handle restoration error', async () => {
    const testError = new Error('Test restoration error');
    mockDeepLinkService.restoreFromCurrentURL.mockRejectedValue(testError);
    mockDeepLinkService.handleInvalidURL.mockResolvedValue(true);

    const { result } = renderHook(() => useDeepLinkRestoration());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isRestoring).toBe(false);
    expect(result.current.restorationError).toBe('Test restoration error');
    expect(mockDeepLinkService.handleInvalidURL).toHaveBeenCalledWith('/apps/projects', testError);
  });

  it('should provide manual restoration function', async () => {
    mockDeepLinkService.restoreFromURL.mockResolvedValue(true);

    const { result } = renderHook(() => useDeepLinkRestoration());

    await act(async () => {
      const success = await result.current.restoreFromURL('/apps/terminal', { x: 300 });
      expect(success).toBe(true);
    });

    expect(mockDeepLinkService.restoreFromURL).toHaveBeenCalledWith('/apps/terminal', { x: 300 });
  });

  it('should provide save state function', () => {
    const { result } = renderHook(() => useDeepLinkRestoration());

    act(() => {
      result.current.saveStateForRestoration('test-window-123');
    });

    expect(mockDeepLinkService.saveWindowStateForRestoration).toHaveBeenCalledWith('test-window-123');
  });

  it('should provide clear restoration attempts function', () => {
    const { result } = renderHook(() => useDeepLinkRestoration());

    act(() => {
      result.current.clearRestorationAttempts();
    });

    expect(mockDeepLinkService.clearRestorationAttempts).toHaveBeenCalledWith(
      '/apps/projects',
      { x: 100, y: 200 }
    );
  });
});

describe('useDeepLinkEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should listen for project selection events', () => {
    const { result } = renderHook(() => useDeepLinkEvents('projects'));

    // Simulate project selection event
    act(() => {
      const event = new CustomEvent('deep-link-project-select', {
        detail: { slug: 'test-project' }
      });
      window.dispatchEvent(event);
    });

    expect(result.current.deepLinkData).toEqual({
      type: 'project-select',
      slug: 'test-project'
    });
  });

  it('should listen for file navigation events', () => {
    const { result } = renderHook(() => useDeepLinkEvents('file-explorer'));

    // Simulate file navigation event
    act(() => {
      const event = new CustomEvent('deep-link-file-navigate', {
        detail: { path: '/Documents/test.txt' }
      });
      window.dispatchEvent(event);
    });

    expect(result.current.deepLinkData).toEqual({
      type: 'file-navigate',
      path: '/Documents/test.txt'
    });
  });

  it('should ignore events for other apps', () => {
    const { result } = renderHook(() => useDeepLinkEvents('terminal'));

    // Simulate project selection event (should be ignored)
    act(() => {
      const event = new CustomEvent('deep-link-project-select', {
        detail: { slug: 'test-project' }
      });
      window.dispatchEvent(event);
    });

    expect(result.current.deepLinkData).toBe(null);
  });

  it('should clear deep link data', () => {
    const { result } = renderHook(() => useDeepLinkEvents('projects'));

    // Set some data first
    act(() => {
      const event = new CustomEvent('deep-link-project-select', {
        detail: { slug: 'test-project' }
      });
      window.dispatchEvent(event);
    });

    expect(result.current.deepLinkData).not.toBe(null);

    // Clear the data
    act(() => {
      result.current.clearDeepLinkData();
    });

    expect(result.current.deepLinkData).toBe(null);
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useDeepLinkEvents('projects'));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'deep-link-project-select',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'project-deep-link',
      expect.any(Function)
    );
  });
});

describe('useURLValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate valid app routes', () => {
    mockRouterState.location.pathname = '/apps/projects';
    mockRouterState.location.search = { x: 100, y: 200, w: 800, h: 600 };

    const { result } = renderHook(() => useURLValidation());

    expect(result.current.isValidURL).toBe(true);
    expect(result.current.validationError).toBe(null);
  });

  it('should validate valid project routes', () => {
    mockRouterState.location.pathname = '/projects/my-project';
    mockRouterState.location.search = {};

    const { result } = renderHook(() => useURLValidation());

    expect(result.current.isValidURL).toBe(true);
    expect(result.current.validationError).toBe(null);
  });

  it('should validate valid file routes', () => {
    mockRouterState.location.pathname = '/files';
    mockRouterState.location.search = { path: '/Documents/test.txt' };

    const { result } = renderHook(() => useURLValidation());

    expect(result.current.isValidURL).toBe(true);
    expect(result.current.validationError).toBe(null);
  });

  it('should detect invalid app IDs', () => {
    mockRouterState.location.pathname = '/apps/invalid-app';
    mockRouterState.location.search = {};

    const { result } = renderHook(() => useURLValidation());

    expect(result.current.isValidURL).toBe(false);
    expect(result.current.validationError).toBe('Invalid app ID: invalid-app');
  });

  it('should detect invalid project slugs', () => {
    mockRouterState.location.pathname = '/projects/';
    mockRouterState.location.search = {};

    const { result } = renderHook(() => useURLValidation());

    expect(result.current.isValidURL).toBe(false);
    expect(result.current.validationError).toBe('Invalid project slug');
  });

  it('should detect invalid numeric parameters', () => {
    mockRouterState.location.pathname = '/apps/projects';
    mockRouterState.location.search = { x: 'invalid', y: 200 };

    const { result } = renderHook(() => useURLValidation());

    expect(result.current.isValidURL).toBe(false);
    expect(result.current.validationError).toBe('Invalid x coordinate');
  });

  it('should detect invalid width/height parameters', () => {
    mockRouterState.location.pathname = '/apps/projects';
    mockRouterState.location.search = { w: 100 }; // Below minimum of 320

    const { result } = renderHook(() => useURLValidation());

    expect(result.current.isValidURL).toBe(false);
    expect(result.current.validationError).toBe('Invalid width');
  });

  it('should detect invalid boolean parameters', () => {
    mockRouterState.location.pathname = '/apps/projects';
    mockRouterState.location.search = { maximized: 'yes' }; // Should be boolean

    const { result } = renderHook(() => useURLValidation());

    expect(result.current.isValidURL).toBe(false);
    expect(result.current.validationError).toBe('Invalid maximized state');
  });

  it('should validate boolean parameters correctly', () => {
    mockRouterState.location.pathname = '/apps/projects';
    mockRouterState.location.search = { maximized: true, minimized: false };

    const { result } = renderHook(() => useURLValidation());

    expect(result.current.isValidURL).toBe(true);
    expect(result.current.validationError).toBe(null);
  });
});