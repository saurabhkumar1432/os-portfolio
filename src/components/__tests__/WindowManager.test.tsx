import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WindowManager } from '../window/WindowManager';
import { useWindowStore } from '../../store/windowStore';

// Mock the window store
vi.mock('../../store/windowStore');
vi.mock('../../store/preferencesStore', () => ({
  usePreferencesStore: () => ({
    theme: 'light',
    reduceMotion: false,
  }),
}));

const mockUseWindowStore = vi.mocked(useWindowStore);

describe('WindowManager', () => {
  const mockWindow = {
    id: 'test-window-1',
    appId: 'projects' as const,
    title: 'Test Window',
    bounds: { x: 100, y: 100, w: 800, h: 600 },
    zIndex: 1,
    minimized: false,
    maximized: false,
    focused: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseWindowStore.mockReturnValue({
      windows: { [mockWindow.id]: mockWindow },
      zOrder: [mockWindow.id],
      dragState: null,
      resizeState: null,
      nextZIndex: 2,
      createWindow: vi.fn(),
      closeWindow: vi.fn(),
      focusWindow: vi.fn(),
      minimizeWindow: vi.fn(),
      maximizeWindow: vi.fn(),
      restoreWindow: vi.fn(),
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

  it('should render windows', () => {
    render(<WindowManager />);
    
    expect(screen.getByText('projects')).toBeInTheDocument();
    expect(screen.getByText('Application content will be implemented in later tasks')).toBeInTheDocument();
  });

  it('should not render minimized windows', () => {
    const minimizedWindow = { ...mockWindow, minimized: true };
    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      windows: { [mockWindow.id]: minimizedWindow },
    });

    render(<WindowManager />);
    
    // Minimized window should not be rendered
    expect(screen.queryByText('projects')).not.toBeInTheDocument();
  });

  it('should handle window clicks for focusing', () => {
    const mockFocusWindow = vi.fn();
    const unfocusedWindow = { ...mockWindow, focused: false };
    
    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      windows: { [mockWindow.id]: unfocusedWindow },
      focusWindow: mockFocusWindow,
    });

    render(<WindowManager />);
    
    const windowElement = screen.getByText('projects').closest('div');
    if (windowElement) {
      fireEvent.click(windowElement);
      expect(mockFocusWindow).toHaveBeenCalledWith(mockWindow.id);
    }
  });
});