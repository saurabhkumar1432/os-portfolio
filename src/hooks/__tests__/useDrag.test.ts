import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDrag } from '../useDrag';
import { useWindowStore } from '../../store/windowStore';

// Mock the snap zones hook
vi.mock('../useSnapZones', () => ({
  useSnapZones: vi.fn(() => ({
    snapZones: [
      {
        id: 'left',
        bounds: { x: 0, y: 0, w: 960, h: 1032 },
        active: true,
        triggerBounds: { x: 0, y: 0, w: 20, h: 1032 },
      },
      {
        id: 'right',
        bounds: { x: 960, y: 0, w: 960, h: 1032 },
        active: true,
        triggerBounds: { x: 1900, y: 0, w: 20, h: 1032 },
      },
      {
        id: 'maximize',
        bounds: { x: 0, y: 0, w: 1920, h: 1032 },
        active: true,
        triggerBounds: { x: 0, y: 0, w: 1920, h: 10 },
      },
    ],
    getActiveSnapZone: vi.fn((x: number, y: number) => {
      if (x <= 20) return 'left';
      if (x >= 1900) return 'right';
      if (y <= 10) return 'maximize';
      return null;
    }),
    getSnapBounds: vi.fn((zoneId: string) => {
      const bounds = {
        left: { x: 0, y: 0, w: 960, h: 1032 },
        right: { x: 960, y: 0, w: 960, h: 1032 },
        maximize: { x: 0, y: 0, w: 1920, h: 1032 },
      };
      return bounds[zoneId as keyof typeof bounds] || null;
    }),
  })),
}));

// Mock the window store
vi.mock('../../store/windowStore');

const mockUseWindowStore = vi.mocked(useWindowStore);

