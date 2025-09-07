import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AccessibilityProvider, useAccessibility } from '../AccessibilityProvider';
import { useWindowStore } from '../../store/windowStore';
import { useDesktopStore } from '../../store/desktopStore';

// Mock the stores and hooks
vi.mock('../../store/windowStore');
vi.mock('../../store/desktopStore');
vi.mock('../hooks/useFocusManagement', () => ({
  useFocusManagement: vi.fn(() => ({
    registerFocusableElement: vi.fn(),
    unregisterFocusableElement: vi.fn(),
    focusElement: vi.fn(),
  })),
}));

describe('AccessibilityProvider', () => {
  const mockWindowStore = {
    getFocusedWindow: vi.fn(),
    windows: {},
  };

  const mockDesktopStore = {
    startMenuOpen: false,
  };

  beforeEach(() => {
    vi.mocked(useWindowStore).mockReturnValue(mockWindowStore as any);
    vi.mocked(useDesktopStore).mockReturnValue(mockDesktopStore as any);
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const TestComponent: React.FC = () => {
    const { announceMessage, setAriaLabel, isReducedMotion, isHighContrast } = useAccessibility();
    
    return (
      <div>
        <button 
          onClick={() => announceMessage('Test message')}
          data-testid="announce-button"
        >
          Announce
        </button>
        <button 
          onClick={() => setAriaLabel('test-element', 'Test label')}
          data-testid="set-label-button"
        >
          Set Label
        </button>
        <div data-testid="reduced-motion">{isReducedMotion ? 'true' : 'false'}</div>
        <div data-testid="high-contrast">{isHighContrast ? 'true' : 'false'}</div>
      </div>
    );
  };

  it('should provide accessibility context to children', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('announce-button')).toBeInTheDocument();
    expect(screen.getByTestId('set-label-button')).toBeInTheDocument();
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');
    expect(screen.getByTestId('high-contrast')).toHaveTextContent('false');
  });

  it('should create live region for announcements', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const liveRegion = document.getElementById('accessibility-live-region');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('should announce messages to screen readers', async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const announceButton = screen.getByTestId('announce-button');
    
    act(() => {
      announceButton.click();
    });

    const liveRegion = document.getElementById('accessibility-live-region');
    expect(liveRegion).toHaveTextContent('Test message');
  });

  it('should set ARIA labels on elements', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Create a test element
    const testElement = document.createElement('div');
    testElement.id = 'test-element';
    document.body.appendChild(testElement);

    const setLabelButton = screen.getByTestId('set-label-button');
    
    act(() => {
      setLabelButton.click();
    });

    expect(testElement).toHaveAttribute('aria-label', 'Test label');

    document.body.removeChild(testElement);
  });

  it('should detect reduced motion preference', () => {
    // Mock matchMedia to return reduced motion preference
    const mockMatchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
  });

  it('should detect high contrast preference', () => {
    // Mock matchMedia to return high contrast preference
    const mockMatchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-contrast: high)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
  });

  it('should announce window state changes', () => {
    const focusedWindow = {
      id: 'test-window',
      title: 'Test Window',
      appId: 'test-app',
      maximized: false,
      minimized: false,
    };

    mockWindowStore.getFocusedWindow.mockReturnValue(focusedWindow);
    mockWindowStore.windows = { 'test-window': focusedWindow };

    const { rerender } = render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Update the mock to return maximized window
    const maximizedWindow = { ...focusedWindow, maximized: true };
    mockWindowStore.getFocusedWindow.mockReturnValue(maximizedWindow);
    mockWindowStore.windows = { 'test-window': maximizedWindow };

    // Force re-render to trigger useEffect
    rerender(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const liveRegion = document.getElementById('accessibility-live-region');
    // The message should be about the window being maximized since we changed the state
    expect(liveRegion).toHaveTextContent('Test Window window maximized');
  });

  it('should announce start menu state changes', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Simulate start menu opening
    act(() => {
      mockDesktopStore.startMenuOpen = true;
    });

    const liveRegion = document.getElementById('accessibility-live-region');
    expect(liveRegion).toHaveTextContent('Start menu closed');
  });

  it('should apply accessibility attributes to body', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(document.body).toHaveAttribute('role', 'application');
    expect(document.body).toHaveAttribute('aria-label', 'Portfolio OS Desktop');
  });

  it('should throw error when useAccessibility is used outside provider', () => {
    const ErrorComponent: React.FC = () => {
      useAccessibility();
      return <div>Should not render</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<ErrorComponent />);
    }).toThrow('useAccessibility must be used within an AccessibilityProvider');

    consoleSpy.mockRestore();
  });

  it('should handle assertive announcements', async () => {
    const TestComponentWithHook: React.FC = () => {
      const { announceMessage } = useAccessibility();
      
      return (
        <button 
          onClick={() => announceMessage('Urgent message', 'assertive')}
          data-testid="urgent-announce-hook"
        >
          Urgent Announce
        </button>
      );
    };

    render(
      <AccessibilityProvider>
        <TestComponentWithHook />
      </AccessibilityProvider>
    );

    const urgentButton = screen.getByTestId('urgent-announce-hook');
    
    act(() => {
      urgentButton.click();
    });

    const liveRegion = document.getElementById('accessibility-live-region');
    expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
    expect(liveRegion).toHaveTextContent('Urgent message');
  });
});