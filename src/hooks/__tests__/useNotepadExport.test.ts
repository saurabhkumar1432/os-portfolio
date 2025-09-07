import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotepadStore } from '../../store/notepadStore';

// Mock performance utils
vi.mock('../../utils', () => ({
  performanceUtils: {
    debounce: (fn: Function) => () => {}, // No-op for testing
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock URL.createObjectURL and related APIs
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('Notepad Export Functionality', () => {
  beforeEach(() => {
    // Reset store state before each test
    useNotepadStore.setState({
      documents: {},
      activeDocumentId: null,
      versions: {},
      autoSaveEnabled: true,
      markdownPreview: false,
      unsavedChanges: new Set(),
    });
    vi.clearAllMocks();
  });

  describe('exportDocument', () => {
    it('should export plain text document', () => {
      const { createDocument, updateDocument, exportDocument } = useNotepadStore.getState();
      const documentId = createDocument('Test Document');
      updateDocument(documentId, { content: 'This is test content' });

      const exported = exportDocument(documentId, 'txt');

      expect(exported).toBe('This is test content');
    });

    it('should export markdown document', () => {
      const { createDocument, updateDocument, toggleMarkdownMode, exportDocument } = useNotepadStore.getState();
      const documentId = createDocument('Markdown Document');
      updateDocument(documentId, { content: '# Heading\n\nThis is **bold** text.' });
      toggleMarkdownMode(documentId);

      const exported = exportDocument(documentId, 'md');

      expect(exported).toBe('# Heading\n\nThis is **bold** text.');
    });

    it('should return empty string for non-existent document', () => {
      const { exportDocument } = useNotepadStore.getState();

      const exported = exportDocument('non-existent', 'txt');

      expect(exported).toBe('');
    });

    it('should handle documents with special characters', () => {
      const { createDocument, updateDocument, exportDocument } = useNotepadStore.getState();
      const documentId = createDocument('Special Characters');
      updateDocument(documentId, { 
        content: 'Content with émojis 🎉 and spëcial chàracters!' 
      });

      const exported = exportDocument(documentId, 'txt');

      expect(exported).toBe('Content with émojis 🎉 and spëcial chàracters!');
    });

    it('should handle empty documents', () => {
      const { createDocument, exportDocument } = useNotepadStore.getState();
      const documentId = createDocument('Empty Document');

      const exported = exportDocument(documentId, 'txt');

      expect(exported).toBe('');
    });

    it('should handle documents with line breaks', () => {
      const { createDocument, updateDocument, exportDocument } = useNotepadStore.getState();
      const documentId = createDocument('Multi-line Document');
      updateDocument(documentId, { 
        content: 'Line 1\nLine 2\n\nLine 4 after empty line' 
      });

      const exported = exportDocument(documentId, 'txt');

      expect(exported).toBe('Line 1\nLine 2\n\nLine 4 after empty line');
    });
  });

  describe('importDocument', () => {
    it('should import plain text document', () => {
      const { importDocument, getActiveDocument } = useNotepadStore.getState();

      const documentId = importDocument('Imported plain text content', 'Imported Note', 'txt');

      const document = getActiveDocument();
      expect(document?.id).toBe(documentId);
      expect(document?.title).toBe('Imported Note');
      expect(document?.content).toBe('Imported plain text content');
      expect(document?.markdownMode).toBe(false);
    });

    it('should import markdown document', () => {
      const { importDocument, getActiveDocument } = useNotepadStore.getState();

      const documentId = importDocument('# Imported Markdown\n\nContent here.', 'Markdown Import', 'md');

      const document = getActiveDocument();
      expect(document?.id).toBe(documentId);
      expect(document?.title).toBe('Markdown Import');
      expect(document?.content).toBe('# Imported Markdown\n\nContent here.');
      expect(document?.markdownMode).toBe(true);
    });

    it('should import document with special characters', () => {
      const { importDocument, getActiveDocument } = useNotepadStore.getState();

      const documentId = importDocument('Spëcial chàracters and émojis 🚀', 'Special Import', 'txt');

      const document = getActiveDocument();
      expect(document?.content).toBe('Spëcial chàracters and émojis 🚀');
    });

    it('should import empty document', () => {
      const { importDocument, getActiveDocument } = useNotepadStore.getState();

      const documentId = importDocument('', 'Empty Import', 'txt');

      const document = getActiveDocument();
      expect(document?.content).toBe('');
      expect(document?.title).toBe('Empty Import');
    });

    it('should set imported document as active', () => {
      const { createDocument, importDocument, getActiveDocument } = useNotepadStore.getState();
      
      // Create an existing document first
      const existingId = createDocument('Existing');
      expect(getActiveDocument()?.id).toBe(existingId);

      // Import new document
      const importedId = importDocument('Imported content', 'Imported', 'txt');

      // Should switch to imported document
      expect(getActiveDocument()?.id).toBe(importedId);
    });
  });

  describe('file format detection', () => {
    it('should correctly detect markdown format', () => {
      const { importDocument, getActiveDocument } = useNotepadStore.getState();

      importDocument('# Markdown content', 'Test', 'md');

      const document = getActiveDocument();
      expect(document?.markdownMode).toBe(true);
    });

    it('should correctly detect text format', () => {
      const { importDocument, getActiveDocument } = useNotepadStore.getState();

      importDocument('Plain text content', 'Test', 'txt');

      const document = getActiveDocument();
      expect(document?.markdownMode).toBe(false);
    });
  });

  describe('export/import round trip', () => {
    it('should maintain content integrity through export/import cycle', () => {
      const { createDocument, updateDocument, exportDocument, importDocument, getActiveDocument } = useNotepadStore.getState();
      
      // Create original document
      const originalId = createDocument('Original Document');
      const originalContent = '# Test Document\n\nThis is **bold** text with *italics*.\n\n- List item 1\n- List item 2';
      updateDocument(originalId, { content: originalContent });

      // Export the document
      const exported = exportDocument(originalId, 'md');

      // Import it back
      const importedId = importDocument(exported, 'Imported Copy', 'md');

      // Verify content is identical
      const importedDocument = getActiveDocument();
      expect(importedDocument?.content).toBe(originalContent);
    });

    it('should handle round trip with special characters', () => {
      const { createDocument, updateDocument, exportDocument, importDocument, getActiveDocument } = useNotepadStore.getState();
      
      const originalId = createDocument('Special Characters');
      const originalContent = 'Tëst with spëcial chàracters: àáâãäåæçèéêë 🎉🚀💻';
      updateDocument(originalId, { content: originalContent });

      const exported = exportDocument(originalId, 'txt');
      const importedId = importDocument(exported, 'Imported Special', 'txt');

      const importedDocument = getActiveDocument();
      expect(importedDocument?.content).toBe(originalContent);
    });
  });
});