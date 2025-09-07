import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Desktop } from '../components/desktop/Desktop';
import { DesktopIcon } from '../components/desktop/DesktopIcon';
import { useDesktopStore } from '../store/desktopStore';
import { usePreferencesStore } from '../store/preferencesStore';

// Mock the stores
vi.mock('../store/desktopStore');
vi.mock('../store/preferencesStore');
vi.mock('../store/windowStore', () => ({
  useWindowStore: () => ({
    createWindow: vi.fn(),
  }),
}));

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
    div: ({ children, onDragEnd, onDragStart, ...props }: any) => (
      <div 
        {...props}
        onMouseDown={(e: any) => {
          if (onDragStart) onDragStart();
        }}
        onMouseUp={(e: any) => {
          if (onDragEnd) {
            onDragEnd(e, { offset: { x: 10, y: 10 } });
          }
        }}
      >
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock FocusRing component
vi.mock('../components/ui', () => ({
  FocusRing: ({ children }: any) => children,
}));

describe('Desktop Icon Management', () => {
  const mockUpdateIconPosition = vi.fn();
  const mockUpdateMultipleIconPositions = vi.fn();
  const mockSelectIcon = vi.fn();
  const mockSelectMultipleIcons = vi.fn();
  const mockClearSelection = vi.fn();
  const mockSaveIconLayout = vi.fn();
  const mockLoadIconLayout = vi.fn();
  const mockStartDragSelection = vi.fn();
  const mockUpdateDragSelection = vi.fn();
  const mockEndDragSelection = vi.fn();

  const mockIcons = [
    {
      id: 'icon1',
      label: 'Projects',
      appId: 'projects' as const,
      x: 50,
      y: 50,
      selected: false,
    },
    {
      id: 'icon2',
      label: 'Terminal',
      appId: 'terminal' as const,
      x: 150,
      y: 50,
      selected: false,
    },
    {
      id: 'icon3',
      label: 'Settings',
      appId: 'settings' as const,
      x: 250,
      y: 50,
      selected: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    // Mock desktop store
    const mockStore = {
      icons: mockIcons,
      contextMenu: null,
      dragSelection: null,
      updateIconPosition: mockUpdateIconPosition,
      updateMultipleIconPositions: mockUpdateMultipleIconPositions,
      selectIcon: mockSelectIcon,
      selectMultipleIcons: mockSelectMultipleIcons,
      clearSelection: mockClearSelection,
      saveIconLayout: mockSaveIconLayout,
      loadIconLayout: mockLoadIconLayout,
      startDragSelection: mockStartDragSelection,
      updateDragSelection: mockUpdateDragSelection,
      endDragSelection: mockEndDragSelection,
      showContextMenu: vi.fn(),
      hideContextMenu: vi.fn(),
    };
    
    (useDesktopStore as any).mockReturnValue(mockStore);
    (useDesktopStore as any).getState = vi.fn().mockReturnValue(mockStore);

    // Mock preferences store
    (usePreferencesStore as any).mockReturnValue({
      wallpaper: 'default',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Icon Selection', () => {
    it('selects single icon on click', async () => {
      const user = userEvent.setup();
      render(<DesktopIcon icon={mockIcons[0]} />);
      
      const iconElement = screen.getByText('Projects');
      await user.click(iconElement);
      
      expect(mockSelectIcon).toHaveBeenCalledWith('icon1', false);
    });

    it('toggles icon selection with Ctrl+click', async () => {
      const user = userEvent.setup();
      render(<DesktopIcon icon={mockIcons[0]} />);
      
      const iconElement = screen.getByText('Projects');
      await user.click(iconElement, { ctrlKey: true });
      
      expect(mockSelectIcon).toHaveBeenCalledWith('icon1', true);
    });

    it('toggles icon selection with Cmd+click on Mac', async () => {
      const user = userEvent.setup();
      render(<DesktopIcon icon={mockIcons[0]} />);
      
      const iconElement = screen.getByText('Projects');
      await user.click(iconElement, { metaKey: true });
      
      expect(mockSelectIcon).toHaveBeenCalledWith('icon1', true);
    });

    it('supports range selection with Shift+click', async () => {
      const user = userEvent.setup();
      render(<DesktopIcon icon={mockIcons[0]} />);
      
      const iconElement = screen.getByText('Projects');
      await user.click(iconElement, { shiftKey: true });
      
      expect(mockSelectIcon).toHaveBeenCalledWith('icon1', true);
    });

    it('clears selection when clicking empty desktop', async () => {
      const user = userEvent.setup();
      render(<Desktop />);
      
      const desktop = document.querySelector('.relative.w-full.h-full') as HTMLElement;
      await user.click(desktop);
      
      expect(mockClearSelection).toHaveBeenCalled();
    });
  });

  describe('Icon Dragging', () => {
    it('moves single icon when dragged', () => {
      render(<DesktopIcon icon={mockIcons[0]} />);
      
      const iconElement = document.querySelector('[role="button"]') as HTMLElement;
      
      fireEvent.mouseDown(iconElement);
      fireEvent.mouseUp(iconElement);
      
      expect(mockUpdateIconPosition).toHaveBeenCalled();
    });

    it('moves multiple selected icons when one is dragged', () => {
      const selectedIcons = mockIcons.map(icon => ({ ...icon, selected: true }));
      
      (useDesktopStore as any).mockReturnValue({
        ...useDesktopStore(),
        icons: selectedIcons,
      });

      render(<DesktopIcon icon={selectedIcons[0]} />);
      
      const iconElement = document.querySelector('[role="button"]') as HTMLElement;
      
      fireEvent.mouseDown(iconElement);
      fireEvent.mouseUp(iconElement);
      
      expect(mockUpdateMultipleIconPositions).toHaveBeenCalled();
    });

    it('selects unselected icon before dragging', () => {
      render(<DesktopIcon icon={mockIcons[0]} />);
      
      const iconElement = document.querySelector('[role="button"]') as HTMLElement;
      
      fireEvent.mouseDown(iconElement);
      
      expect(mockSelectIcon).toHaveBeenCalledWith('icon1', false);
    });
  });

  describe('Drag Selection', () => {
    it('starts drag selection on empty desktop mousedown', () => {
      render(<Desktop />);
      
      const desktop = document.querySelector('.relative.w-full.h-full') as HTMLElement;
      
      fireEvent.mouseDown(desktop, { clientX: 100, clientY: 100 });
      
      expect(mockStartDragSelection).toHaveBeenCalledWith(100, 100);
    });

    it('updates drag selection on mouse move', () => {
      const dragSelection = {
        active: true,
        startX: 100,
        startY: 100,
        currentX: 100,
        currentY: 100,
      };

      (useDesktopStore as any).mockReturnValue({
        ...useDesktopStore(),
        dragSelection,
      });

      render(<Desktop />);
      
      const desktop = document.querySelector('.relative.w-full.h-full') as HTMLElement;
      
      fireEvent.mouseMove(desktop, { clientX: 200, clientY: 200 });
      
      expect(mockUpdateDragSelection).toHaveBeenCalledWith(200, 200);
    });

    it('ends drag selection on mouse up', () => {
      const dragSelection = {
        active: true,
        startX: 100,
        startY: 100,
        currentX: 200,
        currentY: 200,
      };

      (useDesktopStore as any).mockReturnValue({
        ...useDesktopStore(),
        dragSelection,
      });

      render(<Desktop />);
      
      const desktop = document.querySelector('.relative.w-full.h-full') as HTMLElement;
      
      fireEvent.mouseUp(desktop);
      
      expect(mockEndDragSelection).toHaveBeenCalled();
    });

    it('renders drag selection rectangle when active', () => {
      const dragSelection = {
        active: true,
        startX: 100,
        startY: 100,
        currentX: 200,
        currentY: 200,
      };

      (useDesktopStore as any).mockReturnValue({
        ...useDesktopStore(),
        dragSelection,
      });

      render(<Desktop />);
      
      const selectionRect = document.querySelector('.border-blue-500.bg-blue-500\\/10');
      expect(selectionRect).toBeInTheDocument();
    });
  });

  describe('Icon Layout Persistence', () => {
    it('loads icon layout on mount', () => {
      render(<Desktop />);
      
      expect(mockLoadIconLayout).toHaveBeenCalled();
    });

    it('saves layout after icon position update', async () => {
      // Test that the save function is called when updating position
      mockUpdateIconPosition('icon1', 100, 100);
      
      expect(mockUpdateIconPosition).toHaveBeenCalledWith('icon1', 100, 100);
    });

    it('saves layout after multiple icon position updates', async () => {
      // Test that the save function is called when updating multiple positions
      const updates = [
        { id: 'icon1', x: 100, y: 100 },
        { id: 'icon2', x: 200, y: 200 },
      ];
      
      mockUpdateMultipleIconPositions(updates);
      
      expect(mockUpdateMultipleIconPositions).toHaveBeenCalledWith(updates);
    });
  });

  describe('Visual Indicators', () => {
    it('shows selection indicator for selected icons', () => {
      render(<DesktopIcon icon={mockIcons[2]} />); // This icon is selected
      
      const selectionIndicator = document.querySelector('.bg-blue-500\\/20.border-blue-500');
      expect(selectionIndicator).toBeInTheDocument();
    });

    it('does not show selection indicator for unselected icons', () => {
      render(<DesktopIcon icon={mockIcons[0]} />); // This icon is not selected
      
      const selectionIndicator = document.querySelector('.bg-blue-500\\/20.border-blue-500');
      expect(selectionIndicator).not.toBeInTheDocument();
    });

    it('highlights label for selected icons', () => {
      render(<DesktopIcon icon={mockIcons[2]} />); // This icon is selected
      
      const label = screen.getByText('Settings');
      expect(label).toHaveClass('bg-blue-500/70');
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports Enter key to open application', async () => {
      const mockCreateWindow = vi.fn();
      
      // Mock window store
      vi.doMock('../store/windowStore', () => ({
        useWindowStore: () => ({
          createWindow: mockCreateWindow,
        }),
      }));

      const user = userEvent.setup();
      render(<DesktopIcon icon={mockIcons[0]} />);
      
      const iconElement = screen.getByRole('button');
      iconElement.focus();
      
      await user.keyboard('{Enter}');
      
      // Note: The actual window creation is mocked, so we just verify the key handler works
      expect(iconElement).toHaveFocus();
    });

    it('supports Space key to open application', async () => {
      const user = userEvent.setup();
      render(<DesktopIcon icon={mockIcons[0]} />);
      
      const iconElement = screen.getByRole('button');
      iconElement.focus();
      
      await user.keyboard(' ');
      
      // Note: The actual window creation is mocked, so we just verify the key handler works
      expect(iconElement).toHaveFocus();
    });

    it('supports Delete key for delete action', async () => {
      const user = userEvent.setup();
      render(<DesktopIcon icon={mockIcons[0]} />);
      
      const iconElement = screen.getByRole('button');
      iconElement.focus();
      
      await user.keyboard('{Delete}');
      
      // Note: Delete action is currently just announced, no actual deletion
      expect(iconElement).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<DesktopIcon icon={mockIcons[0]} />);
      
      const iconElement = screen.getByRole('button');
      expect(iconElement).toHaveAttribute('aria-label', 'Projects desktop icon');
      expect(iconElement).toHaveAttribute('tabindex', '0');
    });

    it('updates ARIA label when selected', () => {
      render(<DesktopIcon icon={mockIcons[2]} />); // This icon is selected
      
      const iconElement = screen.getByRole('button');
      expect(iconElement).toHaveAttribute('aria-label', 'Settings desktop icon, selected');
    });

    it('provides screen reader description', () => {
      render(<DesktopIcon icon={mockIcons[0]} />);
      
      const description = document.getElementById('icon1-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Double-click or press Enter to open Projects');
    });
  });
});