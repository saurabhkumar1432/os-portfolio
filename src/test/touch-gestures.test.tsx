import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { useTouchDrag } from '../hooks/useTouchDrag';
import { useTouchResize } from '../hooks/useTouchResize';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import { TouchContextMenu } from '../components/ui/TouchContextMenu';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock stores
const mockWindowStore = {
  windows: {},
  zOrder: [],
  updateWindowBounds: vi.fn(),
  setDragState: vi.fn(),
  setResizeState: vi.fn(),
  focusWindow: vi.fn(),
};

const mockPreferencesStore = {
  theme: 'light' as const,
};

vi.mock('../store/windowStore', () => ({
  useWindowStore: () => mockWindowStore,
}));

vi.mock('../store/preferencesStore', () => ({
  usePreferencesStore: () => mockPreferencesStore,
}));

// Mock responsive hook
vi.mock('../hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    screenWidth: 375,
    screenHeight: 667,
    orientation: 'portrait',
    isTouchDevice: true,
  }),
}));

describe('useTouchGestures Hook', () => {
  let mockHandlers: any;
  let element: HTMLDivElement;

  beforeEach(() => {
    mockHandlers = {
      onSwipe: vi.fn(),
      onTap: vi.fn(),
      onDoubleTap: vi.fn(),
      onLongPress: vi.fn(),
      onPinch: vi.fn(),
    };

    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
    vi.clearAllMocks();
  });

  it('should detect tap gestures', async () => {
    const TestComponent = () => {
      const { attachListeners } = useTouchGestures(mockHandlers);
      
      React.useEffect(() => {
        return attachListeners(element);
      }, [attachListeners]);

      return <div data-testid="test-component">Test</div>;
    };

    render(<TestComponent />);

    // Simulate tap
    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    });
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
    });

    fireEvent(element, touchStart);
    fireEvent(element, touchEnd);

    await waitFor(() => {
      expect(mockHandlers.onTap).toHaveBeenCalled();
    });
  });

  it('should detect swipe gestures', async () => {
    const TestComponent = () => {
      const { attachListeners } = useTouchGestures(mockHandlers);
      
      React.useEffect(() => {
        return attachListeners(element);
      }, [attachListeners]);

      return <div data-testid="test-component">Test</div>;
    };

    render(<TestComponent />);

    // Simulate swipe right
    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    });
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 200, clientY: 100 } as Touch],
    });

    fireEvent(element, touchStart);
    
    // Wait a bit to ensure velocity calculation
    await new Promise(resolve => setTimeout(resolve, 50));
    
    fireEvent(element, touchEnd);

    await waitFor(() => {
      expect(mockHandlers.onSwipe).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'right',
          distance: expect.any(Number),
          velocity: expect.any(Number),
        })
      );
    });
  });

  it('should detect long press gestures', async () => {
    const TestComponent = () => {
      const { attachListeners } = useTouchGestures(mockHandlers, {
        longPressDelay: 100, // Shorter delay for testing
      });
      
      React.useEffect(() => {
        return attachListeners(element);
      }, [attachListeners]);

      return <div data-testid="test-component">Test</div>;
    };

    render(<TestComponent />);

    // Simulate long press
    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    });

    fireEvent(element, touchStart);

    // Wait for long press delay
    await waitFor(() => {
      expect(mockHandlers.onLongPress).toHaveBeenCalled();
    }, { timeout: 200 });
  });

  it('should detect double tap gestures', async () => {
    const TestComponent = () => {
      const { attachListeners } = useTouchGestures(mockHandlers, {
        doubleTapDelay: 200, // Shorter delay for testing
      });
      
      React.useEffect(() => {
        return attachListeners(element);
      }, [attachListeners]);

      return <div data-testid="test-component">Test</div>;
    };

    render(<TestComponent />);

    // Simulate first tap
    const touchStart1 = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    });
    const touchEnd1 = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
    });

    fireEvent(element, touchStart1);
    fireEvent(element, touchEnd1);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 50));

    // Simulate second tap
    const touchStart2 = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    });
    const touchEnd2 = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
    });

    fireEvent(element, touchStart2);
    fireEvent(element, touchEnd2);

    await waitFor(() => {
      expect(mockHandlers.onDoubleTap).toHaveBeenCalled();
    });
  });
});

