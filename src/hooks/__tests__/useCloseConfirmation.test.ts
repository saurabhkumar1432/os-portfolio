import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useCloseConfirmation } from '../useCloseConfirmation';
import { useWindowStore } from '../../store/windowStore';

// Mock the window store
vi.mock('../../store/windowStore');

const mockUseWindowStore = vi.mocked(useWindowStore);

describe('useCloseConfirmation', () => {
  const mockCloseWindow = vi.fn();
  const mockWindows = {
    'window-1': {
      id: 'window-1',
      appId: 'projects' as const,
      title: 'Test Window',
      bounds: { x: 100, y: 100, w: 800, h: 600 },
      zIndex: 1,
      minimized: false,
      maximized: false,
      focused: true,
      hasUnsavedState: false,
    },
    'window-2': {
      id: 'window-2',
      appId: 'notepad' as const,
      title: 'Unsaved Document',
      bounds: { x: 200, y: 200, w: 600, h: 400 },
      zIndex: 2,
      minimized: false,
      maximized: false,
      focused: false,
      hasUnsavedState: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseWindowStore.mockReturnValue({
      closeWindow: mockCloseWindow,
      windows: mockWindows,
      zOrder: ['window-1', 'window-2'],
      dragState: null,
      resizeState: null,
      nextZIndex: 3,
      createWindow: vi.fn(),
      focusWindow: vi.fn(),
      minimizeWindow: vi.fn(),
      maximizeWindow: vi.fn(),
      restoreWindow: vi.fn(),
      requestCloseWindow: vi.fn(),
      updateWindowBounds: vi.fn(),
      updateWindowTitle: vi.fn(),
      updateWindowUnsavedState: vi.fn(),
      setDragState: vi.fn(),
      setResizeState: vi.fn(),
      bringToFront: vi.fn(),
      closeAllWindows: vi.fn(),
      minimizeAllWindows: vi.fn(),
      getFocusedWindow: vi.fn(),
      getWindowsByApp: vi.fn(),
      getVisibleWindows: vi.fn(),
      getMinimizedWindows: vi.fn(),
      isWindowFocused: vi.fn(),
      hasUnsavedWindows: vi.fn(),
    });
  });

  it('should initialize with closed confirmation state', () => {
    const { result } = renderHook(() => useCloseConfirmation());

    expect(result.current.confirmationState).toEqual({
      isOpen: false,
      windowId: null,
      windowTitle: '',
    });
  });

  it('should close window immediately if no unsaved state', async () => {
    const { result } = renderHook(() => useCloseConfirmation());

    await act(async () => {
      await result.current.requestClose('window-1');
    });

    expect(mockCloseWindow).toHaveBeenCalledWith('window-1');
    expect(result.current.confirmationState.isOpen).toBe(false);
  });

  it('should show confirmation dialog for window with unsaved state', async () => {
    const { result } = renderHook(() => useCloseConfirmation());

    await act(async () => {
      await result.current.requestClose('window-2');
    });

    expect(mockCloseWindow).not.toHaveBeenCalled();
    expect(result.current.confirmationState).toEqual({
      isOpen: true,
      windowId: 'window-2',
      windowTitle: 'Unsaved Document',
    });
  });

  it('should handle non-existent window gracefully', async () => {
    const { result } = renderHook(() => useCloseConfirmation());

    await act(async () => {
      await result.current.requestClose('non-existent');
    });

    expect(mockCloseWindow).not.toHaveBeenCalled();
    expect(result.current.confirmationState.isOpen).toBe(false);
  });

  it('should close window when confirmed', async () => {
    const { result } = renderHook(() => useCloseConfirmation());

    // First, request close for window with unsaved state
    await act(async () => {
      await result.current.requestClose('window-2');
    });

    expect(result.current.confirmationState.isOpen).toBe(true);

    // Then confirm the close
    act(() => {
      result.current.confirmClose();
    });

    expect(mockCloseWindow).toHaveBeenCalledWith('window-2', true);
    expect(result.current.confirmationState).toEqual({
      isOpen: false,
      windowId: null,
      windowTitle: '',
    });
  });

  it('should not close window when cancelled', async () => {
    const { result } = renderHook(() => useCloseConfirmation());

    // First, request close for window with unsaved state
    await act(async () => {
      await result.current.requestClose('window-2');
    });

    expect(result.current.confirmationState.isOpen).toBe(true);

    // Then cancel the close
    act(() => {
      result.current.cancelClose();
    });

    expect(mockCloseWindow).not.toHaveBeenCalledWith('window-2', true);
    expect(result.current.confirmationState).toEqual({
      isOpen: false,
      windowId: null,
      windowTitle: '',
    });
  });

  it('should handle multiple confirmation requests', async () => {
    // Create a new windows object with window-3
    const updatedWindows = {
      ...mockWindows,
      'window-3': {
        id: 'window-3',
        appId: 'terminal' as const,
        title: 'Another Unsaved Window',
        bounds: { x: 300, y: 300, w: 500, h: 300 },
        zIndex: 3,
        minimized: false,
        maximized: false,
        focused: false,
        hasUnsavedState: true,
      },
    };

    // Update the mock to return the new windows
    mockUseWindowStore.mockReturnValue({
      closeWindow: mockCloseWindow,
      windows: updatedWindows,
      zOrder: ['window-1', 'window-2', 'window-3'],
      dragState: null,
      resizeState: null,
      nextZIndex: 4,
      createWindow: vi.fn(),
      focusWindow: vi.fn(),
      minimizeWindow: vi.fn(),
      maximizeWindow: vi.fn(),
      restoreWindow: vi.fn(),
      requestCloseWindow: vi.fn(),
      updateWindowBounds: vi.fn(),
      updateWindowTitle: vi.fn(),
      updateWindowUnsavedState: vi.fn(),
      setDragState: vi.fn(),
      setResizeState: vi.fn(),
      bringToFront: vi.fn(),
      closeAllWindows: vi.fn(),
      minimizeAllWindows: vi.fn(),
      getFocusedWindow: vi.fn(),
      getWindowsByApp: vi.fn(),
      getVisibleWindows: vi.fn(),
      getMinimizedWindows: vi.fn(),
      isWindowFocused: vi.fn(),
      hasUnsavedWindows: vi.fn(),
    });

    const { result } = renderHook(() => useCloseConfirmation());

    // Request close for first window
    await act(async () => {
      await result.current.requestClose('window-2');
    });

    expect(result.current.confirmationState.windowId).toBe('window-2');

    // Request close for another window (should replace the first)
    await act(async () => {
      await result.current.requestClose('window-3');
    });

    expect(result.current.confirmationState.windowId).toBe('window-3');
    expect(result.current.confirmationState.windowTitle).toBe('Another Unsaved Window');
  });

  it('should handle confirmation when window no longer exists', () => {
    const { result } = renderHook(() => useCloseConfirmation());

    // Manually set confirmation state
    act(() => {
      result.current.requestClose('window-2');
    });

    // Remove the window from store
    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      windows: { 'window-1': mockWindows['window-1'] },
    });

    // Confirm close - should still call closeWindow
    act(() => {
      result.current.confirmClose();
    });

    expect(mockCloseWindow).toHaveBeenCalledWith('window-2', true);
  });

  it('should reset state properly after confirmation', async () => {
    const { result } = renderHook(() => useCloseConfirmation());

    // Request close
    await act(async () => {
      await result.current.requestClose('window-2');
    });

    // Confirm
    act(() => {
      result.current.confirmClose();
    });

    // State should be reset
    expect(result.current.confirmationState).toEqual({
      isOpen: false,
      windowId: null,
      windowTitle: '',
    });

    // Should be able to request close again
    await act(async () => {
      await result.current.requestClose('window-2');
    });

    expect(result.current.confirmationState.isOpen).toBe(true);
  });
});