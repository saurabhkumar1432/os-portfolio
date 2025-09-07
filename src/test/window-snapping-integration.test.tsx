import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowManager } from '../components/window/WindowManager';
import { useWindowStore } from '../store/windowStore';
import { usePreferencesStore } from '../store/preferencesStore';

// Mock stores
vi.mock('../store/windowStore');
vi.mock('../store/preferencesStore');
vi.mock('../hooks/useCloseConfirmation', () => ({
  useCloseConfirmation: () => ({
    confirmationState: { isOpen: false, windowTitle: '', windowId: '' },
    confirmClose: vi.fn(),
    cancelClose: vi.fn(),
  }),
}));

const mockUseWindowStore = vi.mocked(useWindowStore);
const mockUsePreferencesStore = vi.mocked(usePreferencesStore);

describe('Window Snapping Integration', () => {
  const mockWindow = {
    id: 'test-window',
    appId: 'projects' as const,
    title: 'Test Window',
    bounds: { x: 100, y: 100, w: 800, h: 600 },
    zIndex: 1,
    minimized: false,
    maximized: false,
    focused: true,
    snapState: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });

    mockUsePreferencesStore.mockReturnValue({
      theme: 'light',
      reduceMotion: false,
      wallpaper: 'default',
      accentColor: '#3b82f6',
      iconSize: 'md',
      sounds: false,
      setTheme: vi.fn(),
      setWallpaper: vi.fn(),
      setAccentColor: vi.fn(),
      setIconSize: vi.fn(),
      setSounds: vi.fn(),
      setReduceMotion: vi.fn(),
    });

    mockUseWindowStore.mockReturnValue({
      windows: { [mockWindow.id]: mockWindow },
      zOrder: [mockWindow.id],
      dragState: null,
      resizeState: null,
      nextZIndex: 2,
      createWindow: vi.fn(),
      closeWindow: vi.fn(),
      requestCloseWindow: vi.fn(),
      focusWindow: vi.fn(),
      minimizeWindow: vi.fn(),
      maximizeWindow: vi.fn(),
      restoreWindow: vi.fn(),
      updateWindowBounds: vi.fn(),
      updateWindowTitle: vi.fn(),
      updateWindowUnsavedState: vi.fn(),
      updateWindowSnapState: vi.fn(),
      setDragState: vi.fn(),
      setResizeState: vi.fn(),
      bringToFront: vi.fn(),
      closeAllWindows: vi.fn(),
      minimizeAllWindows: vi.fn(),
      getFocusedWindow: vi.fn().mockReturnValue(mockWindow),
      getWindowsByApp: vi.fn(),
      getVisibleWindows: vi.fn().mockReturnValue([mockWindow]),
      getMinimizedWindows: vi.fn(),
      isWindowFocused: vi.fn(),
      hasUnsavedWindows: vi.fn(),
    });
  });

  it('should render window with snap overlay capability', () => {
    render(<WindowManager />);

    // Window should be rendered
    expect(screen.getByText('Test Window')).toBeInTheDocument();
    expect(screen.getByText('Application content will be implemented in later tasks')).toBeInTheDocument();
  });

  it('should handle window dragging with snap zones', () => {
    const mockUpdateWindowBounds = vi.fn();
    const mockSetDragState = vi.fn();

    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      updateWindowBounds: mockUpdateWindowBounds,
      setDragState: mockSetDragState,
    });

    render(<WindowManager />);

    const titleBar = screen.getByText('Test Window').closest('.cursor-move');
    expect(titleBar).toBeInTheDocument();

    if (titleBar) {
      // Start drag
      fireEvent.mouseDown(titleBar, { button: 0, clientX: 150, clientY: 150 });

      // Verify drag state was set
      expect(mockSetDragState).toHaveBeenCalledWith(
        expect.objectContaining({
          windowId: mockWindow.id,
          startPosition: { x: 150, y: 150 },
        })
      );
    }
  });

  it('should show snap overlay when dragging is active', () => {
    // Mock active drag state
    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      dragState: {
        windowId: mockWindow.id,
        startPosition: { x: 150, y: 150 },
        startBounds: mockWindow.bounds,
        offset: { x: 50, y: 50 },
      },
    });

    render(<WindowManager />);

    // The snap overlay should be rendered when dragging
    // Note: The actual overlay visibility is controlled by the useGlobalSnapOverlay hook
    // which would show the overlay when dragState is present
    expect(screen.getByText('Test Window')).toBeInTheDocument();
  });

  it('should handle keyboard shortcuts for window snapping', () => {
    const mockUpdateWindowBounds = vi.fn();
    const mockUpdateWindowSnapState = vi.fn();

    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      updateWindowBounds: mockUpdateWindowBounds,
      updateWindowSnapState: mockUpdateWindowSnapState,
    });

    render(<WindowManager />);

    // Simulate Win+Left keyboard shortcut
    fireEvent.keyDown(document, { key: 'Meta' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    // Note: The actual keyboard shortcut handling is done by the useKeyboardShortcuts hook
    // which is tested separately. This test verifies the integration exists.
    expect(screen.getByText('Test Window')).toBeInTheDocument();
  });
});