import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Desktop } from '../desktop/Desktop';
import { AccessibilityProvider } from '../AccessibilityProvider';

// Mock the stores
vi.mock('../../store/desktopStore', () => ({
  useDesktopStore: vi.fn(() => ({
    icons: [
      {
        id: 'projects',
        label: 'Projects',
        appId: 'projects',
        x: 50,
        y: 50,
        selected: false,
      }
    ],
    contextMenu: null,
    clearSelection: vi.fn(),
    iconSize: 'md',
    selectIcon: vi.fn(),
  })),
}));

vi.mock('../../store/preferencesStore', () => ({
  usePreferencesStore: vi.fn(() => ({
    wallpaper: 'default',
    theme: 'dark',
  })),
}));

vi.mock('../../store/windowStore', () => ({
  useWindowStore: vi.fn(() => ({
    createWindow: vi.fn(),
    windows: {},
    getFocusedWindow: vi.fn(() => null),
  })),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('Desktop Component', () => {
  it('renders desktop with wallpaper background', () => {
    render(
      <AccessibilityProvider>
        <Desktop />
      </AccessibilityProvider>
    );
    
    // Check if desktop container is rendered with proper classes
    const desktop = document.querySelector('.relative.w-full.h-full');
    expect(desktop).toBeInTheDocument();
  });
});