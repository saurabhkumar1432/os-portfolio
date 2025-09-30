import React, { useState } from 'react';
import type { AppProps, VNode } from '../types';
import { useFileExplorer } from '../hooks/useFileExplorer';
import { Breadcrumb } from '../components/file-explorer/Breadcrumb';
import { NavigationToolbar } from '../components/file-explorer/NavigationToolbar';
import { FileList } from '../components/file-explorer/FileList';
import { FilePreview } from '../components/file-explorer/FilePreview';
import { ContextMenu } from '../components/file-explorer/ContextMenu';
import { FileInfoModal } from '../components/file-explorer/FileInfoModal';

/**
 * File Explorer application component
 * Provides a virtual file system interface for browsing portfolio content
 */
const FileExplorerApp: React.FC<AppProps> = ({ onTitleChange }) => {
  const {
    fileSystem,
    previewFile,
    loading,
    error,
    navigateToPath,
    navigateBack,
    navigateForward,
    navigateUp,
    canNavigateBack,
    canNavigateForward,
    canNavigateUp,
    getCurrentContents,
    getBreadcrumbs,
    selectItem,
    clearSelection,
    setPreviewFile,
    setViewMode,
    setSortBy,
    handleItemDoubleClick
  } = useFileExplorer();

  const [contextMenu, setContextMenu] = useState<{
    file: VNode;
    x: number;
    y: number;
  } | null>(null);
  const [showPreviewPane, setShowPreviewPane] = useState(true);
  const [fileInfoModal, setFileInfoModal] = useState<VNode | null>(null);

  // Update window title based on current path
  React.useEffect(() => {
    const breadcrumbs = getBreadcrumbs();
    const currentFolder = breadcrumbs[breadcrumbs.length - 1]?.name || 'File Explorer';
    onTitleChange(`File Explorer - ${currentFolder}`);
  }, [fileSystem.currentPath, onTitleChange, getBreadcrumbs]);

  const handleRefresh = () => {
    // Force re-render by navigating to current path
    navigateToPath(fileSystem.currentPath);
  };

  const handleItemClick = (file: VNode, multiSelect: boolean) => {
    selectItem(file.path, multiSelect);
  };

  const handleContextMenu = (file: VNode, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      file,
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handlePreviewFile = (file: VNode) => {
    setPreviewFile(file);
    setShowPreviewPane(true);
  };

  const handleOpenFile = (file: VNode) => {
    if (file.type === 'folder') {
      navigateToPath(file.path);
    } else {
      handlePreviewFile(file);
    }
  };

  const handleCopyPath = async (file: VNode) => {
    try {
      await navigator.clipboard.writeText(file.path);
      // Path copied successfully
    } catch (error) {
      console.error('Failed to copy path:', error);
    }
  };

  const handleDownloadFile = (file: VNode) => {
    if (file.content) {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleShowFileInfo = (file: VNode) => {
    setFileInfoModal(file);
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const togglePreviewPane = () => {
    setShowPreviewPane(!showPreviewPane);
    if (!showPreviewPane) {
      setPreviewFile(null);
    }
  };

  const handleBackgroundClick = () => {
    clearSelection();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                     transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentContents = getCurrentContents();
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900" onClick={handleBackgroundClick}>
      {/* Navigation toolbar */}
      <NavigationToolbar
        canNavigateBack={canNavigateBack}
        canNavigateForward={canNavigateForward}
        canNavigateUp={canNavigateUp}
        viewMode={fileSystem.viewMode}
        sortBy={fileSystem.sortBy}
        onNavigateBack={navigateBack}
        onNavigateForward={navigateForward}
        onNavigateUp={navigateUp}
        onRefresh={handleRefresh}
        onViewModeChange={setViewMode}
        onSortChange={setSortBy}
      />

      {/* Breadcrumb navigation */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <Breadcrumb
          items={breadcrumbs}
          onNavigate={navigateToPath}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File list */}
        <div className={`${showPreviewPane && previewFile ? 'flex-1' : 'w-full'} overflow-auto`}>
          <FileList
            files={currentContents}
            selectedItems={fileSystem.selectedItems}
            viewMode={fileSystem.viewMode}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
            onContextMenu={handleContextMenu}
            className="h-full"
          />
        </div>

        {/* Preview pane */}
        {showPreviewPane && (
          <div className="w-80 flex-shrink-0">
            <FilePreview
              file={previewFile}
              onClose={handleClosePreview}
              className="h-full"
            />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>
            {currentContents.length} item{currentContents.length !== 1 ? 's' : ''}
            {fileSystem.selectedItems.length > 0 && (
              <span className="ml-2">
                ({fileSystem.selectedItems.length} selected)
              </span>
            )}
          </span>
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePreviewPane}
              className="text-xs hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              {showPreviewPane ? 'Hide Preview' : 'Show Preview'}
            </button>
            <span>{fileSystem.currentPath}</span>
          </div>
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          file={contextMenu.file}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          onPreview={handlePreviewFile}
          onOpen={handleOpenFile}
          onCopy={handleCopyPath}
          onDownload={handleDownloadFile}
          onShowInfo={handleShowFileInfo}
        />
      )}

      {/* File info modal */}
      {fileInfoModal && (
        <FileInfoModal
          file={fileInfoModal}
          onClose={() => setFileInfoModal(null)}
        />
      )}
    </div>
  );
};

export default FileExplorerApp;