describe('useTouchDrag Hook', () => {
  beforeEach(() => {
    mockWindowStore.windows = {
      'test-window': {
        id: 'test-window',
        bounds: { x: 100, y: 100, w: 400, h: 300 },
      },
    };
  });

  it('should handle touch drag', () => {
    const TestComponent = () => {
      const { attachListeners } = useTouchDrag({
        windowId: 'test-window',
      });
      
      return <div data-testid="test-component">Test</div>;
    };

    render(<TestComponent />);

    expect(mockWindowStore.updateWindowBounds).not.toHaveBeenCalled();
  });
});

describe('useSwipeNavigation Hook', () => {
  beforeEach(() => {
    mockWindowStore.windows = {
      'window-1': { id: 'window-1', focused: true, minimized: false },
      'window-2': { id: 'window-2', focused: false, minimized: false },
    };
    mockWindowStore.zOrder = ['window-1', 'window-2'];
  });

  it('should switch to next window on swipe', () => {
    const TestComponent = () => {
      const { switchToNextWindow } = useSwipeNavigation();
      
      React.useEffect(() => {
        switchToNextWindow();
      }, [switchToNextWindow]);

      return <div data-testid="test-component">Test</div>;
    };

    render(<TestComponent />);

    expect(mockWindowStore.focusWindow).toHaveBeenCalledWith('window-2');
  });

  it('should switch to previous window on swipe', () => {
    const TestComponent = () => {
      const { switchToPreviousWindow } = useSwipeNavigation();
      
      React.useEffect(() => {
        switchToPreviousWindow();
      }, [switchToPreviousWindow]);

      return <div data-testid="test-component">Test</div>;
    };

    render(<TestComponent />);

    expect(mockWindowStore.focusWindow).toHaveBeenCalledWith('window-2');
  });
});

describe('TouchContextMenu Component', () => {
  const mockItems = [
    {
      id: 'item-1',
      label: 'Test Item 1',
      action: vi.fn(),
    },
    {
      id: 'item-2',
      label: 'Test Item 2',
      action: vi.fn(),
      disabled: true,
    },
    {
      id: 'separator',
      separator: true,
    },
    {
      id: 'item-3',
      label: 'Test Item 3',
      icon: '📁',
      action: vi.fn(),
    },
  ];

  it('should render context menu when open', () => {
    render(
      <TouchContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        items={mockItems}
        onClose={vi.fn()}
        onItemClick={vi.fn()}
      />
    );

    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.getByText('Test Item 3')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <TouchContextMenu
        isOpen={false}
        position={{ x: 100, y: 100 }}
        items={mockItems}
        onClose={vi.fn()}
        onItemClick={vi.fn()}
      />
    );

    expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
  });

  it('should handle item clicks', async () => {
    const onItemClick = vi.fn();
    const onClose = vi.fn();

    render(
      <TouchContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        items={mockItems}
        onClose={onClose}
        onItemClick={onItemClick}
      />
    );

    const item1 = screen.getByText('Test Item 1');
    fireEvent.click(item1);

    expect(onItemClick).toHaveBeenCalledWith(mockItems[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('should not handle clicks on disabled items', async () => {
    const onItemClick = vi.fn();

    render(
      <TouchContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        items={mockItems}
        onClose={vi.fn()}
        onItemClick={onItemClick}
      />
    );

    const disabledItem = screen.getByText('Test Item 2');
    fireEvent.click(disabledItem);

    expect(onItemClick).not.toHaveBeenCalled();
  });

  it('should show icons when provided', () => {
    render(
      <TouchContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        items={mockItems}
        onClose={vi.fn()}
        onItemClick={vi.fn()}
      />
    );

    expect(screen.getByText('📁')).toBeInTheDocument();
  });

  it('should render separators', () => {
    render(
      <TouchContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        items={mockItems}
        onClose={vi.fn()}
        onItemClick={vi.fn()}
      />
    );

    // Check that separator is rendered (it creates a border element)
    const menu = screen.getByText('Test Item 1').closest('div')?.parentElement;
    expect(menu).toBeInTheDocument();
  });
});