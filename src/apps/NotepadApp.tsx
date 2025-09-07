import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Save, 
  Download, 
  Upload, 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Clock, 
  MoreVertical
} from 'lucide-react';
import type { AppProps } from '../types';
import { useNotepad } from '../hooks/useNotepad';
import { useAppFramework } from '../hooks/useAppFramework';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

/**
 * Notepad application component with full text editing capabilities
 */
const NotepadApp: React.FC<AppProps> = ({ 
  windowId, 
  focused, 
  onTitleChange, 
  onUnsavedStateChange 
}) => {
  const appFramework = useAppFramework({
    appId: 'notepad',
    windowId,
    onTitleChange,
    onUnsavedStateChange
  });

  const notepad = useNotepad({ 
    windowId, 
    onUnsavedStateChange: appFramework.handleUnsavedStateChange 
  });
  
  const [showVersions, setShowVersions] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Update window title
  useEffect(() => {
    const title = notepad.activeDocument 
      ? `${notepad.activeDocument.title}${notepad.hasUnsavedChanges() ? ' *' : ''} - Notepad`
      : 'Notepad';
    appFramework.handleTitleChange(title);
  }, [notepad.activeDocument?.title, notepad.hasUnsavedChanges(), appFramework.handleTitleChange]);

  // Focus editor when window becomes focused
  useEffect(() => {
    if (appFramework.isFocused) {
      notepad.focusEditor();
      appFramework.handleFocus();
    }
  }, [appFramework.isFocused, notepad.focusEditor, appFramework.handleFocus]);

  // Handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      notepad.importDocument(file).catch(console.error);
    }
    // Reset input
    event.target.value = '';
  };

  // Handle export
  const handleExport = async (format: 'txt' | 'md' | 'clipboard') => {
    const success = await notepad.exportDocument(format);
    if (success && format === 'clipboard') {
      // Could show a toast notification here
      console.log('Copied to clipboard');
    }
    setExportMenuOpen(false);
  };

  const versions = notepad.getVersions();

  if (!notepad.activeDocument) {
    return (
      <div className="h-full bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Document Open
          </h2>
          <button
            onClick={() => notepad.createDocument()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Create New Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          {/* Document selector */}
          <div className="relative">
            <button
              onClick={() => setShowDocuments(!showDocuments)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <FileText className="w-4 h-4" />
              <span className="max-w-32 truncate">
                {notepad.activeDocument.title}
              </span>
              {notepad.hasUnsavedChanges() && <span className="text-orange-500">●</span>}
            </button>
            
            {showDocuments && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10 min-w-48 max-h-64 overflow-y-auto">
                <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => {
                      notepad.createDocument();
                      setShowDocuments(false);
                    }}
                    className="flex items-center space-x-2 w-full px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Document</span>
                  </button>
                </div>
                {notepad.documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      notepad.setActiveDocument(doc.id);
                      setShowDocuments(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 ${
                      doc.id === notepad.activeDocument?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span className="truncate">{doc.title}</span>
                      {notepad.hasUnsavedChanges(doc.id) && (
                        <span className="text-orange-500">●</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {doc.lastModified.toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title editor */}
          <input
            type="text"
            value={notepad.activeDocument.title}
            onChange={(e) => notepad.handleTitleChange(e.target.value)}
            className="px-2 py-1 text-sm bg-transparent border-none outline-none focus:bg-white dark:focus:bg-gray-700 rounded min-w-0 flex-1 max-w-48"
            placeholder="Document title..."
          />
        </div>

        <div className="flex items-center space-x-1">
          {/* Markdown toggle */}
          <button
            onClick={notepad.toggleMarkdownMode}
            className={`p-1 rounded text-sm ${
              notepad.activeDocument.markdownMode
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Toggle Markdown Mode"
          >
            MD
          </button>

          {/* Preview toggle */}
          {notepad.activeDocument.markdownMode && (
            <button
              onClick={notepad.toggleMarkdownPreview}
              className={`p-1 rounded ${
                notepad.markdownPreview
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Toggle Preview"
            >
              {notepad.markdownPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {/* Save version */}
          <button
            onClick={notepad.saveVersion}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Save Version (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
          </button>

          {/* Version history */}
          <button
            onClick={() => setShowVersions(!showVersions)}
            className={`p-1 rounded ${
              showVersions
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Version History"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Export menu */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Export Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {exportMenuOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10 min-w-40">
                <button
                  onClick={() => handleExport('txt')}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Download className="w-4 h-4" />
                  <span>Export as .txt</span>
                </button>
                <button
                  onClick={() => handleExport('md')}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Download className="w-4 h-4" />
                  <span>Export as .md</span>
                </button>
                <button
                  onClick={() => handleExport('clipboard')}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy to clipboard</span>
                </button>
                <div className="border-t border-gray-200 dark:border-gray-600">
                  <label className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Import file</span>
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Delete document */}
          {notepad.documents.length > 1 && notepad.activeDocument && (
            <button
              onClick={() => {
                if (notepad.activeDocument && confirm(`Delete "${notepad.activeDocument.title}"?`)) {
                  notepad.deleteDocument(notepad.activeDocument.id);
                }
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Version history sidebar */}
        {showVersions && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                Version History
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {versions.length} versions saved
              </p>
            </div>
            <div className="p-2 space-y-1">
              {versions.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
                  No versions saved yet
                </p>
              ) : (
                versions.slice().reverse().map((version) => (
                  <button
                    key={version.id}
                    onClick={() => {
                      if (confirm('Restore this version? Current changes will be lost.')) {
                        notepad.restoreVersion(version.id);
                      }
                    }}
                    className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                  >
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      {version.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {version.timestamp.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                      {version.content.substring(0, 50)}...
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Editor/Preview area */}
        <div className="flex-1 flex">
          {notepad.activeDocument.markdownMode && notepad.markdownPreview ? (
            // Split view: Editor + Preview
            <>
              <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Editor
                </div>
                <textarea
                  ref={notepad.textareaRef}
                  value={notepad.activeDocument.content}
                  onChange={(e) => notepad.handleContentChange(e.target.value)}
                  onKeyDown={notepad.handleKeyDown}
                  className="flex-1 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none outline-none"
                  placeholder="Start typing..."
                  autoFocus={focused}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preview
                </div>
                <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-900">
                  <MarkdownRenderer content={notepad.activeDocument.content} />
                </div>
              </div>
            </>
          ) : (
            // Single view: Editor only
            <textarea
              ref={notepad.textareaRef}
              value={notepad.activeDocument.content}
              onChange={(e) => notepad.handleContentChange(e.target.value)}
              onKeyDown={notepad.handleKeyDown}
              className="flex-1 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none outline-none"
              placeholder="Start typing..."
              autoFocus={focused}
            />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>
            {notepad.activeDocument.content.length} characters
          </span>
          <span>
            {notepad.activeDocument.content.split('\n').length} lines
          </span>
          {notepad.activeDocument.markdownMode && (
            <span className="text-blue-600 dark:text-blue-400">Markdown</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span>
            Modified: {notepad.activeDocument.lastModified.toLocaleString()}
          </span>
          {notepad.autoSaveEnabled && (
            <span className="text-green-600 dark:text-green-400">Auto-save enabled</span>
          )}
        </div>
      </div>

      {/* Click outside handlers */}
      {(showDocuments || exportMenuOpen || showVersions) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowDocuments(false);
            setExportMenuOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default NotepadApp;