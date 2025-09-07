import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileExplorer } from '../useFileExplorer';

describe('useFileExplorer', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFileExplorer());

    expect(result.current.fileSystem.currentPath).toBe('/');
    expect(result.current.fileSystem.history).toEqual(['/']);
    expect(result.current.fileSystem.historyIndex).toBe(0);
    expect(result.current.fileSystem.selectedItems).toEqual([]);
    expect(result.current.fileSystem.viewMode).toBe('list');
    expect(result.current.fileSystem.sortBy).toBe('name');
    expect(result.current.previewFile).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should initialize with custom initial path', () => {
    const { result } = renderHook(() => useFileExplorer('/Desktop'));

    expect(result.current.fileSystem.currentPath).toBe('/Desktop');
    expect(result.current.fileSystem.history).toEqual(['/Desktop']);
  });

  describe('Navigation', () => {
    it('should navigate to valid paths', () => {
      const { result } = renderHook(() => useFileExplorer());

      act(() => {
        result.current.navigateToPath('/Desktop');
      });

      expect(result.current.fileSystem.currentPath).toBe('/Desktop');
      expect(result.current.fileSystem.history).toEqual(['/', '/Desktop']);
      expect(result.current.fileSystem.historyIndex).toBe(1);
      expect(result.current.error).toBeNull();
    });

    it('should handle invalid paths', () => {
      const { result } = renderHook(() => useFileExplorer());

      act(() => {
        result.current.navigateToPath('/NonExistent');
      });

      expect(result.current.fileSystem.currentPath).toBe('/');
      expect(result.current.error).toContain('Path not found');
    });

    it('should navigate back in history', () => {
      const { result } = renderHook(() => useFileExplorer());

      // Navigate to Desktop first
      act(() => {
        result.current.navigateToPath('/Desktop');
      });

      // Then navigate back
      act(() => {
        result.current.navigateBack();
      });

      expect(result.current.fileSystem.currentPath).toBe('/');
      expect(result.current.fileSystem.historyIndex).toBe(0);
    });

    it('should navigate forward in history', () => {
      const { result } = renderHook(() => useFileExplorer());

      // Navigate to Desktop and back
      act(() => {
        result.current.navigateToPath('/Desktop');
      });
      act(() => {
        result.current.navigateBack();
      });

      // Then navigate forward
      act(() => {
        result.current.navigateForward();
      });

      expect(result.current.fileSystem.currentPath).toBe('/Desktop');
      expect(result.current.fileSystem.historyIndex).toBe(1);
    });

    it('should navigate up to parent directory', () => {
      const { result } = renderHook(() => useFileExplorer('/Desktop'));

      act(() => {
        result.current.navigateUp();
      });

      expect(result.current.fileSystem.currentPath).toBe('/');
    });

    it('should not navigate up from root', () => {
      const { result } = renderHook(() => useFileExplorer('/'));

      act(() => {
        result.current.navigateUp();
      });

      expect(result.current.fileSystem.currentPath).toBe('/');
    });
  });

  describe('Navigation State', () => {
    it('should correctly report navigation capabilities', () => {
      const { result } = renderHook(() => useFileExplorer());

      // At root, can't go back, forward, or up
      expect(result.current.canNavigateBack).toBe(false);
      expect(result.current.canNavigateForward).toBe(false);
      expect(result.current.canNavigateUp).toBe(false);

      // Navigate to Desktop
      act(() => {
        result.current.navigateToPath('/Desktop');
      });

      expect(result.current.canNavigateBack).toBe(true);
      expect(result.current.canNavigateForward).toBe(false);
      expect(result.current.canNavigateUp).toBe(true);

      // Navigate back
      act(() => {
        result.current.navigateBack();
      });

      expect(result.current.canNavigateBack).toBe(false);
      expect(result.current.canNavigateForward).toBe(true);
      expect(result.current.canNavigateUp).toBe(false);
    });
  });

  describe('Content Management', () => {
    it('should get current directory contents', () => {
      const { result } = renderHook(() => useFileExplorer('/'));

      const contents = result.current.getCurrentContents();
      expect(contents.length).toBeGreaterThan(0);
      
      const folderNames = contents.map(item => item.name);
      expect(folderNames).toContain('Desktop');
      expect(folderNames).toContain('Documents');
    });

    it('should get breadcrumbs for current path', () => {
      const { result } = renderHook(() => useFileExplorer('/Documents/Notes'));

      const breadcrumbs = result.current.getBreadcrumbs();
      expect(breadcrumbs).toEqual([
        { name: 'Root', path: '/' },
        { name: 'Documents', path: '/Documents' },
        { name: 'Notes', path: '/Documents/Notes' }
      ]);
    });
  });

  describe('Selection Management', () => {
    it('should select and deselect items', () => {
      const { result } = renderHook(() => useFileExplorer('/Desktop'));

      // Select an item
      act(() => {
        result.current.selectItem('/Desktop/Projects.lnk');
      });

      expect(result.current.fileSystem.selectedItems).toContain('/Desktop/Projects.lnk');

      // Deselect the same item
      act(() => {
        result.current.selectItem('/Desktop/Projects.lnk');
      });

      expect(result.current.fileSystem.selectedItems).not.toContain('/Desktop/Projects.lnk');
    });

    it('should handle multi-select', () => {
      const { result } = renderHook(() => useFileExplorer('/Desktop'));

      // Select first item
      act(() => {
        result.current.selectItem('/Desktop/Projects.lnk', true);
      });

      // Select second item with multi-select
      act(() => {
        result.current.selectItem('/Desktop/About.lnk', true);
      });

      expect(result.current.fileSystem.selectedItems).toContain('/Desktop/Projects.lnk');
      expect(result.current.fileSystem.selectedItems).toContain('/Desktop/About.lnk');
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useFileExplorer('/Desktop'));

      // Select items first
      act(() => {
        result.current.selectItem('/Desktop/Projects.lnk', true);
        result.current.selectItem('/Desktop/About.lnk', true);
      });

      // Clear selection
      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.fileSystem.selectedItems).toEqual([]);
    });
  });

  describe('View Options', () => {
    it('should change view mode', () => {
      const { result } = renderHook(() => useFileExplorer());

      act(() => {
        result.current.setViewMode('grid');
      });

      expect(result.current.fileSystem.viewMode).toBe('grid');

      act(() => {
        result.current.setViewMode('list');
      });

      expect(result.current.fileSystem.viewMode).toBe('list');
    });

    it('should change sort order', () => {
      const { result } = renderHook(() => useFileExplorer());

      act(() => {
        result.current.setSortBy('type');
      });

      expect(result.current.fileSystem.sortBy).toBe('type');

      act(() => {
        result.current.setSortBy('modified');
      });

      expect(result.current.fileSystem.sortBy).toBe('modified');
    });
  });

  describe('Preview Management', () => {
    it('should set and clear preview file', () => {
      const { result } = renderHook(() => useFileExplorer());

      const mockFile = {
        name: 'test.txt',
        type: 'file' as const,
        path: '/test.txt',
        content: 'Test content'
      };

      act(() => {
        result.current.setPreviewFile(mockFile);
      });

      expect(result.current.previewFile).toEqual(mockFile);

      act(() => {
        result.current.setPreviewFile(null);
      });

      expect(result.current.previewFile).toBeNull();
    });
  });

  describe('Item Interactions', () => {
    it('should handle double-click on folder', () => {
      const { result } = renderHook(() => useFileExplorer('/'));

      const desktopFolder = {
        name: 'Desktop',
        type: 'folder' as const,
        path: '/Desktop'
      };

      act(() => {
        result.current.handleItemDoubleClick(desktopFolder);
      });

      expect(result.current.fileSystem.currentPath).toBe('/Desktop');
    });

    it('should handle double-click on file', () => {
      const { result } = renderHook(() => useFileExplorer('/Desktop'));

      const testFile = {
        name: 'test.txt',
        type: 'file' as const,
        path: '/Desktop/test.txt',
        content: 'Test content'
      };

      act(() => {
        result.current.handleItemDoubleClick(testFile);
      });

      expect(result.current.previewFile).toEqual(testFile);
    });
  });

  describe('Navigation Clearing Selection', () => {
    it('should clear selection when navigating', () => {
      const { result } = renderHook(() => useFileExplorer('/Desktop'));

      // Select an item
      act(() => {
        result.current.selectItem('/Desktop/Projects.lnk');
      });

      expect(result.current.fileSystem.selectedItems.length).toBe(1);

      // Navigate to another path
      act(() => {
        result.current.navigateToPath('/Documents');
      });

      expect(result.current.fileSystem.selectedItems).toEqual([]);
    });
  });
});