import { useState, useCallback } from 'react';
import type { VNode, FileExplorerState } from '../types';
import { virtualFileSystem } from '../services/virtualFileSystem';

/**
 * Hook for managing File Explorer state and navigation
 */
export const useFileExplorer = (initialPath: string = '/') => {
  const [state, setState] = useState<FileExplorerState>(() => ({
    fileSystem: {
      root: virtualFileSystem.getFileSystem(),
      currentPath: initialPath,
      history: [initialPath],
      historyIndex: 0,
      selectedItems: [],
      viewMode: 'list',
      sortBy: 'name'
    },
    previewFile: null,
    contextMenu: null,
    loading: false,
    error: null
  }));

  /**
   * Navigate to a specific path
   */
  const navigateToPath = useCallback((path: string) => {
    setState(prev => {
      const node = virtualFileSystem.navigateToPath(path);
      if (!node) {
        return {
          ...prev,
          error: `Path not found: ${path}`
        };
      }

      // Add to history if it's a new navigation (not back/forward)
      const newHistory = prev.fileSystem.history.slice(0, prev.fileSystem.historyIndex + 1);
      newHistory.push(path);

      return {
        ...prev,
        fileSystem: {
          ...prev.fileSystem,
          currentPath: path,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          selectedItems: []
        },
        previewFile: null,
        error: null
      };
    });
  }, []);

  /**
   * Navigate back in history
   */
  const navigateBack = useCallback(() => {
    setState(prev => {
      if (prev.fileSystem.historyIndex <= 0) {
        return prev;
      }

      const newIndex = prev.fileSystem.historyIndex - 1;
      const path = prev.fileSystem.history[newIndex];

      return {
        ...prev,
        fileSystem: {
          ...prev.fileSystem,
          currentPath: path,
          historyIndex: newIndex,
          selectedItems: []
        },
        previewFile: null
      };
    });
  }, []);

  /**
   * Navigate forward in history
   */
  const navigateForward = useCallback(() => {
    setState(prev => {
      if (prev.fileSystem.historyIndex >= prev.fileSystem.history.length - 1) {
        return prev;
      }

      const newIndex = prev.fileSystem.historyIndex + 1;
      const path = prev.fileSystem.history[newIndex];

      return {
        ...prev,
        fileSystem: {
          ...prev.fileSystem,
          currentPath: path,
          historyIndex: newIndex,
          selectedItems: []
        },
        previewFile: null
      };
    });
  }, []);

  /**
   * Navigate to parent directory
   */
  const navigateUp = useCallback(() => {
    const parentPath = virtualFileSystem.getParentPath(state.fileSystem.currentPath);
    if (parentPath !== state.fileSystem.currentPath) {
      navigateToPath(parentPath);
    }
  }, [state.fileSystem.currentPath, navigateToPath]);

  /**
   * Get current directory contents
   */
  const getCurrentContents = useCallback((): VNode[] => {
    const currentNode = virtualFileSystem.navigateToPath(state.fileSystem.currentPath);
    if (!currentNode || !currentNode.children) {
      return [];
    }

    return virtualFileSystem.sortNodes(currentNode.children, state.fileSystem.sortBy);
  }, [state.fileSystem.currentPath, state.fileSystem.sortBy]);

  /**
   * Get breadcrumb navigation
   */
  const getBreadcrumbs = useCallback(() => {
    return virtualFileSystem.getBreadcrumbs(state.fileSystem.currentPath);
  }, [state.fileSystem.currentPath]);

  /**
   * Select/deselect items
   */
  const selectItem = useCallback((path: string, multiSelect: boolean = false) => {
    setState(prev => {
      let newSelectedItems: string[];

      if (multiSelect) {
        if (prev.fileSystem.selectedItems.includes(path)) {
          newSelectedItems = prev.fileSystem.selectedItems.filter(item => item !== path);
        } else {
          newSelectedItems = [...prev.fileSystem.selectedItems, path];
        }
      } else {
        newSelectedItems = prev.fileSystem.selectedItems.includes(path) ? [] : [path];
      }

      return {
        ...prev,
        fileSystem: {
          ...prev.fileSystem,
          selectedItems: newSelectedItems
        }
      };
    });
  }, []);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      fileSystem: {
        ...prev.fileSystem,
        selectedItems: []
      }
    }));
  }, []);

  /**
   * Set preview file
   */
  const setPreviewFile = useCallback((file: VNode | null) => {
    setState(prev => ({
      ...prev,
      previewFile: file
    }));
  }, []);

  /**
   * Change view mode
   */
  const setViewMode = useCallback((viewMode: 'list' | 'grid') => {
    setState(prev => ({
      ...prev,
      fileSystem: {
        ...prev.fileSystem,
        viewMode
      }
    }));
  }, []);

  /**
   * Change sort order
   */
  const setSortBy = useCallback((sortBy: 'name' | 'type' | 'modified') => {
    setState(prev => ({
      ...prev,
      fileSystem: {
        ...prev.fileSystem,
        sortBy
      }
    }));
  }, []);

  /**
   * Handle double-click on item
   */
  const handleItemDoubleClick = useCallback((node: VNode) => {
    if (node.type === 'folder') {
      navigateToPath(node.path);
    } else {
      // For files, set as preview or trigger action based on type
      setPreviewFile(node);
      
      // Handle special file types
      if (node.ext === 'lnk') {
        // Handle shortcuts - could open corresponding app
        const appName = node.name.replace('.lnk', '').toLowerCase();
        console.log(`Opening shortcut: ${appName}`);
      }
    }
  }, [navigateToPath, setPreviewFile]);

  /**
   * Check if can navigate back
   */
  const canNavigateBack = state.fileSystem.historyIndex > 0;

  /**
   * Check if can navigate forward
   */
  const canNavigateForward = state.fileSystem.historyIndex < state.fileSystem.history.length - 1;

  /**
   * Check if can navigate up
   */
  const canNavigateUp = state.fileSystem.currentPath !== '/';

  return {
    // State
    fileSystem: state.fileSystem,
    previewFile: state.previewFile,
    contextMenu: state.contextMenu,
    loading: state.loading,
    error: state.error,

    // Navigation
    navigateToPath,
    navigateBack,
    navigateForward,
    navigateUp,
    canNavigateBack,
    canNavigateForward,
    canNavigateUp,

    // Content
    getCurrentContents,
    getBreadcrumbs,

    // Selection
    selectItem,
    clearSelection,

    // Preview
    setPreviewFile,

    // View options
    setViewMode,
    setSortBy,

    // Interactions
    handleItemDoubleClick
  };
};