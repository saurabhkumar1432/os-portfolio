import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { 
  KeyboardShortcutProvider, 
  useKeyboardShortcutContext,
} from '../KeyboardShortcutProvider';

// Mock the useKeyboardShortcuts hook
vi.mock('../../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(() => ({
    pressedKeys: ['Ctrl'],
    isKeyPressed: (key: string) => key === 'Ctrl',
    getSystemShortcuts: () => [],
  })),
}));

describe('KeyboardShortcutProvider', () => {
  const TestComponent: React.FC = () => {
    const { pressedKeys, isKeyPressed } = useKeyboardShortcutContext();
    
    return (
      <div>
        <div data-testid="pressed-keys">{pressedKeys.join(', ')}</div>
        <div data-testid="ctrl-pressed">{isKeyPressed('Ctrl') ? 'true' : 'false'}</div>
      </div>
    );
  };

  it('should provide keyboard shortcut context to children', () => {
    render(
      <KeyboardShortcutProvider>
        <TestComponent />
      </KeyboardShortcutProvider>
    );

    expect(screen.getByTestId('pressed-keys')).toHaveTextContent('Ctrl');
    expect(screen.getByTestId('ctrl-pressed')).toHaveTextContent('true');
  });

  it('should throw error when useKeyboardShortcutContext is used outside provider', () => {
    const ErrorComponent: React.FC = () => {
      useKeyboardShortcutContext();
      return <div>Should not render</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<ErrorComponent />);
    }).toThrow('useKeyboardShortcutContext must be used within a KeyboardShortcutProvider');

    consoleSpy.mockRestore();
  });
});