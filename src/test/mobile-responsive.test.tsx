import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useResponsive } from '../hooks/useResponsive';
import { MobileWindowManager } from '../components/window/MobileWindowManager';
import { MobileStartMenu } from '../components/desktop/MobileStartMenu';
import { ResponsiveWindow } from '../components/window/ResponsiveWindow';
import { useWindowStore } from '../store/windowStore';
import { useStartMenuStore } from '../store/startMenuStore';
import { usePreferencesStore } from '../store/preferencesStore';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, layout, drag, dragConstraints, dragElastic, onDragEnd, ...props }: any) => 
      <div {...props}>{children}</div>,
    button: ({ children, layout, whileHover, whileTap, ...props }: any) => 
      <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
  Grid3X3: () => <span data-testid="grid-icon">Grid</span>,
  Search: () => <span data-testid="search-icon">Search</span>,
  ChevronLeft: () => <span data-testid="chevron-left">Left</span>,
  ChevronRight: () => <span data-testid="chevron-right">Right</span>,
  MoreHorizontal: () => <span data-testid="more-icon">More</span>,
  Clock: () => <span data-testid="clock-icon">Clock</span>,
  List: () => <span data-testid="list-icon">List</span>,
}));

// Mock stores
const mockWindowStore = {
  windows: {},
  zOrder: [],
  focusWindow: vi.fn(),
  closeWindow: vi.fn(),
};

const mockStartMenuStore = {
  isOpen: false,
  searchQuery: '',
  searchResults: [],
  setIsOpen: vi.fn(),
  setSearchQuery: vi.fn(),
  toggleStartMenu: vi.fn(),
};

const mockPreferencesStore = {
  theme: 'light' as const,
};

vi.mock('../store/windowStore', () => ({
  useWindowStore: () => mockWindowStore,
}));

vi.mock('../store/startMenuStore', () => ({
  useStartMenuStore: () => mockStartMenuStore,
}));

vi.mock('../store/preferencesStore', () => ({
  usePreferencesStore: () => mockPreferencesStore,
}));

// Mock AppGrid component
vi.mock('../components/desktop/AppGrid', () => ({
  AppGrid: ({ mobile }: { mobile?: boolean }) => (
    <div data-testid="app-grid" data-mobile={mobile}>
      Mocked AppGrid
    </div>
  ),
}));

// Mock QuickActions component
vi.mock('../components/desktop/QuickActions', () => ({
  QuickActions: () => <div data-testid="quick-actions">Mocked QuickActions</div>,
}));

describe('useResponsive Hook', () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;
  let originalMatchMedia: any;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    originalMatchMedia = window.matchMedia;

    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
    window.matchMedia = originalMatchMedia;
  });

  it('should detect mobile screen size', () => {
    // Set mobile screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });

    const TestComponent = () => {
      const responsive = useResponsive();
      return (
        <div>
          <span data-testid="is-mobile">{responsive.isMobile.toString()}</span>
          <span data-testid="is-tablet">{responsive.isTablet.toString()}</span>
          <span data-testid="is-desktop">{responsive.isDesktop.toString()}</span>
          <span data-testid="orientation">{responsive.orientation}</span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('is-mobile')).toHaveTextContent('true');
    expect(screen.getByTestId('is-tablet')).toHaveTextContent('false');
    expect(screen.getByTestId('is-desktop')).toHaveTextContent('false');
    expect(screen.getByTestId('orientation')).toHaveTextContent('portrait');
  });

  it('should detect tablet screen size', () => {
    // Set tablet screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const TestComponent = () => {
      const responsive = useResponsive();
      return (
        <div>
          <span data-testid="is-mobile">{responsive.isMobile.toString()}</span>
          <span data-testid="is-tablet">{responsive.isTablet.toString()}</span>
          <span data-testid="is-desktop">{responsive.isDesktop.toString()}</span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');
    expect(screen.getByTestId('is-tablet')).toHaveTextContent('true');
    expect(screen.getByTestId('is-desktop')).toHaveTextContent('false');
  });

  it('should detect desktop screen size', () => {
    // Set desktop screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });

    const TestComponent = () => {
      const responsive = useResponsive();
      return (
        <div>
          <span data-testid="is-mobile">{responsive.isMobile.toString()}</span>
          <span data-testid="is-tablet">{responsive.isTablet.toString()}</span>
          <span data-testid="is-desktop">{responsive.isDesktop.toString()}</span>
          <span data-testid="orientation">{responsive.orientation}</span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');
    expect(screen.getByTestId('is-tablet')).toHaveTextContent('false');
    expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');
    expect(screen.getByTestId('orientation')).toHaveTextContent('landscape');
  });

  it('should respond to window resize events', async () => {
    const TestComponent = () => {
      const responsive = useResponsive();
      return <span data-testid="is-mobile">{responsive.isMobile.toString()}</span>;
    };

    render(<TestComponent />);

    // Initially desktop
    expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');

    // Resize to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(screen.getByTestId('is-mobile')).toHaveTextContent('true');
    });
  });
});

