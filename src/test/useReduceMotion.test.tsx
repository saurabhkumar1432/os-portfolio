import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { usePreferencesStore } from '../store/preferencesStore';

// Mock the preferences store
vi.mock('../store/preferencesStore');

// Mock matchMedia
const mockMatchMedia = vi.fn();

describe('useReduceMotion', () => {
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

  it('adds reduce-motion class when preference is enabled', () => {
    (usePreferencesStore as any).mockReturnValue({
      reduceMotion: true,
    });
    
    renderHook(() => useReduceMotion());
    
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('reduce-motion');
  });

  it('removes reduce-motion class when preference is disabled', () => {
    (usePreferencesStore as any).mockReturnValue({
      reduceMotion: false,
    });
    
    renderHook(() => useReduceMotion());
    
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('reduce-motion');
  });

  it('returns the current reduce motion preference', () => {
    (usePreferencesStore as any).mockReturnValue({
      reduceMotion: true,
    });
    
    const { result } = renderHook(() => useReduceMotion());
    
    expect(result.current).toBe(true);
  });

  it('listens for system reduce motion preference', () => {
    const mockAddEventListener = vi.fn();
    const mockRemoveEventListener = vi.fn();
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });
    
    (usePreferencesStore as any).mockReturnValue({
      reduceMotion: false,
    });
    
    const { unmount } = renderHook(() => useReduceMotion());
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('applies system preference when user preference is false', () => {
    mockMatchMedia.mockReturnValue({
      matches: true, // System prefers reduced motion
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    
    (usePreferencesStore as any).mockReturnValue({
      reduceMotion: false,
    });
    
    renderHook(() => useReduceMotion());
    
    // Should add reduce-motion class due to system preference
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('reduce-motion');
  });

  it('does not override user preference with system preference', () => {
    mockMatchMedia.mockReturnValue({
      matches: false, // System does not prefer reduced motion
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    
    (usePreferencesStore as any).mockReturnValue({
      reduceMotion: true, // User explicitly wants reduced motion
    });
    
    renderHook(() => useReduceMotion());
    
    // Should still add reduce-motion class due to user preference
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('reduce-motion');
  });

  it('cleans up class on unmount', () => {
    (usePreferencesStore as any).mockReturnValue({
      reduceMotion: true,
    });
    
    const { unmount } = renderHook(() => useReduceMotion());
    
    unmount();
    
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('reduce-motion');
  });

  it('handles media query change events', () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | undefined;
    
    const mockAddEventListener = vi.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });
    
    const mockMediaQuery = {
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    (usePreferencesStore as any).mockReturnValue({
      reduceMotion: false,
    });
    
    renderHook(() => useReduceMotion());
    
    expect(changeHandler).toBeDefined();
    
    // Clear previous calls
    vi.clearAllMocks();
    
    // Update the mock to return true for matches
    mockMediaQuery.matches = true;
    
    // Simulate system preference change to reduced motion
    if (changeHandler) {
      changeHandler({ matches: true } as MediaQueryListEvent);
    }
    
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('reduce-motion');
  });

  it('does not apply system preference when user has explicit preference', () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | undefined;
    
    const mockAddEventListener = vi.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: vi.fn(),
    });
    
    (usePreferencesStore as any).mockReturnValue({
      reduceMotion: true, // User has explicit preference
    });
    
    renderHook(() => useReduceMotion());
    
    // Clear previous calls
    vi.clearAllMocks();
    
    // Simulate system preference change
    if (changeHandler) {
      changeHandler({ matches: false } as MediaQueryListEvent);
    }
    
    // Should not remove the class because user has explicit preference
    expect(document.documentElement.classList.remove).not.toHaveBeenCalledWith('reduce-motion');
  });
});