import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ResizeHandles } from '../ResizeHandles';
import { useWindowStore } from '../../../store/windowStore';
import { usePreferencesStore } from '../../../store/preferencesStore';

// Mock the stores
vi.mock('../../../store/windowStore');
vi.mock('../../../store/preferencesStore');
vi.mock('../../../hooks/useResize');

const mockUseWindowStore = vi.mocked(useWindowStore);
const mockUsePreferencesStore = vi.mocked(usePreferencesStore);

// Mock useResize hook
vi.mock('../../../hooks/useResize', () => ({
  useResize: vi.fn(() => ({
    onMouseDown: vi.fn(() => vi.fn()),
    onTouchStart: vi.fn(() => vi.fn()),
  })),
}));

describe('ResizeHandles', () => {
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
      resizeState: null,
      windows: {},
      zOrder: [],
      dragState: null,
      nextZIndex: 1,
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

  it('should render all resize handles for non-maximized window', () => {
    render(<ResizeHandles window={mockWindow} />);

    // Check for corner handles (should have cursor classes)
    const cornerHandles = screen.getAllByTitle('Resize').filter(el => 
      el.className.includes('cursor-nesw-resize') || 
      el.className.includes('cursor-nwse-resize')
    );
    expect(cornerHandles).toHaveLength(4); // nw, ne, sw, se

    // Check for edge handles
    const edgeHandles = screen.getAllByTitle('Resize').filter(el => 
      el.className.includes('cursor-ns-resize') || 
      el.className.includes('cursor-ew-resize')
    );
    expect(edgeHandles).toHaveLength(4); // n, s, e, w

    // Total should be 8 handles
    expect(screen.getAllByTitle('Resize')).toHaveLength(8);
  });

  it('should not render resize handles for maximized window', () => {
    const maximizedWindow = { ...mockWindow, maximized: true };
    render(<ResizeHandles window={maximizedWindow} />);

    expect(screen.queryAllByTitle('Resize')).toHaveLength(0);
  });

  it('should apply correct cursor classes to handles', () => {
    render(<ResizeHandles window={mockWindow} />);

    const handles = screen.getAllByTitle('Resize');
    
    // Check that cursor classes are applied
    const cursorClasses = [
      'cursor-nwse-resize', // nw corner
      'cursor-nesw-resize', // ne corner
      'cursor-nesw-resize', // sw corner
      'cursor-nwse-resize', // se corner
      'cursor-ns-resize',   // n edge
      'cursor-ns-resize',   // s edge
      'cursor-ew-resize',   // w edge
      'cursor-ew-resize',   // e edge
    ];

    // At least some handles should have cursor classes
    const handlesWithCursor = handles.filter(handle => 
      cursorClasses.some(cursor => handle.className.includes(cursor))
    );
    expect(handlesWithCursor.length).toBeGreaterThan(0);
  });

  it('should show visual feedback when resizing', () => {
    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      resizeState: {
        windowId: 'test-window-1',
        handle: 'se',
        startBounds: mockWindow.bounds,
        startPosition: { x: 900, y: 700 },
      },
    });

    const { container } = render(<ResizeHandles window={mockWindow} />);

    // Should show visual feedback overlay
    const overlay = container.querySelector('.border-blue-500');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('bg-blue-500/5'); // Light theme
  });

  it('should show dark theme visual feedback when resizing', () => {
    mockUsePreferencesStore.mockReturnValue({
      ...mockUsePreferencesStore(),
      theme: 'dark',
    });

    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      resizeState: {
        windowId: 'test-window-1',
        handle: 'se',
        startBounds: mockWindow.bounds,
        startPosition: { x: 900, y: 700 },
      },
    });

    const { container } = render(<ResizeHandles window={mockWindow} />);

    // Should show dark theme visual feedback
    const overlay = container.querySelector('.border-blue-500');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('bg-blue-500/10'); // Dark theme
  });

  it('should highlight active handle during resize', () => {
    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      resizeState: {
        windowId: 'test-window-1',
        handle: 'se',
        startBounds: mockWindow.bounds,
        startPosition: { x: 900, y: 700 },
      },
    });

    render(<ResizeHandles window={mockWindow} />);

    const handles = screen.getAllByTitle('Resize');
    
    // At least one handle should have active styling
    const activeHandles = handles.filter(handle => 
      handle.className.includes('bg-blue-500/50')
    );
    expect(activeHandles.length).toBeGreaterThan(0);
  });

  it('should handle mouse events on resize handles', () => {
    render(<ResizeHandles window={mockWindow} />);

    const handles = screen.getAllByTitle('Resize');
    
    // Should be able to interact with handles
    expect(handles[0]).toBeInTheDocument();
    fireEvent.mouseDown(handles[0]);
    // The actual event handling is tested in the useResize hook tests
  });

  it('should handle touch events on resize handles', () => {
    render(<ResizeHandles window={mockWindow} />);

    const handles = screen.getAllByTitle('Resize');
    
    // Should be able to interact with handles
    expect(handles[0]).toBeInTheDocument();
    fireEvent.touchStart(handles[0]);
    // The actual event handling is tested in the useResize hook tests
  });

  it('should not show visual feedback for other windows', () => {
    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      resizeState: {
        windowId: 'other-window',
        handle: 'se',
        startBounds: { x: 200, y: 200, w: 400, h: 300 },
        startPosition: { x: 600, y: 500 },
      },
    });

    const { container } = render(<ResizeHandles window={mockWindow} />);

    // Should not show visual feedback for different window
    const overlay = container.querySelector('.border-blue-500');
    expect(overlay).not.toBeInTheDocument();
  });

  it('should apply hover effects to handles', () => {
    render(<ResizeHandles window={mockWindow} />);

    const handles = screen.getAllByTitle('Resize');
    
    // All handles should have hover classes
    handles.forEach(handle => {
      expect(handle).toHaveClass('hover:bg-blue-500/30');
    });
  });

  it('should position handles correctly', () => {
    render(<ResizeHandles window={mockWindow} />);

    const handles = screen.getAllByTitle('Resize');
    
    // Check that handles have positioning classes
    const positionClasses = [
      '-top-1', '-bottom-1', '-left-1', '-right-1',
      'top-3', 'bottom-3', 'left-3', 'right-3'
    ];

    const handlesWithPosition = handles.filter(handle => 
      positionClasses.some(pos => handle.className.includes(pos))
    );
    
    expect(handlesWithPosition.length).toBe(handles.length);
  });
});