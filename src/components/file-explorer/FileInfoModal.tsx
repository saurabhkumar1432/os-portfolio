import React from 'react';
import { X, File, Folder } from 'lucide-react';
import type { VNode } from '../../types';
import { virtualFileSystem } from '../../services/virtualFileSystem';

interface FileInfoModalProps {
  file: VNode;
  onClose: () => void;
  className?: string;
}

/**
 * File information modal component
 */
export const FileInfoModal: React.FC<FileInfoModalProps> = ({
  file,
  onClose,
  className = ''
}) => {
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  const IconComponent = file.type === 'folder' ? Folder : File;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-info-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <IconComponent className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <h2 id="file-info-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Properties
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
                     transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close properties dialog"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* File icon and name */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
              <IconComponent className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{file.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {file.type === 'folder' ? 'Folder' : (file.ext?.toUpperCase() || 'File')}
              </p>
            </div>
          </div>

          {/* Properties */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Type:</span>
              <span className="col-span-2 text-gray-900 dark:text-gray-100">
                {file.type === 'folder' ? 'Folder' : `${file.ext?.toUpperCase() || 'Unknown'} File`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Location:</span>
              <span className="col-span-2 text-gray-900 dark:text-gray-100 break-all">
                {file.path}
              </span>
            </div>

            {file.type === 'file' && file.size && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Size:</span>
                <span className="col-span-2 text-gray-900 dark:text-gray-100">
                  {virtualFileSystem.formatFileSize(file.size)} ({file.size.toLocaleString()} bytes)
                </span>
              </div>
            )}

            {file.modified && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Modified:</span>
                <span className="col-span-2 text-gray-900 dark:text-gray-100">
                  {file.modified.toLocaleDateString()} {file.modified.toLocaleTimeString()}
                </span>
              </div>
            )}

            {file.type === 'folder' && file.children && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Contains:</span>
                <span className="col-span-2 text-gray-900 dark:text-gray-100">
                  {file.children.length} item{file.children.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {file.content && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Content:</span>
                <span className="col-span-2 text-gray-900 dark:text-gray-100">
                  {file.content.length} characters
                </span>
              </div>
            )}
          </div>

          {/* Additional info for specific file types */}
          {file.ext === 'md' && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <File className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Markdown Document
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                This file contains formatted text that can be rendered as HTML.
              </p>
            </div>
          )}

          {file.ext === 'pdf' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-2">
                <File className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  PDF Document
                </span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                Portable Document Format file. Use external viewer for full functionality.
              </p>
            </div>
          )}

          {file.ext === 'lnk' && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <File className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Shortcut Link
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                This is a shortcut that opens an application or file.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                     transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};