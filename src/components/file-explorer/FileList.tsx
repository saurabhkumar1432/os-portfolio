import React from 'react';
import { 
  Folder, 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Link,
  Monitor,
  User,
  FolderOpen,
  Globe,
  Smartphone,
  Server,
  Briefcase,
  Mail,
  CheckSquare,
  StickyNote
} from 'lucide-react';
import type { VNode } from '../../types';
import { virtualFileSystem } from '../../services/virtualFileSystem';

interface FileListProps {
  files: VNode[];
  selectedItems: string[];
  viewMode: 'list' | 'grid';
  onItemClick: (file: VNode, multiSelect: boolean) => void;
  onItemDoubleClick: (file: VNode) => void;
  onContextMenu: (file: VNode, event: React.MouseEvent) => void;
  className?: string;
}

/**
 * Get the appropriate icon component for a file/folder
 */
const getIconComponent = (node: VNode) => {
  const iconName = virtualFileSystem.getFileIcon(node);
  
  const iconMap = {
    Folder,
    FolderOpen,
    File,
    FileText,
    Image,
    Video,
    Music,
    Link,
    Monitor,
    User,
    Globe,
    Smartphone,
    Server,
    Briefcase,
    Mail,
    CheckSquare,
    StickyNote
  };

  const IconComponent = iconMap[iconName as keyof typeof iconMap] || File;
  return IconComponent;
};

/**
 * File list component for displaying files and folders
 */
export const FileList: React.FC<FileListProps> = ({
  files,
  selectedItems,
  viewMode,
  onItemClick,
  onItemDoubleClick,
  onContextMenu,
  className = ''
}) => {
  const handleKeyDown = (event: React.KeyboardEvent, file: VNode) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onItemDoubleClick(file);
    }
  };

  if (viewMode === 'grid') {
    return (
      <div className={`grid grid-cols-auto-fill-100 gap-4 p-4 ${className}`}>
        {files.map((file) => {
          const IconComponent = getIconComponent(file);
          const isSelected = selectedItems.includes(file.path);

          return (
            <div
              key={file.path}
              className={`
                flex flex-col items-center p-3 rounded-lg cursor-pointer
                transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isSelected
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }
              `}
              onClick={(e) => onItemClick(file, e.ctrlKey || e.metaKey)}
              onDoubleClick={() => onItemDoubleClick(file)}
              onContextMenu={(e) => onContextMenu(file, e)}
              onKeyDown={(e) => handleKeyDown(e, file)}
              tabIndex={0}
              role="button"
              aria-label={`${file.type === 'folder' ? 'Folder' : 'File'}: ${file.name}`}
              aria-selected={isSelected}
            >
              <IconComponent 
                className={`w-8 h-8 mb-2 ${
                  file.type === 'folder' 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} 
              />
              <span className="text-sm text-center break-words max-w-full">
                {file.name}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* List header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-2">Modified</div>
      </div>

      {/* File list */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {files.map((file) => {
          const IconComponent = getIconComponent(file);
          const isSelected = selectedItems.includes(file.path);

          return (
            <div
              key={file.path}
              className={`
                grid grid-cols-12 gap-4 px-4 py-2 cursor-pointer
                transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                }
              `}
              onClick={(e) => onItemClick(file, e.ctrlKey || e.metaKey)}
              onDoubleClick={() => onItemDoubleClick(file)}
              onContextMenu={(e) => onContextMenu(file, e)}
              onKeyDown={(e) => handleKeyDown(e, file)}
              tabIndex={0}
              role="button"
              aria-label={`${file.type === 'folder' ? 'Folder' : 'File'}: ${file.name}`}
              aria-selected={isSelected}
            >
              {/* Name column */}
              <div className="col-span-6 flex items-center space-x-3 min-w-0">
                <IconComponent 
                  className={`w-4 h-4 flex-shrink-0 ${
                    file.type === 'folder' 
                      ? 'text-blue-500 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} 
                />
                <span className="truncate">{file.name}</span>
              </div>

              {/* Type column */}
              <div className="col-span-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                {file.type === 'folder' ? 'Folder' : (file.ext?.toUpperCase() || 'File')}
              </div>

              {/* Size column */}
              <div className="col-span-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                {file.type === 'file' && file.size 
                  ? virtualFileSystem.formatFileSize(file.size)
                  : '—'
                }
              </div>

              {/* Modified column */}
              <div className="col-span-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                {file.modified 
                  ? file.modified.toLocaleDateString()
                  : '—'
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <Folder className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium">This folder is empty</p>
          <p className="text-sm">No files or folders to display</p>
        </div>
      )}
    </div>
  );
};