describe('MobileWindowManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock mobile environment
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
  });

  it('should render mobile tab interface when windows are open', () => {
    const mockWindows = {
      'window-1': {
        id: 'window-1',
        appId: 'projects' as const,
        title: 'Projects',
        focused: true,
        minimized: false,
        hasUnsavedState: false,
      },
      'window-2': {
        id: 'window-2',
        appId: 'terminal' as const,
        title: 'Terminal',
        focused: false,
        minimized: false,
        hasUnsavedState: true,
      },
    };

    mockWindowStore.windows = mockWindows;
    mockWindowStore.zOrder = ['window-1', 'window-2'];

    render(
      <MobileWindowManager>
        <div data-testid="window-content">Window Content</div>
      </MobileWindowManager>
    );

    // Should show tab bar
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    
    // Should show window content
    expect(screen.getByTestId('window-content')).toBeInTheDocument();
  });

  it('should handle tab switching', async () => {
    const user = userEvent.setup();
    
    const mockWindows = {
      'window-1': {
        id: 'window-1',
        appId: 'projects' as const,
        title: 'Projects',
        focused: true,
        minimized: false,
        hasUnsavedState: false,
      },
      'window-2': {
        id: 'window-2',
        appId: 'terminal' as const,
        title: 'Terminal',
        focused: false,
        minimized: false,
        hasUnsavedState: false,
      },
    };

    mockWindowStore.windows = mockWindows;
    mockWindowStore.zOrder = ['window-1', 'window-2'];

    render(
      <MobileWindowManager>
        <div>Window Content</div>
      </MobileWindowManager>
    );

    const terminalTab = screen.getByText('Terminal');
    await user.click(terminalTab);

    expect(mockWindowStore.focusWindow).toHaveBeenCalledWith('window-2');
  });

  it('should handle tab closing', async () => {
    const user = userEvent.setup();
    
    const mockWindows = {
      'window-1': {
        id: 'window-1',
        appId: 'projects' as const,
        title: 'Projects',
        focused: true,
        minimized: false,
        hasUnsavedState: false,
      },
    };

    mockWindowStore.windows = mockWindows;
    mockWindowStore.zOrder = ['window-1'];

    render(
      <MobileWindowManager>
        <div>Window Content</div>
      </MobileWindowManager>
    );

    const closeButton = screen.getAllByTestId('x-icon')[0];
    await user.click(closeButton);

    expect(mockWindowStore.closeWindow).toHaveBeenCalledWith('window-1');
  });

  it('should show overflow menu when there are too many tabs', () => {
    const mockWindows = {
      'window-1': { id: 'window-1', title: 'Window 1', focused: true, minimized: false },
      'window-2': { id: 'window-2', title: 'Window 2', focused: false, minimized: false },
      'window-3': { id: 'window-3', title: 'Window 3', focused: false, minimized: false },
      'window-4': { id: 'window-4', title: 'Window 4', focused: false, minimized: false },
    };

    mockWindowStore.windows = mockWindows;
    mockWindowStore.zOrder = ['window-1', 'window-2', 'window-3', 'window-4'];

    render(
      <MobileWindowManager>
        <div>Window Content</div>
      </MobileWindowManager>
    );

    // Should show overflow button
    expect(screen.getByTestId('more-icon')).toBeInTheDocument();
  });
});

