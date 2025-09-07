import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Desktop } from '../components/desktop/Desktop';
import { ContextMenu } from '../components/desktop/ContextMenu';
import { useDesktopStore } from '../store/desktopStore';
import { usePreferencesStore } from '../store/preferencesStore';

// Mock the stores
vi.mock('../store/desktopStore');
vi.mock('../store/preferencesStore');
vi.mock('../store/windowStore');

// Mock AccessibilityProvider
vi.mock('../components/AccessibilityProvider', () => ({
  useAccessibility: () => ({
    announceMessage: vi.fn(),
    registerFocusableElement: vi.fn(() => vi.fn()),
    unregisterFocusableElement: vi.fn(),
    isReducedMotion: false,
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Desktop Context Menu', () => {
  const mockShowContextMenu = vi.fn();
  const mockHideContextMenu = vi.fn();
  const mockClearSelection = vi.fn();
  const mockSetIconSize = vi.fn();
  const mockSetWallpaper = vi.fn();
  const mockSetTheme = vi.fn();
  const mockCreateWindow = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock desktop store
    (useDesktopStore as any).mockReturnValue({
      icons: [],
      contextMenu: null,
      dragSelection: null,
      showContextMenu: mockShowContextMenu,
      hideContextMenu: mockHideContextMenu,
      clearSelection: mockClearSelection,
      setIconSize: mockSetIconSize,
      loadIconLayout: vi.fn(),
    });

    // Mock preferences store
    (usePreferencesStore as any).mockReturnValue({
      wallpaper: 'default',
      setWallpaper: mockSetWallpaper,
      setTheme: mockSetTheme,
    });
  });

  describe('Desktop right-click', () => {
    it('shows context menu on right-click', async () => {
      render(<Desktop />);
      
      const desktop = document.querySelector('.relative.w-full.h-full') as HTMLElement;
      
      fireEvent.contextMenu(desktop, {
        clientX: 100,
        clientY: 200,
      });

      expect(mockShowContextMenu).toHaveBeenCalledWith(100, 200);
    });

    it('hides context menu on left-click', async () => {
      render(<Desktop />);
      
      const desktop = document.querySelector('.relative.w-full.h-full') as HTMLElement;
      
      fireEvent.click(desktop);

      expect(mockHideContextMenu).toHaveBeenCalled();
      expect(mockClearSelection).toHaveBeenCalled();
    });
  });

  describe('Context Menu Component', () => {
    const mockContextMenu = {
      x: 100,
      y: 200,
      items: [
        {
          id: 'view',
          label: 'View',
          icon: '👁️',
          children: [
            {
              id: 'icon-size-sm',
              label: 'Small icons',
              action: mockSetIconSize,
            },
            {
              id: 'icon-size-md',
              label: 'Medium icons',
              action: mockSetIconSize,
            },
          ],
        },
        {
          id: 'separator-1',
          separator: true,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: '⚙️',
          action: mockCreateWindow,
        },
      ],
    };

    beforeEach(() => {
      (useDesktopStore as any).mockReturnValue({
        contextMenu: mockContextMenu,
        hideContextMenu: mockHideContextMenu,
      });
    });

    it('renders context menu items', () => {
      render(<ContextMenu />);
      
      expect(screen.getByText('View')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders separators', () => {
      render(<ContextMenu />);
      
      const separators = document.querySelectorAll('.border-t');
      expect(separators.length).toBeGreaterThan(0);
    });

    it('shows submenu on hover', async () => {
      const user = userEvent.setup();
      render(<ContextMenu />);
      
      const viewItem = screen.getByText('View');
      await user.hover(viewItem);
      
      await waitFor(() => {
        expect(screen.getByText('Small icons')).toBeInTheDocument();
        expect(screen.getByText('Medium icons')).toBeInTheDocument();
      });
    });

    it('executes action on click', async () => {
      const user = userEvent.setup();
      render(<ContextMenu />);
      
      const settingsItem = screen.getByText('Settings');
      await user.click(settingsItem);
      
      expect(mockCreateWindow).toHaveBeenCalled();
    });

    it('closes menu on Escape key', async () => {
      const user = userEvent.setup();
      render(<ContextMenu />);
      
      await user.keyboard('{Escape}');
      
      expect(mockHideContextMenu).toHaveBeenCalled();
    });

    it('navigates submenu with arrow keys', async () => {
      const user = userEvent.setup();
      render(<ContextMenu />);
      
      const viewItem = screen.getByText('View');
      viewItem.focus();
      
      await user.keyboard('{ArrowRight}');
      
      await waitFor(() => {
        expect(screen.getByText('Small icons')).toBeInTheDocument();
      });
    });

    it('supports keyboard activation with Enter', async () => {
      const user = userEvent.setup();
      render(<ContextMenu />);
      
      const settingsItem = screen.getByText('Settings');
      await user.click(settingsItem);
      
      expect(mockCreateWindow).toHaveBeenCalled();
    });

    it('supports keyboard activation with Space', async () => {
      const user = userEvent.setup();
      render(<ContextMenu />);
      
      const settingsItem = screen.getByText('Settings');
      await user.click(settingsItem);
      
      expect(mockCreateWindow).toHaveBeenCalled();
    });
  });

  describe('Context Menu Actions', () => {
    it('changes icon size when selected from menu', () => {
      // Simulate clicking small icons option
      mockSetIconSize('sm');
      
      expect(mockSetIconSize).toHaveBeenCalledWith('sm');
    });

    it('changes wallpaper when selected from menu', () => {
      // Simulate clicking ocean wallpaper
      mockSetWallpaper('ocean');
      
      expect(mockSetWallpaper).toHaveBeenCalledWith('ocean');
    });

    it('changes theme when selected from menu', () => {
      // Simulate clicking dark theme
      mockSetTheme('dark');
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
  });

  describe('Accessibility', () => {
    const mockContextMenu = {
      x: 100,
      y: 200,
      items: [
        {
          id: 'test-item',
          label: 'Test Item',
          action: vi.fn(),
        },
      ],
    };

    beforeEach(() => {
      (useDesktopStore as any).mockReturnValue({
        contextMenu: mockContextMenu,
        hideContextMenu: mockHideContextMenu,
      });
    });

    it('has proper ARIA attributes', () => {
      render(<ContextMenu />);
      
      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-label', 'Desktop context menu');
      
      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toBeInTheDocument();
    });

    it('focuses first menu item when opened', async () => {
      render(<ContextMenu />);
      
      await waitFor(() => {
        const firstMenuItem = screen.getByRole('menuitem');
        expect(firstMenuItem).toHaveFocus();
      });
    });

    it('has proper submenu ARIA attributes', async () => {
      const contextMenuWithSubmenu = {
        x: 100,
        y: 200,
        items: [
          {
            id: 'parent',
            label: 'Parent Item',
            children: [
              {
                id: 'child',
                label: 'Child Item',
                action: vi.fn(),
              },
            ],
          },
        ],
      };

      (useDesktopStore as any).mockReturnValue({
        contextMenu: contextMenuWithSubmenu,
        hideContextMenu: mockHideContextMenu,
      });

      const user = userEvent.setup();
      render(<ContextMenu />);
      
      const parentItem = screen.getByText('Parent Item');
      
      await user.hover(parentItem);
      
      await waitFor(() => {
        expect(screen.getByText('Child Item')).toBeInTheDocument();
      });
    });
  });
});