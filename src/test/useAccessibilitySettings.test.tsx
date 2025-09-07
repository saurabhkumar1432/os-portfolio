import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAccessibilitySettings } from '../hooks/useAccessibilitySettings';
import { usePreferencesStore } from '../store/preferencesStore';

// Mock the preferences store
vi.mock('../store/preferencesStore');

// Mock matchMedia
const mockMatchMedia = vi.fn();

describe('useAccessibilitySettings', () => {
  const createMockPreferences = (overrides = {}) => ({
    highContrast: false,
    largeText: false,
    focusIndicators: false,
    screenReaderOptimized: false,
    reduceMotion: false,
    updatePreferences: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock document.documentElement
    document.documentElement.classList.add = vi.fn();
    document.documentElement.classList.remove = vi.fn();
    
    // Mock window.matchMedia
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('applies high contrast class when enabled', () => {
    (usePreferencesStore as any).mockReturnValue(createMockPreferences({
      highContrast: true,
    }));
    
    renderHook(() => useAccessibilitySettings());
    
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('high-contrast');
  });

  it('applies large text class when enabled', () => {
    (usePreferencesStore as any).mockReturnValue(createMockPreferences({
      largeText: true,
    }));
    
    renderHook(() => useAccessibilitySettings());
    
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('large-text');
  });

  it('applies enhanced focus class when enabled', () => {
    (usePreferencesStore as any).mockReturnValue(createMockPreferences({
      focusIndicators: true,
    }));
    
    renderHook(() => useAccessibilitySettings());
    
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('enhanced-focus');
  });

  it('applies screen reader optimized class when enabled', () => {
    (usePreferencesStore as any).mockReturnValue(createMockPreferences({
      screenReaderOptimized: true,
    }));
    
    renderHook(() => useAccessibilitySettings());
    
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('screen-reader-optimized');
  });

  it('removes classes when settings are disabled', () => {
    (usePreferencesStore as any).mockReturnValue(createMockPreferences());
    
    renderHook(() => useAccessibilitySettings());
    
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('high-contrast');
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('large-text');
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('enhanced-focus');
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('screen-reader-optimized');
  });

  it('applies multiple classes when multiple settings are enabled', () => {
    (usePreferencesStore as any).mockReturnValue(createMockPreferences({
      highContrast: true,
      largeText: true,
      focusIndicators: true,
      screenReaderOptimized: true,
    }));
    
    renderHook(() => useAccessibilitySettings());
    
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('high-contrast');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('large-text');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('enhanced-focus');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('screen-reader-optimized');
  });

  it('listens for system contrast preference', () => {
    const mockAddEventListener = vi.fn();
    const mockRemoveEventListener = vi.fn();
    
    mockMatchMedia.mockImplementation((query) => ({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    }));
    
    (usePreferencesStore as any).mockReturnValue(createMockPreferences());
    
    const { unmount } = renderHook(() => useAccessibilitySettings());
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-contrast: high)');
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('applies system high contrast when detected and user setting is off', () => {
    mockMatchMedia.mockImplementation((query) => {
      if (query === '(prefers-contrast: high)') {
        return {
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
      }
      return {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });
    
    (usePreferencesStore as any).mockReturnValue(createMockPreferences());
    
    renderHook(() => useAccessibilitySettings());
    
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('system-high-contrast');
  });

  it('applies system reduce motion when detected', () => {
    mockMatchMedia.mockImplementation((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return {
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
      }
      return {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });
    
    (usePreferencesStore as any).mockReturnValue(createMockPreferences());
    
    renderHook(() => useAccessibilitySettings());
    
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('system-reduce-motion');
  });

  it('cleans up classes on unmount', () => {
    (usePreferencesStore as any).mockReturnValue(createMockPreferences({
      highContrast: true,
      largeText: true,
      focusIndicators: true,
      screenReaderOptimized: true,
    }));
    
    const { unmount } = renderHook(() => useAccessibilitySettings());
    
    unmount();
    
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
      'high-contrast',
      'large-text',
      'enhanced-focus',
      'screen-reader-optimized'
    );
  });

  it('returns current accessibility settings', () => {
    const mockSettings = createMockPreferences({
      highContrast: true,
      largeText: false,
      focusIndicators: true,
      screenReaderOptimized: false,
    });
    
    (usePreferencesStore as any).mockReturnValue(mockSettings);
    
    const { result } = renderHook(() => useAccessibilitySettings());
    
    expect(result.current).toEqual(expect.objectContaining({
      highContrast: true,
      largeText: false,
      focusIndicators: true,
      screenReaderOptimized: false,
    }));
  });
});