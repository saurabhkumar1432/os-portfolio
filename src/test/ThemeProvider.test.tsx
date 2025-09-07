import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from '../components/ThemeProvider';
import { usePreferencesStore } from '../store/preferencesStore';

// Mock the preferences store
vi.mock('../store/preferencesStore');

// Test component that uses the theme context
const TestComponent: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
    </div>
  );
};

// Mock matchMedia
const mockMatchMedia = vi.fn();

describe('ThemeProvider', () => {
  const mockSetTheme = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock usePreferencesStore
    (usePreferencesStore as any).mockReturnValue({
      theme: 'auto',
      setTheme: mockSetTheme,
    });
    
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
    
    // Mock document.documentElement
    document.documentElement.classList.remove = vi.fn();
    document.documentElement.classList.add = vi.fn();
    
    // Mock meta theme-color element
    const mockMetaElement = {
      setAttribute: vi.fn(),
    };
    document.querySelector = vi.fn().mockReturnValue(mockMetaElement);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides theme context to children', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme')).toHaveTextContent('auto');
  });

  it('resolves auto theme to light when system prefers light', () => {
    mockMatchMedia.mockReturnValue({
      matches: false, // prefers light
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
  });

  it('resolves auto theme to dark when system prefers dark', () => {
    mockMatchMedia.mockReturnValue({
      matches: true, // prefers dark
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
  });

  it('uses explicit theme when not auto', () => {
    (usePreferencesStore as any).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
  });

  it('applies theme class to document element', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('light');
  });

  it('updates meta theme-color for mobile browsers', () => {
    const mockMetaElement = {
      setAttribute: vi.fn(),
    };
    document.querySelector = vi.fn().mockReturnValue(mockMetaElement);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(mockMetaElement.setAttribute).toHaveBeenCalledWith('content', '#ffffff');
  });

  it('updates meta theme-color for dark theme', () => {
    const mockMetaElement = {
      setAttribute: vi.fn(),
    };
    document.querySelector = vi.fn().mockReturnValue(mockMetaElement);
    
    (usePreferencesStore as any).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(mockMetaElement.setAttribute).toHaveBeenCalledWith('content', '#1f2937');
  });

  it('listens for system theme changes in auto mode', () => {
    const mockAddEventListener = vi.fn();
    const mockRemoveEventListener = vi.fn();
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });
    
    const { unmount } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('does not listen for system changes when theme is not auto', () => {
    const mockAddEventListener = vi.fn();
    
    (usePreferencesStore as any).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: vi.fn(),
    });
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(mockAddEventListener).not.toHaveBeenCalled();
  });

  it('throws error when useTheme is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleSpy.mockRestore();
  });

  it('handles system theme change events', () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | undefined;
    
    const mockAddEventListener = vi.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });
    
    // Mock the media query to return different values for matches
    const mockMediaQuery = {
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(changeHandler).toBeDefined();
    
    // Clear previous calls
    vi.clearAllMocks();
    
    // Update the mock to return true for matches and simulate change
    mockMediaQuery.matches = true;
    
    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true } as MediaQueryListEvent);
      }
    });
    
    // Should update document classes
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
  });
});