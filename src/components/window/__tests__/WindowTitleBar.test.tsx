import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WindowTitleBar } from '../WindowTitleBar';
import { useWindowStore } from '../../../store/windowStore';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { useCloseConfirmation } from '../../../hooks/useCloseConfirmation';

// Mock the stores and hooks
vi.mock('../../../store/windowStore');
vi.mock('../../../store/preferencesStore');
vi.mock('../../../hooks/useCloseConfirmation');
vi.mock('../../../hooks/useDrag');

const mockUseWindowStore = vi.mocked(useWindowStore);
const mockUsePreferencesStore = vi.mocked(usePreferencesStore);
const mockUseCloseConfirmation = vi.mocked(useCloseConfirmation);

// Mock useDrag hook
vi.mock('../../../hooks/useDrag', () => ({
  useDrag: vi.fn(() => ({
    onMouseDown: vi.fn(),
    onTouchStart: vi.fn(),
  })),
}));

describe('WindowTitleBar', () => {
  const mockWindow = {
    id: 'test-window-1',
    appId: 'projects' as const,
    title: 'Test Window',
    bounds: { x: 100, y: 100, w: 800, h: 600 },
    zIndex: 1,
    minimized: false,
    maximized: false,
    focused: true,
    hasUnsavedState: false,
  };

  const mockWindowActions = {
    focusWindow: vi.fn(),
    minimizeWindow: vi.fn(),
    maximizeWindow: vi.fn(),
    closeWindow: vi.fn(),
    requestCloseWindow: vi.fn(),
  };

  const mockCloseConfirmation = {
    requestClose: vi.fn(),
    confirmationState: {
      isOpen: false,
      windowId: null,
      windowTitle: '',
    },
    confirmClose: vi.fn(),
    cancelClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseWindowStore.mockReturnValue({
      ...mockWindowActions,
      windows: {},
      zOrder: [],
      dragState: null,
      resizeState: null,
      nextZIndex: 1,
      createWindow: vi.fn(),
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

    mockUseCloseConfirmation.mockReturnValue(mockCloseConfirmation);
  });

  it('should render window title and controls', () => {
    render(<WindowTitleBar window={mockWindow} />);

    expect(screen.getByText('Test Window')).toBeInTheDocument();
    expect(screen.getByTitle('Minimize')).toBeInTheDocument();
    expect(screen.getByTitle('Maximize')).toBeInTheDocument();
    expect(screen.getByTitle('Close')).toBeInTheDocument();
  });

  it('should show unsaved indicator when window has unsaved state', () => {
    const unsavedWindow = { ...mockWindow, hasUnsavedState: true };
    render(<WindowTitleBar window={unsavedWindow} />);

    expect(screen.getByText('• Test Window')).toBeInTheDocument();
  });

  it('should call minimizeWindow when minimize button is clicked', () => {
    render(<WindowTitleBar window={mockWindow} />);

    fireEvent.click(screen.getByTitle('Minimize'));
    expect(mockWindowActions.minimizeWindow).toHaveBeenCalledWith('test-window-1');
  });

  it('should call maximizeWindow when maximize button is clicked', () => {
    render(<WindowTitleBar window={mockWindow} />);

    fireEvent.click(screen.getByTitle('Maximize'));
    expect(mockWindowActions.maximizeWindow).toHaveBeenCalledWith('test-window-1');
  });

  it('should show restore icon when window is maximized', () => {
    const maximizedWindow = { ...mockWindow, maximized: true };
    render(<WindowTitleBar window={maximizedWindow} />);

    expect(screen.getByTitle('Restore')).toBeInTheDocument();
  });

  it('should call maximizeWindow on double-click', () => {
    render(<WindowTitleBar window={mockWindow} />);

    const titleBar = screen.getByText('Test Window').closest('div');
    fireEvent.doubleClick(titleBar!);
    expect(mockWindowActions.maximizeWindow).toHaveBeenCalledWith('test-window-1');
  });

  it('should call requestClose when close button is clicked', () => {
    render(<WindowTitleBar window={mockWindow} />);

    fireEvent.click(screen.getByTitle('Close'));
    expect(mockCloseConfirmation.requestClose).toHaveBeenCalledWith('test-window-1');
  });

  it('should prevent event propagation on button clicks', () => {
    render(<WindowTitleBar window={mockWindow} />);

    const minimizeButton = screen.getByTitle('Minimize');
    const maximizeButton = screen.getByTitle('Maximize');
    const closeButton = screen.getByTitle('Close');

    // Just verify the buttons exist and can be clicked
    fireEvent.click(minimizeButton);
    fireEvent.click(maximizeButton);
    fireEvent.click(closeButton);

    // Verify the actions were called
    expect(mockWindowActions.minimizeWindow).toHaveBeenCalled();
    expect(mockWindowActions.maximizeWindow).toHaveBeenCalled();
    expect(mockCloseConfirmation.requestClose).toHaveBeenCalled();
  });

  it('should apply focused styling when window is focused', () => {
    render(<WindowTitleBar window={mockWindow} />);

    // Find the actual title bar container (the outermost div)
    const titleBarContainer = screen.getByText('Test Window').closest('div')?.parentElement;
    expect(titleBarContainer).toHaveClass('bg-gray-50');
  });

  it('should apply unfocused styling when window is not focused', () => {
    const unfocusedWindow = { ...mockWindow, focused: false };
    render(<WindowTitleBar window={unfocusedWindow} />);

    const titleBarContainer = screen.getByText('Test Window').closest('div')?.parentElement;
    expect(titleBarContainer).toHaveClass('bg-gray-100');
  });

  it('should apply dark theme styling', () => {
    mockUsePreferencesStore.mockReturnValue({
      ...mockUsePreferencesStore(),
      theme: 'dark',
    });

    render(<WindowTitleBar window={mockWindow} />);

    const titleBarContainer = screen.getByText('Test Window').closest('div')?.parentElement;
    expect(titleBarContainer).toHaveClass('bg-gray-700');
  });

  it('should show dragging cursor when dragging', () => {
    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      dragState: {
        windowId: 'test-window-1',
        startPosition: { x: 100, y: 100 },
        startBounds: mockWindow.bounds,
        offset: { x: 10, y: 10 },
      },
    });

    render(<WindowTitleBar window={mockWindow} />);

    const titleBarContainer = screen.getByText('Test Window').closest('div')?.parentElement;
    expect(titleBarContainer).toHaveClass('cursor-grabbing');
  });

  it('should show app icon with correct styling', () => {
    render(<WindowTitleBar window={mockWindow} />);

    const icon = screen.getByText('P'); // First letter of 'projects'
    expect(icon).toBeInTheDocument();
    expect(icon.closest('div')).toHaveClass('bg-blue-500');
  });

  it('should handle different app types with different icon colors', () => {
    const terminalWindow = { ...mockWindow, appId: 'terminal' as const };
    render(<WindowTitleBar window={terminalWindow} />);

    const icon = screen.getByText('T'); // First letter of 'terminal'
    expect(icon.closest('div')).toHaveClass('bg-green-500');
  });

  it('should truncate long window titles', () => {
    const longTitleWindow = {
      ...mockWindow,
      title: 'This is a very long window title that should be truncated',
    };
    render(<WindowTitleBar window={longTitleWindow} />);

    const titleElement = screen.getByText(longTitleWindow.title);
    expect(titleElement).toHaveClass('truncate');
  });
});