describe('MobileStartMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock mobile environment
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });
  });

  it('should render when open on mobile', () => {
    mockStartMenuStore.isOpen = true;

    render(<MobileStartMenu />);

    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search apps, projects, files...')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    mockStartMenuStore.isOpen = false;

    render(<MobileStartMenu />);

    expect(screen.queryByText('Start')).not.toBeInTheDocument();
  });

  it('should handle search input', async () => {
    const user = userEvent.setup();
    mockStartMenuStore.isOpen = true;

    render(<MobileStartMenu />);

    const searchInput = screen.getByPlaceholderText('Search apps, projects, files...');
    await user.type(searchInput, 'test query');

    // Check that setSearchQuery was called with the final character
    expect(mockStartMenuStore.setSearchQuery).toHaveBeenLastCalledWith('y');
    // Check that it was called 10 times (once for each character)
    expect(mockStartMenuStore.setSearchQuery).toHaveBeenCalledTimes(10);
  });

  it('should handle close button', async () => {
    const user = userEvent.setup();
    mockStartMenuStore.isOpen = true;

    render(<MobileStartMenu />);

    const closeButton = screen.getByTestId('x-icon');
    await user.click(closeButton);

    expect(mockStartMenuStore.setIsOpen).toHaveBeenCalledWith(false);
  });

  it('should show search results when query exists', () => {
    mockStartMenuStore.isOpen = true;
    mockStartMenuStore.searchQuery = 'test';
    mockStartMenuStore.searchResults = [
      {
        id: 'result-1',
        title: 'Test Result',
        description: 'Test Description',
        category: 'app',
        action: vi.fn(),
      },
    ];

    render(<MobileStartMenu />);

    expect(screen.getByText('Test Result')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should show no results message when search returns empty', () => {
    mockStartMenuStore.isOpen = true;
    mockStartMenuStore.searchQuery = 'nonexistent';
    mockStartMenuStore.searchResults = [];

    render(<MobileStartMenu />);

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});

describe('ResponsiveWindow', () => {
  const mockWindow = {
    id: 'test-window',
    appId: 'projects' as const,
    title: 'Test Window',
    bounds: { x: 100, y: 100, w: 800, h: 600 },
    zIndex: 1,
    minimized: false,
    maximized: false,
    focused: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render mobile window on mobile devices', () => {
    // Mock mobile environment
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(
      <ResponsiveWindow window={mockWindow}>
        <div data-testid="window-content">Test Content</div>
      </ResponsiveWindow>
    );

    expect(screen.getByTestId('window-content')).toBeInTheDocument();
  });

  it('should render desktop window on desktop devices', () => {
    // Mock desktop environment
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });

    render(
      <ResponsiveWindow window={mockWindow}>
        <div data-testid="window-content">Test Content</div>
      </ResponsiveWindow>
    );

    expect(screen.getByTestId('window-content')).toBeInTheDocument();
  });

  it('should not render mobile window when minimized', () => {
    // Mock mobile environment
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const minimizedWindow = { ...mockWindow, minimized: true };

    render(
      <ResponsiveWindow window={minimizedWindow}>
        <div data-testid="window-content">Test Content</div>
      </ResponsiveWindow>
    );

    expect(screen.queryByTestId('window-content')).not.toBeInTheDocument();
  });

  it('should not render mobile window when not focused', () => {
    // Mock mobile environment
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const unfocusedWindow = { ...mockWindow, focused: false };

    render(
      <ResponsiveWindow window={unfocusedWindow}>
        <div data-testid="window-content">Test Content</div>
      </ResponsiveWindow>
    );

    expect(screen.queryByTestId('window-content')).not.toBeInTheDocument();
  });
});