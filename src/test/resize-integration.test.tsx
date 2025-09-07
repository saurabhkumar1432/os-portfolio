import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Window } from '../components/window/Window';
import { useWindowStore } from '../store/windowStore';
import { usePreferencesStore } from '../store/preferencesStore';

// Mock the stores
vi.mock('../store/windowStore');
vi.mock('../store/preferencesStore');

const mockUseWindowStore = vi.mocked(useWindowStore);
const mockUsePreferencesStore = vi.mocked(usePreferencesStore);

describe('Window Resize Integration', () => {
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

  const mockUpdateWindowBounds = vi.fn();
  const mockSetResizeState = vi.fn();

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

    mockUseWindowStore.mockReturnValue({
      windows: { [mockWindow.id]: mockWindow },
      zOrder: [mockWindow.id],
      dragState: null,
      resizeState: null,
      nextZIndex: 2,
      updateWindowBounds: mockUpdateWindowBounds,
      setResizeState: mockSetResizeState,
      createWindow: vi.fn(),
      closeWindow: vi.fn(),
      focusWindow: vi.fn(),
      minimizeWindow: vi.fn(),
      maximizeWindow: vi.fn(),
      restoreWindow: vi.fn(),
      updateWindowTitle: vi.fn(),
      updateWindowUnsavedState: vi.fn(),
      setDragState: vi.fn(),
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

    mockUsePreferencesStore.mockReturnValue({
      theme: 'light',
      accentColor: '#3b82f6',
      wallpaper: 'default',
      iconSize: 'md',
      sounds: true,
      reduceMotion: false,
      desktopLayout: [],
      windowPositions: {},
      setTheme: vi.fn(),
      setAccentColor: vi.fn(),
      setWallpaper: vi.fn(),
      setIconSize: vi.fn(),
      setSounds: vi.fn(),
      setReduceMotion: vi.fn(),
      setDesktopLayout: vi.fn(),
      setWindowPosition: vi.fn(),
      resetPreferences: vi.fn(),
    });
  });

  it('should render window with resize handles', () => {
    render(
      <Window window={mockWindow}>
        <div>Test Content</div>
      </Window>
    );

    // Window should be rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    // Resize handles should be present
    const resizeHandles = screen.getAllByTitle('Resize');
    expect(resizeHandles).toHaveLength(8); // 4 corners + 4 edges
  });

  it('should not render resize handles for maximized window', () => {
    const maximizedWindow = { ...mockWindow, maximized: true };
    
    render(
      <Window window={maximizedWindow}>
        <div>Test Content</div>
      </Window>
    );

    // No resize handles should be present for maximized window
    expect(screen.queryAllByTitle('Resize')).toHaveLength(0);
  });

  it('should start resize operation when clicking on resize handle', () => {
    render(
      <Window window={mockWindow}>
        <div>Test Content</div>
      </Window>
    );

    const resizeHandles = screen.getAllByTitle('Resize');
    const seHandle = resizeHandles.find(handle => 
      handle.className.includes('cursor-nwse-resize') && 
      handle.className.includes('-bottom-1') &&
      handle.className.includes('-right-1')
    );

    expect(seHandle).toBeInTheDocument();

    // Simulate mouse down on SE corner handle
    fireEvent.mouseDown(seHandle!, {
      button: 0,
      clientX: 900, // Right edge of window
      clientY: 700, // Bottom edge of window
    });

    // Should start resize operation
    expect(mockSetResizeState).toHaveBeenCalledWith(
      expect.objectContaining({
        windowId: mockWindow.id,
        handle: 'se',
        startBounds: mockWindow.bounds,
        startPosition: { x: 900, y: 700 },
      })
    );
  });

  it('should show visual feedback during resize', () => {
    // Set resize state to simulate active resize
    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      resizeState: {
        windowId: mockWindow.id,
        handle: 'se',
        startBounds: mockWindow.bounds,
        startPosition: { x: 900, y: 700 },
      },
    });

    const { container } = render(
      <Window window={mockWindow}>
        <div>Test Content</div>
      </Window>
    );

    // Should show visual feedback overlay
    const overlay = container.querySelector('.border-blue-500');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('bg-blue-500/5'); // Light theme feedback
  });

  it('should apply correct cursor styles to resize handles', () => {
    render(
      <Window window={mockWindow}>
        <div>Test Content</div>
      </Window>
    );

    const resizeHandles = screen.getAllByTitle('Resize');
    
    // Check that handles have appropriate cursor classes
    const cursorClasses = [
      'cursor-nwse-resize',
      'cursor-nesw-resize', 
      'cursor-ns-resize',
      'cursor-ew-resize'
    ];

    const handlesWithCursors = resizeHandles.filter(handle =>
      cursorClasses.some(cursor => handle.className.includes(cursor))
    );

    expect(handlesWithCursors.length).toBe(resizeHandles.length);
  });

  it('should position resize handles correctly around window', () => {
    render(
      <Window window={mockWindow}>
        <div>Test Content</div>
      </Window>
    );

    const resizeHandles = screen.getAllByTitle('Resize');
    
    // Check positioning classes are applied
    const positionClasses = [
      '-top-1', '-bottom-1', '-left-1', '-right-1',
      'top-3', 'bottom-3', 'left-3', 'right-3'
    ];

    const handlesWithPositions = resizeHandles.filter(handle =>
      positionClasses.some(pos => handle.className.includes(pos))
    );

    expect(handlesWithPositions.length).toBe(resizeHandles.length);
  });
});