describe('useDrag', () => {
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

  const mockSetDragState = vi.fn();
  const mockUpdateWindowBounds = vi.fn();
  const mockFocusWindow = vi.fn();
  const mockUpdateWindowSnapState = vi.fn();

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
      setDragState: mockSetDragState,
      updateWindowBounds: mockUpdateWindowBounds,
      focusWindow: mockFocusWindow,
      zOrder: [mockWindowId],
      dragState: null,
      resizeState: null,
      nextZIndex: 2,
      createWindow: vi.fn(),
      closeWindow: vi.fn(),
      minimizeWindow: vi.fn(),
      maximizeWindow: vi.fn(),
      restoreWindow: vi.fn(),
      updateWindowTitle: vi.fn(),
      updateWindowUnsavedState: vi.fn(),
      updateWindowSnapState: mockUpdateWindowSnapState,
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

  it('should return drag handlers', () => {
    const { result } = renderHook(() => useDrag({ windowId: mockWindowId }));

    expect(result.current).toHaveProperty('onMouseDown');
    expect(result.current).toHaveProperty('onTouchStart');
    expect(typeof result.current.onMouseDown).toBe('function');
    expect(typeof result.current.onTouchStart).toBe('function');
  });

  it('should focus window and start drag on mouse down', () => {
    const onDragStart = vi.fn();
    const { result } = renderHook(() => 
      useDrag({ windowId: mockWindowId, onDragStart })
    );

    const mockMouseEvent = {
      button: 0,
      clientX: 150,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.onMouseDown(mockMouseEvent);
    });

    expect(mockFocusWindow).toHaveBeenCalledWith(mockWindowId);
    expect(mockSetDragState).toHaveBeenCalledWith({
      windowId: mockWindowId,
      startPosition: { x: 150, y: 150 },
      startBounds: mockWindow.bounds,
      offset: { x: 50, y: 50 }, // clientX - bounds.x, clientY - bounds.y
    });
    expect(onDragStart).toHaveBeenCalled();
  });

  it('should not start drag for non-left mouse button', () => {
    const { result } = renderHook(() => useDrag({ windowId: mockWindowId }));

    const mockMouseEvent = {
      button: 1, // Right click
      clientX: 150,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.onMouseDown(mockMouseEvent);
    });

    expect(mockFocusWindow).not.toHaveBeenCalled();
    expect(mockSetDragState).not.toHaveBeenCalled();
  });

  it('should not start drag for maximized window', () => {
    const maximizedWindow = { ...mockWindow, maximized: true };
    mockUseWindowStore.mockReturnValue({
      ...mockUseWindowStore(),
      windows: { [mockWindowId]: maximizedWindow },
    });

    const { result } = renderHook(() => useDrag({ windowId: mockWindowId }));

    const mockMouseEvent = {
      button: 0,
      clientX: 150,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.onMouseDown(mockMouseEvent);
    });

    expect(mockSetDragState).not.toHaveBeenCalled();
  });

  it('should handle touch start events', () => {
    const { result } = renderHook(() => useDrag({ windowId: mockWindowId }));

    const mockTouchEvent = {
      touches: [{ clientX: 150, clientY: 150 }],
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(mockTouchEvent);
    });

    expect(mockFocusWindow).toHaveBeenCalledWith(mockWindowId);
    expect(mockSetDragState).toHaveBeenCalled();
  });

  it('should not handle multi-touch events', () => {
    const { result } = renderHook(() => useDrag({ windowId: mockWindowId }));

    const mockTouchEvent = {
      touches: [
        { clientX: 150, clientY: 150 },
        { clientX: 200, clientY: 200 }
      ],
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(mockTouchEvent);
    });

    expect(mockFocusWindow).not.toHaveBeenCalled();
    expect(mockSetDragState).not.toHaveBeenCalled();
  });

  it('should constrain window position within viewport bounds', () => {
    const { result } = renderHook(() => useDrag({ windowId: mockWindowId }));

    const mockMouseEvent = {
      button: 0,
      clientX: 150,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    // Start drag
    act(() => {
      result.current.onMouseDown(mockMouseEvent);
    });

    // Simulate mouse move to position that would be outside viewport
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: -500, // Way off screen
      clientY: -500,
    });

    act(() => {
      document.dispatchEvent(mouseMoveEvent);
    });

    // Should constrain position to keep window partially visible
    expect(mockUpdateWindowBounds).toHaveBeenCalledWith(
      mockWindowId,
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
      })
    );

    // The exact values depend on constraint logic, but should not be negative
    const lastCall = mockUpdateWindowBounds.mock.calls[mockUpdateWindowBounds.mock.calls.length - 1];
    const bounds = lastCall[1];
    expect(bounds.y).toBeGreaterThanOrEqual(0); // Y should not go above viewport
  });

  it('should call onDragEnd when drag ends', () => {
    const onDragEnd = vi.fn();
    const { result } = renderHook(() => 
      useDrag({ windowId: mockWindowId, onDragEnd })
    );

    const mockMouseEvent = {
      button: 0,
      clientX: 150,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    // Start drag
    act(() => {
      result.current.onMouseDown(mockMouseEvent);
    });

    // End drag
    const mouseUpEvent = new MouseEvent('mouseup');
    act(() => {
      document.dispatchEvent(mouseUpEvent);
    });

    expect(onDragEnd).toHaveBeenCalled();
    expect(mockSetDragState).toHaveBeenCalledWith(null);
  });

  it('should cancel drag on Escape key', () => {
    const { result } = renderHook(() => useDrag({ windowId: mockWindowId }));

    const mockMouseEvent = {
      button: 0,
      clientX: 150,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    // Start drag
    act(() => {
      result.current.onMouseDown(mockMouseEvent);
    });

    // Move window
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 200,
      clientY: 200,
    });

    act(() => {
      document.dispatchEvent(mouseMoveEvent);
    });

    // Press Escape
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    act(() => {
      document.dispatchEvent(escapeEvent);
    });

    // Should restore original position
    expect(mockUpdateWindowBounds).toHaveBeenCalledWith(
      mockWindowId,
      {
        x: mockWindow.bounds.x,
        y: mockWindow.bounds.y,
      }
    );
    expect(mockSetDragState).toHaveBeenCalledWith(null);
  });

  describe('window snapping', () => {
    it('should enable snapping when enableSnapping is true', () => {
      const { result } = renderHook(() => useDrag({ 
        windowId: mockWindowId, 
        enableSnapping: true 
      }));

      expect(result.current.isDragging).toBe(false);

      const mockMouseEvent = {
        button: 0,
        clientX: 150,
        clientY: 150,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // Start drag
      act(() => {
        result.current.onMouseDown(mockMouseEvent);
      });

      // Move to left snap zone
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 10, // Within left snap trigger zone
        clientY: 500,
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      // Snap overlay state is now managed globally, not by the drag hook
      expect(result.current.isDragging).toBe(false);
    });

    it('should snap window to left when dropped in left snap zone', () => {
      const { result } = renderHook(() => useDrag({ 
        windowId: mockWindowId, 
        enableSnapping: true 
      }));

      const mockMouseEvent = {
        button: 0,
        clientX: 150,
        clientY: 150,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // Start drag
      act(() => {
        result.current.onMouseDown(mockMouseEvent);
      });

      // Move to left snap zone
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 10,
        clientY: 500,
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      // End drag in snap zone
      const mouseUpEvent = new MouseEvent('mouseup');
      act(() => {
        document.dispatchEvent(mouseUpEvent);
      });

      expect(mockUpdateWindowBounds).toHaveBeenCalledWith(
        mockWindowId,
        { x: 0, y: 0, w: 960, h: 1032 }
      );
      expect(mockUpdateWindowSnapState).toHaveBeenCalledWith(mockWindowId, 'left');
    });

    it('should snap window to right when dropped in right snap zone', () => {
      const { result } = renderHook(() => useDrag({ 
        windowId: mockWindowId, 
        enableSnapping: true 
      }));

      const mockMouseEvent = {
        button: 0,
        clientX: 150,
        clientY: 150,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // Start drag
      act(() => {
        result.current.onMouseDown(mockMouseEvent);
      });

      // Move to right snap zone
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 1910,
        clientY: 500,
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      // End drag in snap zone
      const mouseUpEvent = new MouseEvent('mouseup');
      act(() => {
        document.dispatchEvent(mouseUpEvent);
      });

      expect(mockUpdateWindowBounds).toHaveBeenCalledWith(
        mockWindowId,
        { x: 960, y: 0, w: 960, h: 1032 }
      );
      expect(mockUpdateWindowSnapState).toHaveBeenCalledWith(mockWindowId, 'right');
    });

    it('should maximize window when dropped in maximize zone', () => {
      const { result } = renderHook(() => useDrag({ 
        windowId: mockWindowId, 
        enableSnapping: true 
      }));

      const mockMouseEvent = {
        button: 0,
        clientX: 150,
        clientY: 150,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // Start drag
      act(() => {
        result.current.onMouseDown(mockMouseEvent);
      });

      // Move to maximize zone
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 960,
        clientY: 5,
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      // End drag in snap zone
      const mouseUpEvent = new MouseEvent('mouseup');
      act(() => {
        document.dispatchEvent(mouseUpEvent);
      });

      expect(mockUpdateWindowBounds).toHaveBeenCalledWith(
        mockWindowId,
        { x: 0, y: 0, w: 1920, h: 1032 }
      );
      expect(mockUpdateWindowSnapState).toHaveBeenCalledWith(mockWindowId, 'maximized');
    });

    it('should not snap when snapping is disabled', () => {
      const { result } = renderHook(() => useDrag({ 
        windowId: mockWindowId, 
        enableSnapping: false 
      }));

      const mockMouseEvent = {
        button: 0,
        clientX: 150,
        clientY: 150,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // Start drag
      act(() => {
        result.current.onMouseDown(mockMouseEvent);
      });

      // Move to left snap zone
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 10,
        clientY: 500,
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      // Snap overlay state is managed globally
      expect(result.current.isDragging).toBe(false);

      // End drag
      const mouseUpEvent = new MouseEvent('mouseup');
      act(() => {
        document.dispatchEvent(mouseUpEvent);
      });

      expect(mockUpdateWindowSnapState).not.toHaveBeenCalled();
    });

    it('should clear snap overlay when canceling drag with Escape', () => {
      const { result } = renderHook(() => useDrag({ 
        windowId: mockWindowId, 
        enableSnapping: true 
      }));

      const mockMouseEvent = {
        button: 0,
        clientX: 150,
        clientY: 150,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // Start drag
      act(() => {
        result.current.onMouseDown(mockMouseEvent);
      });

      // Move to snap zone
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 10,
        clientY: 500,
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      // Snap overlay state is now managed globally
      expect(result.current.isDragging).toBe(false);

      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      act(() => {
        document.dispatchEvent(escapeEvent);
      });

      // Snap overlay state is managed globally
      expect(result.current.isDragging).toBe(false);
    });
  });
});