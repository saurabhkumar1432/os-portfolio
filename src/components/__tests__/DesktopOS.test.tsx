import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DesktopOS } from '../DesktopOS';

// Mock the stores
const mockCreateWindow = vi.fn();

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
    selectIcon: vi.fn(),
    updateIconPosition: vi.fn(),
  })),
}));

vi.mock('../../store/windowStore', () => ({
  useWindowStore: vi.fn(() => ({
    windows: {},
    zOrder: [],
    createWindow: mockCreateWindow,
    focusWindow: vi.fn(),
    minimizeWindow: vi.fn(),
    maximizeWindow: vi.fn(),
    closeWindow: vi.fn(),
    getFocusedWindow: vi.fn(() => null),
    getVisibleWindows: vi.fn(() => []),
    getMinimizedWindows: vi.fn(() => []),
    isWindowFocused: vi.fn(() => false),
    hasUnsavedWindows: vi.fn(() => false),
  })),
}));

vi.mock('../../store/preferencesStore', () => ({
  usePreferencesStore: vi.fn(() => ({
    wallpaper: 'default',
    theme: 'dark',
    reduceMotion: false,
  })),
}));

vi.mock('../../store/startMenuStore', () => ({
  useStartMenuStore: vi.fn(() => ({
    isOpen: false,
    searchQuery: '',
    searchResults: [],
    selectedIndex: -1,
    pinnedApps: [],
    recentApps: [],
    setIsOpen: vi.fn(),
    toggleStartMenu: vi.fn(),
    setSearchQuery: vi.fn(),
    performSearch: vi.fn(),
    clearSearch: vi.fn(),
  })),
}));

describe('DesktopOS Integration', () => {
  it('renders desktop with taskbar and can handle icon interactions', () => {
    render(<DesktopOS />);
    
    // Check if main components are rendered
    expect(screen.getByText('Projects')).toBeInTheDocument();
    
    // Check if taskbar is rendered (look for system tray time)
    const timeElements = document.querySelectorAll('div');
    const hasTimeDisplay = Array.from(timeElements).some(el => 
      el.textContent && /\d{2}:\d{2}/.test(el.textContent)
    );
    expect(hasTimeDisplay).toBe(true);
  });

  it('can double-click desktop icon to create window', () => {
    render(<DesktopOS />);
    
    const projectsIcon = screen.getByText('Projects');
    fireEvent.doubleClick(projectsIcon);
    
    expect(mockCreateWindow).toHaveBeenCalledWith('projects');
  });
});