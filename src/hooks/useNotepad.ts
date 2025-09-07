import { useCallback, useEffect, useRef } from 'react';
import { useNotepadStore } from '../store/notepadStore';

interface UseNotepadOptions {
  windowId: string;
  onUnsavedStateChange?: (hasUnsaved: boolean) => void;
}

export const useNotepad = ({ onUnsavedStateChange }: UseNotepadOptions) => {
  const store = useNotepadStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeDocument = store.getActiveDocument();

  // Notify parent component about unsaved changes
  useEffect(() => {
    if (activeDocument && onUnsavedStateChange) {
      const hasUnsaved = store.hasUnsavedChanges(activeDocument.id);
      onUnsavedStateChange(hasUnsaved);
    }
  }, [activeDocument?.id, store.unsavedChanges, onUnsavedStateChange]);

  // Create new document if none exists
  useEffect(() => {
    if (!activeDocument && Object.keys(store.documents).length === 0) {
      store.createDocument('Welcome Note');
      const newDocId = store.activeDocumentId;
      if (newDocId) {
        store.updateDocument(newDocId, {
          content: `# Welcome to Notepad

This is your personal notepad within Portfolio OS. You can:

- Write plain text or markdown
- Toggle between edit and preview modes
- Auto-save is enabled by default
- Access version history (up to 10 versions)
- Export your notes as .txt or .md files

Start typing to begin...`,
          markdownMode: true,
        });
      }
    }
  }, [activeDocument, store.documents, store.createDocument, store.updateDocument, store.activeDocumentId]);

  // Handle content changes
  const handleContentChange = useCallback((content: string) => {
    if (activeDocument) {
      store.updateDocument(activeDocument.id, { content });
    }
  }, [activeDocument, store.updateDocument]);

  // Handle title changes
  const handleTitleChange = useCallback((title: string) => {
    if (activeDocument) {
      store.updateDocument(activeDocument.id, { title });
    }
  }, [activeDocument, store.updateDocument]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!activeDocument) return;

    // Ctrl+S: Manual save (create version)
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      store.saveVersion(activeDocument.id);
    }

    // Ctrl+N: New document
    if (event.ctrlKey && event.key === 'n') {
      event.preventDefault();
      store.createDocument();
    }

    // Ctrl+M: Toggle markdown mode
    if (event.ctrlKey && event.key === 'm') {
      event.preventDefault();
      store.toggleMarkdownMode(activeDocument.id);
    }

    // Ctrl+P: Toggle preview
    if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();
      store.toggleMarkdownPreview();
    }

    // Tab: Insert tab character (prevent focus change)
    if (event.key === 'Tab' && textareaRef.current) {
      event.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = 
        activeDocument.content.substring(0, start) + 
        '\t' + 
        activeDocument.content.substring(end);
      
      handleContentChange(newContent);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  }, [activeDocument, store.saveVersion, store.createDocument, store.toggleMarkdownMode, store.toggleMarkdownPreview, handleContentChange]);

  // Export functionality
  const exportDocument = useCallback(async (format: 'txt' | 'md' | 'clipboard') => {
    if (!activeDocument) return;

    const content = store.exportDocument(activeDocument.id, format === 'clipboard' ? 'txt' : format);
    
    if (format === 'clipboard') {
      try {
        await navigator.clipboard.writeText(content);
        return true;
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
      }
    } else {
      // Create download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeDocument.title}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    }
  }, [activeDocument, store.exportDocument]);

  // Import functionality
  const importDocument = useCallback((file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const format = file.name.endsWith('.md') ? 'md' : 'txt';
        const title = file.name.replace(/\.(txt|md)$/, '');
        
        const documentId = store.importDocument(content, title, format);
        store.setActiveDocument(documentId);
        resolve(documentId);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [store.importDocument, store.setActiveDocument]);

  // Focus textarea
  const focusEditor = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return {
    // State
    activeDocument,
    documents: store.getDocumentList(),
    markdownPreview: store.markdownPreview,
    autoSaveEnabled: store.autoSaveEnabled,
    
    // Actions
    createDocument: store.createDocument,
    setActiveDocument: store.setActiveDocument,
    deleteDocument: store.deleteDocument,
    handleContentChange,
    handleTitleChange,
    handleKeyDown,
    toggleMarkdownMode: () => activeDocument && store.toggleMarkdownMode(activeDocument.id),
    toggleMarkdownPreview: store.toggleMarkdownPreview,
    setAutoSave: store.setAutoSave,
    
    // Version management
    saveVersion: () => activeDocument && store.saveVersion(activeDocument.id),
    restoreVersion: (versionId: string) => activeDocument && store.restoreVersion(activeDocument.id, versionId),
    getVersions: () => activeDocument ? store.getVersions(activeDocument.id) : [],
    
    // File operations
    exportDocument,
    importDocument,
    
    // Utilities
    hasUnsavedChanges: (id?: string) => {
      const docId = id || activeDocument?.id;
      return docId ? store.hasUnsavedChanges(docId) : false;
    },
    focusEditor,
    textareaRef,
  };
};