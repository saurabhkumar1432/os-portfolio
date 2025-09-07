import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useResize } from '../useResize';
import { useWindowStore } from '../../store/windowStore';

// Mock the window store
vi.mock('../../store/windowStore');

const mockUseWindowStore = vi.mocked(useWindowStore);

describe('useResize', () => {
  const mockWindowId = 'test-window-1';
  const mockWindow = {
    id: mockWindowId,
    appId: 'projects' as const,
    title: 'Test Window',
    bounds: { x: 100, y: 100, w: 800, h: 600 },
    zIndex: 1,
    minimized: false,
    maximized: false,
    focused: true,
  };

  const mockSetResizeState = vi.fn();
  const mockUpdateWindowBounds = vi.fn();

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
      windows: { [mockWindowId]: mockWindow },
      setResizeState: mockSetResizeState,
      updateWindowBounds: mockUpdateWindowBounds,
      zOrder: [mockWindowId],
      dragState: null,
      resizeState: null,
      nextZIndex: 2,
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
  });

  it('should return resize handlers', () => {
    const { result } = renderHook(() => useResize({ windowId: mockWindowId }));

    expect(result.current).toHaveProperty('onMouseDown');
    expect(result.current).toHaveProperty('onTouchStart');
    expect(typeof result.current.onMouseDown).toBe('function');
    expect(typeof result.current.onTouchStart).toBe('function');
  });

  it('should start resize on mouse down with correct handle', () => {
    const onResizeStart = vi.fn();
    const { result } = renderHook(() => 
      useResize({ windowId: mockWindowId, onResizeStart })
    );

    const mockMouseEvent = {
      button: 0,
      clientX: 150,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.onMouseDown('se')(mockMouseEvent);
    });

    expect(mockSetResizeState).toHaveBeenCalledWith({
      windowId: mockWindowId,
      handle: 'se',
      startBounds: mockWindow.bounds,
      startPosition: { x: 150, y: 150 },
    });
    expect(onResizeStart).toHaveBeenCalled();
  });

  it('should not start resize for non-left mouse button', () => {
    const { result } = renderHook(() => useResize({ windowId: mockWindowId }));

    const mockMouseEvent = {
      button: 1, // Right click
      clientX: 150,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.onMouseDown('se')(mockMouseEvent);
    });

    expect(mockSetResizeState).not.toHaveBeenCalled();
  });

  it('should not start resize for maximized window', () => {
    const maximizedWindow = { ...mockWindow, maximized: true };
    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      windows: { [mockWindowId]: maximizedWindow },
    });

    const { result } = renderHook(() => useResize({ windowId: mockWindowId }));

    const mockMouseEvent = {
      button: 0,
      clientX: 150,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.onMouseDown('se')(mockMouseEvent);
    });

    expect(mockSetResizeState).not.toHaveBeenCalled();
  });

  it('should handle touch start events', () => {
    const { result } = renderHook(() => useResize({ windowId: mockWindowId }));

    const mockTouchEvent = {
      touches: [{ clientX: 150, clientY: 150 }],
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart('se')(mockTouchEvent);
    });

    expect(mockSetResizeState).toHaveBeenCalled();
  });

  it('should not handle multi-touch events', () => {
    const { result } = renderHook(() => useResize({ windowId: mockWindowId }));

    const mockTouchEvent = {
      touches: [
        { clientX: 150, clientY: 150 },
        { clientX: 200, clientY: 200 }
      ],
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart('se')(mockTouchEvent);
    });

    expect(mockSetResizeState).not.toHaveBeenCalled();
  });

  describe('resize calculations', () => {
    it('should resize from southeast corner correctly', () => {
      const { result } = renderHook(() => useResize({ windowId: mockWindowId }));

      const mockMouseEvent = {
        button: 0,
        clientX: 900, // Right edge of window (100 + 800)
        clientY: 700, // Bottom edge of window (100 + 600)
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // Start resize
      act(() => {
        result.current.onMouseDown('se')(mockMouseEvent);
      });

      // Simulate mouse move to expand window
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 950, // Move 50px right
        clientY: 750, // Move 50px down
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      expect(mockUpdateWindowBounds).toHaveBeenCalledWith(
        mockWindowId,
        expect.objectContaining({
          x: 100, // X should not change for SE resize
          y: 100, // Y should not change for SE resize
          w: 850, // Width should increase by 50
          h: 650, // Height should increase by 50
        })
      );
    });

    it('should resize from northwest corner correctly', () => {
      const { result } = renderHook(() => useResize({ windowId: mockWindowId }));

      const mockMouseEvent = {
        button: 0,
        clientX: 100, // Left edge of window
        clientY: 100, // Top edge of window
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // Start resize
      act(() => {
        result.current.onMouseDown('nw')(mockMouseEvent);
      });

      // Simulate mouse move to expand window (move handle inward)
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 50,  // Move 50px left
        clientY: 50,  // Move 50px up
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      expect(mockUpdateWindowBounds).toHaveBeenCalledWith(
        mockWindowId,
        expect.objectContaining({
          x: 50,  // X should move left by 50
          y: 50,  // Y should move up by 50
          w: 850, // Width should increase by 50
          h: 650, // Height should increase by 50
        })
      );
    });

    it('should enforce minimum width constraint', () => {
      const { result } = renderHook(() => useResize({ windowId: mockWindowId }));

      const mockMouseEvent = {
        button: 0,
        clientX: 900,
        clientY: 700,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // Start resize
      act(() => {
        result.current.onMouseDown('se')(mockMouseEvent);
      });

      // Try to make window smaller than minimum width (320px)
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 200, // This would make width < 320
        clientY: 750,
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      expect(mockUpdateWindowBounds).toHaveBeenCalledWith(
        mockWindowId,
        expect.objectContaining({
          w: 320, // Should be constrained to minimum width
        })
      );
    });

    it('should enforce minimum height constraint', () => {
      const { result } = renderHook(() => useResize({ windowId: mockWindowId }));

      const mockMouseEvent = {
        button: 0,
        clientX: 900,
        clientY: 700,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // Start resize
      act(() => {
        result.current.onMouseDown('se')(mockMouseEvent);
      });

      // Try to make window smaller than minimum height (240px)
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 950,
        clientY: 200, // This would make height < 240
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      expect(mockUpdateWindowBounds).toHaveBeenCalledWith(
        mockWindowId,
        expect.objectContaining({
          h: 240, // Should be constrained to minimum height
        })
      );
    });

    it('should constrain window within viewport bounds', () => {
      const { result } = renderHook(() => useResize({ windowId: mockWindowId }));

      const mockMouseEvent = {
        button: 0,
        clientX: 900,
        clientY: 700,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // Start resize
      act(() => {
        result.current.onMouseDown('se')(mockMouseEvent);
      });

      // Try to resize beyond viewport
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 2500, // Beyond viewport width (1920)
        clientY: 1500, // Beyond viewport height minus taskbar (1080 - 48)
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      const lastCall = mockUpdateWindowBounds.mock.calls[mockUpdateWindowBounds.mock.calls.length - 1];
      const bounds = lastCall[1];
      
      // Window should not extend beyond viewport
      expect(bounds.x + bounds.w).toBeLessThanOrEqual(1920);
      expect(bounds.y + bounds.h).toBeLessThanOrEqual(1032); // 1080 - 48 (taskbar)
    });

    it('should resize from north edge correctly', () => {
      const { result } = renderHook(() => useResize({ windowId: mockWindowId }));

      const mockMouseEvent = {
        button: 0,
        clientX: 500,
        clientY: 100, // Top edge
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // Start resize
      act(() => {
        result.current.onMouseDown('n')(mockMouseEvent);
      });

      // Move top edge up
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 500,
        clientY: 50, // Move 50px up
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      expect(mockUpdateWindowBounds).toHaveBeenCalledWith(
        mockWindowId,
        expect.objectContaining({
          x: 100, // X should not change
          y: 50,  // Y should move up
          w: 800, // Width should not change
          h: 650, // Height should increase
        })
      );
    });

    it('should resize from west edge correctly', () => {
      const { result } = renderHook(() => useResize({ windowId: mockWindowId }));

      const mockMouseEvent = {
        button: 0,
        clientX: 100, // Left edge
        clientY: 400,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // Start resize
      act(() => {
        result.current.onMouseDown('w')(mockMouseEvent);
      });

      // Move left edge left
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 50, // Move 50px left
        clientY: 400,
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      expect(mockUpdateWindowBounds).toHaveBeenCalledWith(
        mockWindowId,
        expect.objectContaining({
          x: 50,  // X should move left
          y: 100, // Y should not change
          w: 850, // Width should increase
          h: 600, // Height should not change
        })
      );
    });
  });

  it('should call onResizeEnd when resize ends', () => {
    const onResizeEnd = vi.fn();
    const { result } = renderHook(() => 
      useResize({ windowId: mockWindowId, onResizeEnd })
    );

    const mockMouseEvent = {
      button: 0,
      clientX: 900,
      clientY: 700,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    // Start resize
    act(() => {
      result.current.onMouseDown('se')(mockMouseEvent);
    });

    // End resize
    const mouseUpEvent = new MouseEvent('mouseup');
    act(() => {
      document.dispatchEvent(mouseUpEvent);
    });

    expect(onResizeEnd).toHaveBeenCalled();
    expect(mockSetResizeState).toHaveBeenCalledWith(null);
  });

  it('should cancel resize on Escape key', () => {
    const { result } = renderHook(() => useResize({ windowId: mockWindowId }));

    const mockMouseEvent = {
      button: 0,
      clientX: 900,
      clientY: 700,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    // Start resize
    act(() => {
      result.current.onMouseDown('se')(mockMouseEvent);
    });

    // Resize window
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 950,
      clientY: 750,
    });

    act(() => {
      document.dispatchEvent(mouseMoveEvent);
    });

    // Press Escape
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    act(() => {
      document.dispatchEvent(escapeEvent);
    });

    // Should restore original bounds
    expect(mockUpdateWindowBounds).toHaveBeenCalledWith(
      mockWindowId,
      mockWindow.bounds
    );
    expect(mockSetResizeState).toHaveBeenCalledWith(null);
  });

  it('should handle all resize handles', () => {
    const { result } = renderHook(() => useResize({ windowId: mockWindowId }));
    
    const handles: Array<'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'> = 
      ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

    handles.forEach(handle => {
      const mockMouseEvent = {
        button: 0,
        clientX: 500,
        clientY: 400,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(handle)(mockMouseEvent);
      });

      expect(mockSetResizeState).toHaveBeenCalledWith(
        expect.objectContaining({
          handle,
          windowId: mockWindowId,
        })
      );

      // Reset for next iteration
      mockSetResizeState.mockClear();
    });
  });
});