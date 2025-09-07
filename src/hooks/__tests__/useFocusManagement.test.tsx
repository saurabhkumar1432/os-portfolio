import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFocusManagement } from '../useFocusManagement';
import { useWindowStore } from '../../store/windowStore';
import { useDesktopStore } from '../../store/desktopStore';

// Mock the stores
vi.mock('../../store/windowStore');
vi.mock('../../store/desktopStore');

describe('useFocusManagement', () => {
  const mockWindowStore = {
    windows: {},
  };

  const mockDesktopStore = {
    startMenuOpen: false,
  };

  beforeEach(() => {
    vi.mocked(useWindowStore).mockReturnValue(mockWindowStore as any);
    vi.mocked(useDesktopStore).mockReturnValue(mockDesktopStore as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Element registration', () => {
    it('should register and unregister focusable elements', () => {
      const { result } = renderHook(() => useFocusManagement());
      const mockElement = document.createElement('button');
      
      // Register element
      act(() => {
        const cleanup = result.current.registerFocusableElement(
          'test-element',
          mockElement,
          'desktop-icon',
          0
        );
        
        expect(cleanup).toBeTypeOf('function');
      });

      // Unregister element
      act(() => {
        result.current.unregisterFocusableElement('test-element');
      });
    });

    it('should handle element focus and blur events', () => {
      const { result } = renderHook(() => useFocusManagement());
      const mockElement = document.createElement('button');
      document.body.appendChild(mockElement);
      
      act(() => {
        result.current.registerFocusableElement(
          'test-element',
          mockElement,
          'desktop-icon',
          0
        );
      });

      // Simulate focus
      act(() => {
        mockElement.focus();
        mockElement.dispatchEvent(new FocusEvent('focus'));
      });

      expect(result.current.currentFocusId).toBe('test-element');

      // Simulate blur
      act(() => {
        mockElement.blur();
        mockElement.dispatchEvent(new FocusEvent('blur'));
      });

      // The blur handler only clears focus if the current focus matches
      expect(result.current.currentFocusId).toBe(null);

      document.body.removeChild(mockElement);
    });
  });

  describe('Focus navigation', () => {
    it('should focus next element in tab order', () => {
      const { result } = renderHook(() => useFocusManagement());
      const element1 = document.createElement('button');
      const element2 = document.createElement('button');
      
      document.body.appendChild(element1);
      document.body.appendChild(element2);

      act(() => {
        result.current.registerFocusableElement('element1', element1, 'desktop-icon', 0);
        result.current.registerFocusableElement('element2', element2, 'desktop-icon', 1);
      });

      // Focus first element
      act(() => {
        element1.focus();
        element1.dispatchEvent(new FocusEvent('focus'));
      });

      expect(result.current.currentFocusId).toBe('element1');

      // Focus next
      act(() => {
        result.current.focusNext();
      });

      // Should cycle to first element since there are only 2
      expect(document.activeElement).toBe(element2);

      document.body.removeChild(element1);
      document.body.removeChild(element2);
    });

    it('should focus previous element in tab order', () => {
      const { result } = renderHook(() => useFocusManagement());
      const element1 = document.createElement('button');
      const element2 = document.createElement('button');
      
      document.body.appendChild(element1);
      document.body.appendChild(element2);

      act(() => {
        result.current.registerFocusableElement('element1', element1, 'desktop-icon', 0);
        result.current.registerFocusableElement('element2', element2, 'desktop-icon', 1);
      });

      // Focus second element
      act(() => {
        element2.focus();
        element2.dispatchEvent(new FocusEvent('focus'));
      });

      expect(result.current.currentFocusId).toBe('element2');

      // Focus previous
      act(() => {
        result.current.focusPrevious();
      });

      expect(document.activeElement).toBe(element1);

      document.body.removeChild(element1);
      document.body.removeChild(element2);
    });

    it('should focus first element', () => {
      const { result } = renderHook(() => useFocusManagement());
      const element1 = document.createElement('button');
      const element2 = document.createElement('button');
      
      document.body.appendChild(element1);
      document.body.appendChild(element2);

      act(() => {
        result.current.registerFocusableElement('element1', element1, 'desktop-icon', 0);
        result.current.registerFocusableElement('element2', element2, 'desktop-icon', 1);
      });

      act(() => {
        result.current.focusFirst();
      });

      expect(document.activeElement).toBe(element1);

      document.body.removeChild(element1);
      document.body.removeChild(element2);
    });

    it('should focus last element', () => {
      const { result } = renderHook(() => useFocusManagement());
      const element1 = document.createElement('button');
      const element2 = document.createElement('button');
      
      document.body.appendChild(element1);
      document.body.appendChild(element2);

      act(() => {
        result.current.registerFocusableElement('element1', element1, 'desktop-icon', 0);
        result.current.registerFocusableElement('element2', element2, 'desktop-icon', 1);
      });

      act(() => {
        result.current.focusLast();
      });

      expect(document.activeElement).toBe(element2);

      document.body.removeChild(element1);
      document.body.removeChild(element2);
    });

    it('should focus element by ID', () => {
      const { result } = renderHook(() => useFocusManagement());
      const element1 = document.createElement('button');
      const element2 = document.createElement('button');
      
      document.body.appendChild(element1);
      document.body.appendChild(element2);

      act(() => {
        result.current.registerFocusableElement('element1', element1, 'desktop-icon', 0);
        result.current.registerFocusableElement('element2', element2, 'desktop-icon', 1);
      });

      act(() => {
        result.current.focusElement('element2');
      });

      expect(document.activeElement).toBe(element2);

      document.body.removeChild(element1);
      document.body.removeChild(element2);
    });
  });

  describe('Element filtering', () => {
    it('should filter out hidden elements', () => {
      const { result } = renderHook(() => useFocusManagement());
      const visibleElement = document.createElement('button');
      const hiddenElement = document.createElement('button');
      
      hiddenElement.style.display = 'none';
      
      document.body.appendChild(visibleElement);
      document.body.appendChild(hiddenElement);

      act(() => {
        result.current.registerFocusableElement('visible', visibleElement, 'desktop-icon', 0);
        result.current.registerFocusableElement('hidden', hiddenElement, 'desktop-icon', 1);
      });

      const focusableElements = result.current.getFocusableElements();
      expect(focusableElements).toHaveLength(1);
      expect(focusableElements[0].id).toBe('visible');

      document.body.removeChild(visibleElement);
      document.body.removeChild(hiddenElement);
    });

    it('should filter out disabled elements', () => {
      const { result } = renderHook(() => useFocusManagement());
      const enabledElement = document.createElement('button');
      const disabledElement = document.createElement('button');
      
      disabledElement.setAttribute('disabled', 'true');
      
      document.body.appendChild(enabledElement);
      document.body.appendChild(disabledElement);

      act(() => {
        result.current.registerFocusableElement('enabled', enabledElement, 'desktop-icon', 0);
        result.current.registerFocusableElement('disabled', disabledElement, 'desktop-icon', 1);
      });

      const focusableElements = result.current.getFocusableElements();
      expect(focusableElements).toHaveLength(1);
      expect(focusableElements[0].id).toBe('enabled');

      document.body.removeChild(enabledElement);
      document.body.removeChild(disabledElement);
    });

    it('should filter minimized windows', () => {
      const { result } = renderHook(() => useFocusManagement({ enabled: true }));
      const windowElement = document.createElement('div');
      
      // Mock window store with minimized window
      mockWindowStore.windows = {
        'window1': { id: 'window1', minimized: true },
      };
      
      document.body.appendChild(windowElement);

      act(() => {
        result.current.registerFocusableElement('window1', windowElement, 'window', 0);
      });

      const focusableElements = result.current.getFocusableElements();
      expect(focusableElements).toHaveLength(0);

      document.body.removeChild(windowElement);
    });

    it('should include visible windows', () => {
      const { result } = renderHook(() => useFocusManagement({ enabled: true }));
      const windowElement = document.createElement('div');
      
      // Mock window store with visible window
      mockWindowStore.windows = {
        'window1': { id: 'window1', minimized: false },
      };
      
      document.body.appendChild(windowElement);

      act(() => {
        result.current.registerFocusableElement('window1', windowElement, 'window', 0);
      });

      const focusableElements = result.current.getFocusableElements();
      expect(focusableElements).toHaveLength(1);
      expect(focusableElements[0].id).toBe('window1');

      document.body.removeChild(windowElement);
    });
  });

  describe('Keyboard navigation', () => {
    it('should handle Tab key for focus navigation', () => {
      const { result } = renderHook(() => useFocusManagement());
      const element1 = document.createElement('button');
      const element2 = document.createElement('button');
      
      document.body.appendChild(element1);
      document.body.appendChild(element2);

      act(() => {
        result.current.registerFocusableElement('element1', element1, 'desktop-icon', 0);
        result.current.registerFocusableElement('element2', element2, 'desktop-icon', 1);
      });

      // Focus first element
      act(() => {
        element1.focus();
        element1.dispatchEvent(new FocusEvent('focus'));
      });

      // Simulate Tab key
      act(() => {
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        document.dispatchEvent(tabEvent);
      });

      expect(document.activeElement).toBe(element2);

      document.body.removeChild(element1);
      document.body.removeChild(element2);
    });

    it('should handle Shift+Tab for reverse navigation', () => {
      const { result } = renderHook(() => useFocusManagement());
      const element1 = document.createElement('button');
      const element2 = document.createElement('button');
      
      document.body.appendChild(element1);
      document.body.appendChild(element2);

      act(() => {
        result.current.registerFocusableElement('element1', element1, 'desktop-icon', 0);
        result.current.registerFocusableElement('element2', element2, 'desktop-icon', 1);
      });

      // Focus second element
      act(() => {
        element2.focus();
        element2.dispatchEvent(new FocusEvent('focus'));
      });

      // Simulate Shift+Tab key
      act(() => {
        const shiftTabEvent = new KeyboardEvent('keydown', { 
          key: 'Tab', 
          shiftKey: true 
        });
        document.dispatchEvent(shiftTabEvent);
      });

      expect(document.activeElement).toBe(element1);

      document.body.removeChild(element1);
      document.body.removeChild(element2);
    });
  });

  describe('Options', () => {
    it('should respect enabled option', () => {
      const { result } = renderHook(() => useFocusManagement({ enabled: false }));
      const mockElement = document.createElement('button');
      
      // Should not register when disabled
      act(() => {
        const cleanup = result.current.registerFocusableElement(
          'test-element',
          mockElement,
          'desktop-icon',
          0
        );
        
        expect(cleanup).toBeUndefined();
      });
    });

    it('should handle restore focus option', () => {
      const { result } = renderHook(() => useFocusManagement({ restoreFocus: true }));
      const mockElement = document.createElement('button');
      
      document.body.appendChild(mockElement);

      act(() => {
        result.current.registerFocusableElement('test-element', mockElement, 'desktop-icon', 0);
      });

      // Focus element to set as last focused
      act(() => {
        mockElement.focus();
        mockElement.dispatchEvent(new FocusEvent('focus'));
      });

      // Restore focus
      act(() => {
        result.current.restoreFocusToLast();
      });

      expect(document.activeElement).toBe(mockElement);

      document.body.removeChild(mockElement);
    });
  });

  describe('Element sorting', () => {
    it('should sort elements by priority and type', () => {
      const { result } = renderHook(() => useFocusManagement());
      const desktopIcon = document.createElement('button');
      const taskbarButton = document.createElement('button');
      const window = document.createElement('div');
      
      document.body.appendChild(desktopIcon);
      document.body.appendChild(taskbarButton);
      document.body.appendChild(window);

      // Mock window store to include the window
      mockWindowStore.windows = {
        'window': { id: 'window', minimized: false },
      };

      act(() => {
        result.current.registerFocusableElement('window', window, 'window', 2);
        result.current.registerFocusableElement('taskbar', taskbarButton, 'taskbar-button', 1);
        result.current.registerFocusableElement('desktop', desktopIcon, 'desktop-icon', 0);
      });

      const focusableElements = result.current.getFocusableElements();
      
      expect(focusableElements).toHaveLength(3);
      
      // Should be sorted by priority: desktop (0), taskbar (1), window (2)
      expect(focusableElements[0].id).toBe('desktop');
      expect(focusableElements[1].id).toBe('taskbar');
      expect(focusableElements[2].id).toBe('window');

      document.body.removeChild(desktopIcon);
      document.body.removeChild(taskbarButton);
      document.body.removeChild(window);
    });
  });
});