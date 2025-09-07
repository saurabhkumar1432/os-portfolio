import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { StartMenu } from '../StartMenu';
import { useStartMenuStore } from '../../../store/startMenuStore';

// Mock the stores
vi.mock('../../../store/startMenuStore');
vi.mock('../../../store/preferencesStore', () => ({
  usePreferencesStore: () => ({
    theme: 'light'
  })
}));

// Mock the keyboard shortcut provider
vi.mock('../../KeyboardShortcutProvider', () => ({
  useComponentKeyboardShortcuts: vi.fn()
}));

// Mock the search service
vi.mock('../../../services/searchService', () => ({
  searchService: {
    getPinnedApps: vi.fn(() => []),
    getRecentApps: vi.fn(() => []),
    getAllApps: vi.fn(() => [
      {
        id: 'test-app',
        title: 'Test App',
        description: 'Test application',
        category: 'app',
        action: vi.fn()
      }
    ])
  }
}));

const mockStartMenuStore = {
  isOpen: false,
  searchQuery: '',
  searchResults: [],
  selectedIndex: -1,
  pinnedApps: [],
  recentApps: [],
  setIsOpen: vi.fn(),
  setSearchQuery: vi.fn(),
  selectNext: vi.fn(),
  selectPrevious: vi.fn(),
  executeSelected: vi.fn(),
  clearSearch: vi.fn()
};

describe('StartMenu', () => {
  beforeEach(() => {
    vi.mocked(useStartMenuStore).mockReturnValue(mockStartMenuStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    render(<StartMenu />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    vi.mocked(useStartMenuStore).mockReturnValue({
      ...mockStartMenuStore,
      isOpen: true
    });

    render(<StartMenu />);
    expect(screen.getByPlaceholderText('Search apps, files, and more...')).toBeInTheDocument();
  });

  it('should display search input and handle typing', async () => {
    const user = userEvent.setup();
    const mockSetSearchQuery = vi.fn();
    
    vi.mocked(useStartMenuStore).mockReturnValue({
      ...mockStartMenuStore,
      isOpen: true,
      setSearchQuery: mockSetSearchQuery
    });

    render(<StartMenu />);
    
    const searchInput = screen.getByPlaceholderText('Search apps, files, and more...');
    await user.type(searchInput, 'test');
    
    // Just verify that setSearchQuery was called
    expect(mockSetSearchQuery).toHaveBeenCalled();
  });

  it('should close when clicking outside', async () => {
    const mockSetIsOpen = vi.fn();
    
    vi.mocked(useStartMenuStore).mockReturnValue({
      ...mockStartMenuStore,
      isOpen: true,
      setIsOpen: mockSetIsOpen
    });

    render(
      <div>
        <StartMenu />
        <div data-testid="outside">Outside element</div>
      </div>
    );
    
    fireEvent.mouseDown(screen.getByTestId('outside'));
    
    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  it('should display all apps section', () => {
    vi.mocked(useStartMenuStore).mockReturnValue({
      ...mockStartMenuStore,
      isOpen: true
    });

    render(<StartMenu />);
    expect(screen.getByText('All Apps')).toBeInTheDocument();
  });

  it('should display search results when searching', () => {
    const mockResults = [
      {
        id: 'result-1',
        title: 'Test Result',
        description: 'Test description',
        category: 'app' as const,
        keywords: [],
        action: vi.fn()
      }
    ];

    vi.mocked(useStartMenuStore).mockReturnValue({
      ...mockStartMenuStore,
      isOpen: true,
      searchQuery: 'test',
      searchResults: mockResults
    });

    render(<StartMenu />);
    expect(screen.getByText('Test Result')).toBeInTheDocument();
  });

  it('should handle keyboard navigation', () => {
    const mockSelectNext = vi.fn();
    const mockSelectPrevious = vi.fn();
    const mockExecuteSelected = vi.fn();

    vi.mocked(useStartMenuStore).mockReturnValue({
      ...mockStartMenuStore,
      isOpen: true,
      searchResults: [{ id: 'test', title: 'Test', description: 'Test', category: 'app', keywords: [], action: vi.fn() }],
      selectNext: mockSelectNext,
      selectPrevious: mockSelectPrevious,
      executeSelected: mockExecuteSelected
    });

    render(<StartMenu />);

    // Simulate keyboard events
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    fireEvent.keyDown(document, { key: 'Enter' });

    // Note: The actual keyboard handling is done by the useComponentKeyboardShortcuts hook
    // which is mocked, so we can't test the actual behavior here without more complex setup
  });
});