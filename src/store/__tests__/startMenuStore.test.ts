import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStartMenuStore } from '../startMenuStore';
import { act, renderHook } from '@testing-library/react';

// Mock the search service
vi.mock('../../services/searchService', () => ({
  searchService: {
    search: vi.fn((query: string) => {
      if (query === 'test') {
        return [
          {
            id: 'test-result',
            title: 'Test Result',
            description: 'Test description',
            category: 'app',
            keywords: [],
            action: vi.fn()
          }
        ];
      }
      return [];
    })
  }
}));

describe('StartMenuStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useStartMenuStore());
    act(() => {
      result.current.setIsOpen(false);
      result.current.clearSearch();
      result.current.clearRecent();
    });
  });

  describe('menu visibility', () => {
    it('should start with menu closed', () => {
      const { result } = renderHook(() => useStartMenuStore());
      expect(result.current.isOpen).toBe(false);
    });

    it('should open menu when setIsOpen(true) is called', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.setIsOpen(true);
      });
      
      expect(result.current.isOpen).toBe(true);
    });

    it('should close menu when setIsOpen(false) is called', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.setIsOpen(true);
      });
      
      act(() => {
        result.current.setIsOpen(false);
      });
      
      expect(result.current.isOpen).toBe(false);
    });

    it('should toggle menu state', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.toggleStartMenu();
      });
      
      expect(result.current.isOpen).toBe(true);
      
      act(() => {
        result.current.toggleStartMenu();
      });
      
      expect(result.current.isOpen).toBe(false);
    });

    it('should clear search when closing menu', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.setSearchQuery('test');
        result.current.setIsOpen(true);
      });
      
      expect(result.current.searchQuery).toBe('test');
      
      act(() => {
        result.current.setIsOpen(false);
      });
      
      expect(result.current.searchQuery).toBe('');
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.selectedIndex).toBe(-1);
    });
  });

  describe('search functionality', () => {
    it('should update search query', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.setSearchQuery('test query');
      });
      
      expect(result.current.searchQuery).toBe('test query');
    });

    it('should perform search when query is set', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.setSearchQuery('test');
      });
      
      expect(result.current.searchResults.length).toBeGreaterThan(0);
      expect(result.current.selectedIndex).toBe(0);
    });

    it('should clear results for empty query', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.setSearchQuery('test');
      });
      
      expect(result.current.searchResults.length).toBeGreaterThan(0);
      
      act(() => {
        result.current.setSearchQuery('');
      });
      
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.selectedIndex).toBe(-1);
    });

    it('should clear search manually', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.setSearchQuery('test');
      });
      
      act(() => {
        result.current.clearSearch();
      });
      
      expect(result.current.searchQuery).toBe('');
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.selectedIndex).toBe(-1);
    });
  });

  describe('search navigation', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useStartMenuStore());
      act(() => {
        result.current.setSearchQuery('test'); // This should populate results
      });
    });

    it('should navigate to next item', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.setSearchQuery('test');
      });
      
      const initialIndex = result.current.selectedIndex;
      
      act(() => {
        result.current.selectNext();
      });
      
      // Should wrap to 0 if at end, or increment
      expect(result.current.selectedIndex).toBe(
        initialIndex < result.current.searchResults.length - 1 ? initialIndex + 1 : 0
      );
    });

    it('should navigate to previous item', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.setSearchQuery('test');
      });
      
      act(() => {
        result.current.selectPrevious();
      });
      
      // Should wrap to last item when going back from first
      expect(result.current.selectedIndex).toBe(result.current.searchResults.length - 1);
    });

    it('should set selected index directly', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.setSearchQuery('test');
      });
      
      act(() => {
        result.current.setSelectedIndex(0);
      });
      
      expect(result.current.selectedIndex).toBe(0);
    });

    it('should not set invalid selected index', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.setSearchQuery('test');
      });
      
      const initialIndex = result.current.selectedIndex;
      
      act(() => {
        result.current.setSelectedIndex(999); // Invalid index
      });
      
      expect(result.current.selectedIndex).toBe(initialIndex);
    });
  });

  describe('pinned apps management', () => {
    it('should start with default pinned apps', () => {
      const { result } = renderHook(() => useStartMenuStore());
      expect(result.current.pinnedApps).toEqual(['projects', 'file-explorer', 'terminal', 'about']);
    });

    it('should add app to pinned', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.addToPinned('notepad');
      });
      
      expect(result.current.pinnedApps).toContain('notepad');
    });

    it('should not add duplicate pinned app', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      const initialLength = result.current.pinnedApps.length;
      
      act(() => {
        result.current.addToPinned('projects'); // Already pinned
      });
      
      expect(result.current.pinnedApps.length).toBe(initialLength);
    });

    it('should remove app from pinned', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.removeFromPinned('projects');
      });
      
      expect(result.current.pinnedApps).not.toContain('projects');
    });
  });

  describe('recent apps management', () => {
    it('should start with empty recent apps', () => {
      const { result } = renderHook(() => useStartMenuStore());
      expect(result.current.recentApps).toEqual([]);
    });

    it('should add app to recent', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.addToRecent('projects');
      });
      
      expect(result.current.recentApps).toContain('projects');
    });

    it('should move existing app to front of recent list', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.addToRecent('projects');
        result.current.addToRecent('terminal');
        result.current.addToRecent('projects'); // Move to front
      });
      
      expect(result.current.recentApps[0]).toBe('projects');
    });

    it('should limit recent apps to 6 items', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        // Add 7 apps
        result.current.addToRecent('app1');
        result.current.addToRecent('app2');
        result.current.addToRecent('app3');
        result.current.addToRecent('app4');
        result.current.addToRecent('app5');
        result.current.addToRecent('app6');
        result.current.addToRecent('app7');
      });
      
      expect(result.current.recentApps.length).toBe(6);
      expect(result.current.recentApps[0]).toBe('app7'); // Most recent first
    });

    it('should clear recent apps', () => {
      const { result } = renderHook(() => useStartMenuStore());
      
      act(() => {
        result.current.addToRecent('projects');
        result.current.clearRecent();
      });
      
      expect(result.current.recentApps).toEqual([]);
    });
  });
});