import React from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  File, 
  Download,
  ExternalLink,
  Copy
} from 'lucide-react';
import type { VNode } from '../../types';

interface FilePreviewProps {
  file: VNode | null;
  onClose: () => void;
  className?: string;
}

/**
 * File preview component for displaying file contents
 */
export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onClose,
  className = ''
}) => {
  if (!file) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <File className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-medium">No file selected</p>
          <p className="text-sm">Select a file to preview its contents</p>
        </div>
      </div>
    );
  }

  const handleCopyContent = async () => {
    if (file.content) {
      try {
        await navigator.clipboard.writeText(file.content);
        // Could show a toast notification here
        console.log('Content copied to clipboard');
      } catch (error) {
        console.error('Failed to copy content:', error);
      }
    }
  };

  const handleDownload = () => {
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

  const renderPreviewContent = () => {
    if (!file.content) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <File className="w-12 h-12 mx-auto mb-4" />
            <p>No preview available</p>
          </div>
        </div>
      );
    }

    // Handle different file types
    switch (file.ext) {
      case 'md':
        return (
          <div className="p-4 h-full overflow-auto">
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 dark:bg-gray-900 p-4 rounded">
                {file.content}
              </pre>
            </div>
          </div>
        );

      case 'txt':
        return (
          <div className="p-4 h-full overflow-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200">
              {file.content}
            </pre>
          </div>
        );

      case 'pdf':
        return (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium">PDF Preview</p>
              <p className="text-sm mb-4">PDF preview not implemented yet</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                         transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Download PDF
              </button>
            </div>
          </div>
        );

      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Image Preview</p>
              <p className="text-sm">Image preview not implemented yet</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 h-full overflow-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200">
              {file.content}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Preview header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {file.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {file.type === 'file' && file.size 
                ? `${(file.size / 1024).toFixed(1)} KB`
                : 'File'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {file.content && (
            <>
              <button
                onClick={handleCopyContent}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
                         transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Copy content"
                aria-label="Copy file content to clipboard"
              >
                <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              <button
                onClick={handleDownload}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
                         transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Download file"
                aria-label="Download file"
              >
                <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
                     transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Close preview"
            aria-label="Close file preview"
          >
            <ExternalLink className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-hidden">
        {renderPreviewContent()}
      </div>

      {/* Preview footer */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>{file.path}</span>
          {file.modified && (
            <span>Modified: {file.modified.toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};