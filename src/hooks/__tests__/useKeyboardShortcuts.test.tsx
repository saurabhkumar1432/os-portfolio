import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { useWindowStore } from '../../store/windowStore';
import { useDesktopStore } from '../../store/desktopStore';
import { useStartMenuStore } from '../../store/startMenuStore';
import type { KeyboardShortcut } from '../../types';

// Mock the stores
vi.mock('../../store/windowStore');
vi.mock('../../store/desktopStore');
vi.mock('../../store/startMenuStore');

describe('useKeyboardShortcuts', () => {
  const mockWindowStore = {
    getFocusedWindow: vi.fn(),
    getVisibleWindows: vi.fn(),
    focusWindow: vi.fn(),
    updateWindowBounds: vi.fn(),
    updateWindowSnapState: vi.fn(),
    maximizeWindow: vi.fn(),
    requestCloseWindow: vi.fn(),
    minimizeWindow: vi.fn(),
  };

  const mockDesktopStore = {
    clearSelection: vi.fn(),
  };

  const mockStartMenuStore = {
    toggleStartMenu: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useWindowStore).mockReturnValue(mockWindowStore as any);
    vi.mocked(useDesktopStore).mockReturnValue(mockDesktopStore as any);
    vi.mocked(useStartMenuStore).mockReturnValue(mockStartMenuStore as any);
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });
    
    // Mock document methods
    document.exitFullscreen = vi.fn();
    document.documentElement.requestFullscreen = vi.fn();
    Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Key normalization', () => {
    it('should normalize common keys correctly', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      
      // Test key press detection
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Meta' });
        document.dispatchEvent(event);
      });
      
      expect(result.current.isKeyPressed('Win')).toBe(true);
    });

    it('should handle arrow keys normalization', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        document.dispatchEvent(event);
      });
      
      expect(result.current.isKeyPressed('Left')).toBe(true);
    });
  });

  describe('System shortcuts', () => {
    it('should open start menu with Win key', () => {
      renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Meta' });
        document.dispatchEvent(event);
      });
      
      expect(mockStartMenuStore.toggleStartMenu).toHaveBeenCalled();
    });

    it('should cycle windows with Alt+Tab', () => {
      const mockWindows = [
        { id: 'window1', focused: true },
        { id: 'window2', focused: false },
        { id: 'window3', focused: false },
      ];
      
      mockWindowStore.getVisibleWindows.mockReturnValue(mockWindows);
      mockWindowStore.getFocusedWindow.mockReturnValue(mockWindows[0]);
      
      renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        const altEvent = new KeyboardEvent('keydown', { key: 'Alt' });
        document.dispatchEvent(altEvent);
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        document.dispatchEvent(tabEvent);
      });
      
      expect(mockWindowStore.focusWindow).toHaveBeenCalledWith('window2');
    });

    it('should snap window to left with Win+Left', () => {
      const mockWindow = { id: 'window1', focused: true };
      mockWindowStore.getFocusedWindow.mockReturnValue(mockWindow);
      
      renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        // Press Win key first
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Meta' }));
        // Then press Left arrow while Win is still held
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      });
      
      expect(mockWindowStore.updateWindowBounds).toHaveBeenCalledWith('window1', {
        x: 0,
        y: 0,
        w: 960, // Half of 1920
        h: 1032, // 1080 - 48 (taskbar)
      });
      expect(mockWindowStore.updateWindowSnapState).toHaveBeenCalledWith('window1', 'left');
    });

    it('should snap window to right with Win+Right', () => {
      const mockWindow = { id: 'window1', focused: true };
      mockWindowStore.getFocusedWindow.mockReturnValue(mockWindow);
      
      renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        const winEvent = new KeyboardEvent('keydown', { key: 'Meta' });
        document.dispatchEvent(winEvent);
        const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        document.dispatchEvent(rightEvent);
      });
      
      expect(mockWindowStore.updateWindowBounds).toHaveBeenCalledWith('window1', {
        x: 960, // Half of 1920
        y: 0,
        w: 960,
        h: 1032,
      });
      expect(mockWindowStore.updateWindowSnapState).toHaveBeenCalledWith('window1', 'right');
    });

    it('should maximize window with Win+Up', () => {
      const mockWindow = { id: 'window1', focused: true, maximized: false };
      mockWindowStore.getFocusedWindow.mockReturnValue(mockWindow);
      
      renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        const winEvent = new KeyboardEvent('keydown', { key: 'Meta' });
        document.dispatchEvent(winEvent);
        const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        document.dispatchEvent(upEvent);
      });
      
      expect(mockWindowStore.updateWindowBounds).toHaveBeenCalledWith('window1', {
        x: 0,
        y: 0,
        w: 1920,
        h: 1032,
      });
      expect(mockWindowStore.updateWindowSnapState).toHaveBeenCalledWith('window1', 'maximized');
      expect(mockWindowStore.maximizeWindow).toHaveBeenCalledWith('window1');
    });

    it('should close window with Ctrl+W', () => {
      const mockWindow = { id: 'window1', focused: true };
      mockWindowStore.getFocusedWindow.mockReturnValue(mockWindow);
      
      renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        const ctrlEvent = new KeyboardEvent('keydown', { key: 'Control' });
        document.dispatchEvent(ctrlEvent);
        const wEvent = new KeyboardEvent('keydown', { key: 'w' });
        document.dispatchEvent(wEvent);
      });
      
      expect(mockWindowStore.requestCloseWindow).toHaveBeenCalledWith('window1');
    });

    it('should minimize window with Ctrl+M', () => {
      const mockWindow = { id: 'window1', focused: true };
      mockWindowStore.getFocusedWindow.mockReturnValue(mockWindow);
      
      renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        const ctrlEvent = new KeyboardEvent('keydown', { key: 'Control' });
        document.dispatchEvent(ctrlEvent);
        const mEvent = new KeyboardEvent('keydown', { key: 'm' });
        document.dispatchEvent(mEvent);
      });
      
      expect(mockWindowStore.minimizeWindow).toHaveBeenCalledWith('window1');
    });

    it('should toggle fullscreen with F11', () => {
      renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        const f11Event = new KeyboardEvent('keydown', { key: 'F11' });
        document.dispatchEvent(f11Event);
      });
      
      expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
    });

    it('should exit fullscreen when already in fullscreen mode', () => {
      Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement });
      
      renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        const f11Event = new KeyboardEvent('keydown', { key: 'F11' });
        document.dispatchEvent(f11Event);
      });
      
      expect(document.exitFullscreen).toHaveBeenCalled();
    });
  });

  describe('Custom shortcuts', () => {
    it('should execute custom shortcuts', () => {
      const customAction = vi.fn();
      const customShortcuts: KeyboardShortcut[] = [
        {
          id: 'custom-shortcut',
          keys: ['Ctrl', 'Shift', 'N'],
          description: 'Custom action',
          action: customAction,
          preventDefault: true,
          global: true,
        },
      ];
      
      renderHook(() => useKeyboardShortcuts(customShortcuts));
      
      act(() => {
        // Press keys in sequence
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'N' }));
      });
      
      expect(customAction).toHaveBeenCalled();
    });

    it('should handle shortcut execution errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorAction = vi.fn(() => {
        throw new Error('Test error');
      });
      
      const customShortcuts: KeyboardShortcut[] = [
        {
          id: 'error-shortcut',
          keys: ['Ctrl', 'Shift', 'E'],
          description: 'Error action',
          action: errorAction,
          global: true,
        },
      ];
      
      renderHook(() => useKeyboardShortcuts(customShortcuts));
      
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'E' }));
      });
      
      expect(errorAction).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Error executing keyboard shortcut:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Key state management', () => {
    it('should track pressed keys correctly', () => {
      const { result, rerender } = renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      });
      
      rerender();
      expect(result.current.isKeyPressed('Ctrl')).toBe(true);
      expect(result.current.pressedKeys).toContain('Ctrl');
      
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control' }));
      });
      
      rerender();
      expect(result.current.isKeyPressed('Ctrl')).toBe(false);
      expect(result.current.pressedKeys).not.toContain('Ctrl');
    });

    it('should clear pressed keys on window blur', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        const ctrlEvent = new KeyboardEvent('keydown', { key: 'Control' });
        document.dispatchEvent(ctrlEvent);
      });
      
      expect(result.current.isKeyPressed('Ctrl')).toBe(true);
      
      act(() => {
        const blurEvent = new Event('blur');
        window.dispatchEvent(blurEvent);
      });
      
      expect(result.current.isKeyPressed('Ctrl')).toBe(false);
      expect(result.current.pressedKeys).toHaveLength(0);
    });
  });

  describe('Hook options', () => {
    it('should respect enabled option', () => {
      const customAction = vi.fn();
      const customShortcuts: KeyboardShortcut[] = [
        {
          id: 'test-shortcut',
          keys: ['Ctrl', 'T'],
          description: 'Test action',
          action: customAction,
        },
      ];
      
      renderHook(() => useKeyboardShortcuts(customShortcuts, { enabled: false }));
      
      act(() => {
        const ctrlEvent = new KeyboardEvent('keydown', { key: 'Control' });
        document.dispatchEvent(ctrlEvent);
        const tEvent = new KeyboardEvent('keydown', { key: 'T' });
        document.dispatchEvent(tEvent);
      });
      
      expect(customAction).not.toHaveBeenCalled();
    });

    it('should respect context option', () => {
      const customAction = vi.fn();
      const customShortcuts: KeyboardShortcut[] = [
        {
          id: 'window-shortcut',
          keys: ['Ctrl', 'W'],
          description: 'Window action',
          action: customAction,
          context: 'window',
        },
      ];
      
      renderHook(() => useKeyboardShortcuts(customShortcuts, { context: 'app' }));
      
      act(() => {
        const ctrlEvent = new KeyboardEvent('keydown', { key: 'Control' });
        document.dispatchEvent(ctrlEvent);
        const wEvent = new KeyboardEvent('keydown', { key: 'w' });
        document.dispatchEvent(wEvent);
      });
      
      // Should not execute because context doesn't match
      expect(customAction).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle no focused window gracefully', () => {
      mockWindowStore.getFocusedWindow.mockReturnValue(null);
      
      renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        const ctrlEvent = new KeyboardEvent('keydown', { key: 'Control' });
        document.dispatchEvent(ctrlEvent);
        const wEvent = new KeyboardEvent('keydown', { key: 'w' });
        document.dispatchEvent(wEvent);
      });
      
      // Should not crash when no window is focused
      expect(mockWindowStore.requestCloseWindow).not.toHaveBeenCalled();
    });

    it('should handle single window Alt+Tab gracefully', () => {
      const mockWindows = [{ id: 'window1', focused: true }];
      
      mockWindowStore.getVisibleWindows.mockReturnValue(mockWindows);
      mockWindowStore.getFocusedWindow.mockReturnValue(mockWindows[0]);
      
      renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        const altEvent = new KeyboardEvent('keydown', { key: 'Alt' });
        document.dispatchEvent(altEvent);
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        document.dispatchEvent(tabEvent);
      });
      
      // Should not crash with single window
      expect(mockWindowStore.focusWindow).not.toHaveBeenCalled();
    });

    it('should handle empty window list gracefully', () => {
      mockWindowStore.getVisibleWindows.mockReturnValue([]);
      
      renderHook(() => useKeyboardShortcuts());
      
      act(() => {
        const altEvent = new KeyboardEvent('keydown', { key: 'Alt' });
        document.dispatchEvent(altEvent);
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        document.dispatchEvent(tabEvent);
      });
      
      // Should not crash with no windows
      expect(mockWindowStore.focusWindow).not.toHaveBeenCalled();
    });
  });
});