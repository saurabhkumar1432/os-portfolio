import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotepadStore } from '../notepadStore';
import type { NotepadDocument, NotepadVersion } from '../../types';

// Mock performance utils
vi.mock('../../utils', () => ({
  performanceUtils: {
    debounce: (fn: Function) => {
      // Return a function that doesn't execute immediately
      return () => {}; // No-op for testing
    },
  },
}));

describe('notepadStore', () => {
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
  });

  describe('createDocument', () => {
    it('should create a new document with default title', () => {
      const { createDocument } = useNotepadStore.getState();
      const documentId = createDocument();

      const state = useNotepadStore.getState();
      expect(state.documents[documentId]).toBeDefined();
      expect(state.documents[documentId].title).toBe('Untitled');
      expect(state.documents[documentId].content).toBe('');
      expect(state.documents[documentId].markdownMode).toBe(false);
      expect(state.activeDocumentId).toBe(documentId);
      expect(state.versions[documentId]).toEqual([]);
    });

    it('should create a new document with custom title', () => {
      const { createDocument } = useNotepadStore.getState();
      const documentId = createDocument('My Note');

      const state = useNotepadStore.getState();
      expect(state.documents[documentId].title).toBe('My Note');
    });

    it('should generate unique document IDs', () => {
      const { createDocument } = useNotepadStore.getState();
      const id1 = createDocument();
      const id2 = createDocument();

      expect(id1).not.toBe(id2);
    });

    it('should set created and lastModified dates', () => {
      const { createDocument } = useNotepadStore.getState();
      const documentId = createDocument();

      const document = useNotepadStore.getState().documents[documentId];
      expect(document.created).toBeInstanceOf(Date);
      expect(document.lastModified).toBeInstanceOf(Date);
    });
  });

  describe('updateDocument', () => {
    it('should update document content', () => {
      const { createDocument, updateDocument } = useNotepadStore.getState();
      const documentId = createDocument();

      updateDocument(documentId, { content: 'New content' });

      const document = useNotepadStore.getState().documents[documentId];
      expect(document.content).toBe('New content');
    });

    it('should update document title', () => {
      const { createDocument, updateDocument } = useNotepadStore.getState();
      const documentId = createDocument();

      updateDocument(documentId, { title: 'New Title' });

      const document = useNotepadStore.getState().documents[documentId];
      expect(document.title).toBe('New Title');
    });

    it('should update lastModified date', async () => {
      const { createDocument, updateDocument } = useNotepadStore.getState();
      const documentId = createDocument();
      const originalDate = useNotepadStore.getState().documents[documentId].lastModified;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      
      updateDocument(documentId, { content: 'Updated' });
      const updatedDate = useNotepadStore.getState().documents[documentId].lastModified;
      expect(updatedDate.getTime()).toBeGreaterThan(originalDate.getTime());
    });

    it('should mark document as having unsaved changes', () => {
      const { createDocument, updateDocument } = useNotepadStore.getState();
      const documentId = createDocument();

      updateDocument(documentId, { content: 'New content' });

      const state = useNotepadStore.getState();
      expect(state.unsavedChanges.has(documentId)).toBe(true);
    });

    it('should not update non-existent document', () => {
      const { updateDocument } = useNotepadStore.getState();
      const initialState = useNotepadStore.getState();

      updateDocument('non-existent', { content: 'test' });

      const finalState = useNotepadStore.getState();
      expect(finalState).toEqual(initialState);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document and its versions', () => {
      const { createDocument, deleteDocument, saveVersion } = useNotepadStore.getState();
      const documentId = createDocument();
      saveVersion(documentId);

      deleteDocument(documentId);

      const state = useNotepadStore.getState();
      expect(state.documents[documentId]).toBeUndefined();
      expect(state.versions[documentId]).toBeUndefined();
    });

    it('should clear active document if deleted', () => {
      const { createDocument, deleteDocument } = useNotepadStore.getState();
      const documentId = createDocument();

      deleteDocument(documentId);

      const state = useNotepadStore.getState();
      expect(state.activeDocumentId).toBeNull();
    });

    it('should not clear active document if different document deleted', () => {
      const { createDocument, deleteDocument, setActiveDocument } = useNotepadStore.getState();
      const doc1 = createDocument();
      const doc2 = createDocument();
      setActiveDocument(doc1);

      deleteDocument(doc2);

      const state = useNotepadStore.getState();
      expect(state.activeDocumentId).toBe(doc1);
    });

    it('should remove unsaved changes flag', () => {
      const { createDocument, updateDocument, deleteDocument } = useNotepadStore.getState();
      const documentId = createDocument();
      updateDocument(documentId, { content: 'test' });

      deleteDocument(documentId);

      const state = useNotepadStore.getState();
      expect(state.unsavedChanges.has(documentId)).toBe(false);
    });
  });

  describe('setActiveDocument', () => {
    it('should set active document', () => {
      const { createDocument, setActiveDocument } = useNotepadStore.getState();
      const documentId = createDocument();

      setActiveDocument(documentId);

      expect(useNotepadStore.getState().activeDocumentId).toBe(documentId);
    });

    it('should clear active document', () => {
      const { createDocument, setActiveDocument } = useNotepadStore.getState();
      const documentId = createDocument();

      setActiveDocument(null);

      expect(useNotepadStore.getState().activeDocumentId).toBeNull();
    });
  });

  describe('toggleMarkdownMode', () => {
    it('should toggle markdown mode', () => {
      const { createDocument, toggleMarkdownMode } = useNotepadStore.getState();
      const documentId = createDocument();

      toggleMarkdownMode(documentId);

      const document = useNotepadStore.getState().documents[documentId];
      expect(document.markdownMode).toBe(true);

      toggleMarkdownMode(documentId);
      const updatedDocument = useNotepadStore.getState().documents[documentId];
      expect(updatedDocument.markdownMode).toBe(false);
    });

    it('should not toggle for non-existent document', () => {
      const { toggleMarkdownMode } = useNotepadStore.getState();
      const initialState = useNotepadStore.getState();

      toggleMarkdownMode('non-existent');

      const finalState = useNotepadStore.getState();
      expect(finalState).toEqual(initialState);
    });
  });

  describe('version management', () => {
    it('should save version', () => {
      const { createDocument, updateDocument, saveVersion, getVersions } = useNotepadStore.getState();
      const documentId = createDocument('Test Doc');
      updateDocument(documentId, { title: 'Test content' }); // Update title instead of content to avoid auto-save

      saveVersion(documentId);

      const versions = getVersions(documentId);
      expect(versions).toHaveLength(1);
      expect(versions[0].content).toBe('');
      expect(versions[0].title).toBe('Test content');
      expect(versions[0].timestamp).toBeInstanceOf(Date);
    });

    it('should limit versions to maximum count', () => {
      const { createDocument, updateDocument, saveVersion, getVersions } = useNotepadStore.getState();
      const documentId = createDocument();

      // Save 12 versions (more than MAX_VERSIONS = 10)
      for (let i = 0; i < 12; i++) {
        updateDocument(documentId, { title: `Content ${i}` }); // Update title to avoid auto-save
        saveVersion(documentId);
      }

      const versions = getVersions(documentId);
      expect(versions).toHaveLength(10);
      expect(versions[0].title).toBe('Content 2'); // First two should be removed
      expect(versions[9].title).toBe('Content 11');
    });

    it('should restore version', () => {
      const { createDocument, updateDocument, saveVersion, restoreVersion, getVersions } = useNotepadStore.getState();
      const documentId = createDocument();
      
      updateDocument(documentId, { content: 'Original content', title: 'Original Title' });
      saveVersion(documentId);
      const versions = getVersions(documentId);
      const versionId = versions[0].id;

      updateDocument(documentId, { content: 'Modified content', title: 'Modified Title' });

      restoreVersion(documentId, versionId);

      const document = useNotepadStore.getState().documents[documentId];
      expect(document.content).toBe('Original content');
      expect(document.title).toBe('Original Title');
    });

    it('should not restore non-existent version', () => {
      const { createDocument, updateDocument, restoreVersion } = useNotepadStore.getState();
      const documentId = createDocument();
      updateDocument(documentId, { content: 'Test content' });
      const originalContent = useNotepadStore.getState().documents[documentId].content;

      restoreVersion(documentId, 'non-existent-version');

      const document = useNotepadStore.getState().documents[documentId];
      expect(document.content).toBe(originalContent);
    });
  });

  describe('export functionality', () => {
    it('should export document content', () => {
      const { createDocument, updateDocument, exportDocument } = useNotepadStore.getState();
      const documentId = createDocument();
      updateDocument(documentId, { content: 'Test content' });

      const exported = exportDocument(documentId, 'txt');

      expect(exported).toBe('Test content');
    });

    it('should export markdown content', () => {
      const { createDocument, updateDocument, toggleMarkdownMode, exportDocument } = useNotepadStore.getState();
      const documentId = createDocument();
      updateDocument(documentId, { content: '# Markdown content' });
      toggleMarkdownMode(documentId);

      const exported = exportDocument(documentId, 'md');

      expect(exported).toBe('# Markdown content');
    });

    it('should return empty string for non-existent document', () => {
      const { exportDocument } = useNotepadStore.getState();

      const exported = exportDocument('non-existent', 'txt');

      expect(exported).toBe('');
    });
  });

  describe('import functionality', () => {
    it('should import document with text format', () => {
      const { importDocument, getActiveDocument } = useNotepadStore.getState();

      const documentId = importDocument('Imported content', 'Imported Note', 'txt');

      const document = getActiveDocument();
      expect(document?.id).toBe(documentId);
      expect(document?.title).toBe('Imported Note');
      expect(document?.content).toBe('Imported content');
      expect(document?.markdownMode).toBe(false);
    });

    it('should import document with markdown format', () => {
      const { importDocument, getActiveDocument } = useNotepadStore.getState();

      const documentId = importDocument('# Markdown content', 'Markdown Note', 'md');

      const document = getActiveDocument();
      expect(document?.markdownMode).toBe(true);
    });
  });

  describe('computed properties', () => {
    it('should get active document', () => {
      const { createDocument, getActiveDocument } = useNotepadStore.getState();
      const documentId = createDocument('Active Doc');

      const activeDoc = getActiveDocument();

      expect(activeDoc?.id).toBe(documentId);
      expect(activeDoc?.title).toBe('Active Doc');
    });

    it('should return null when no active document', () => {
      const { getActiveDocument, setActiveDocument } = useNotepadStore.getState();
      setActiveDocument(null);

      const activeDoc = getActiveDocument();

      expect(activeDoc).toBeNull();
    });

    it('should check for unsaved changes', () => {
      const { createDocument, updateDocument, hasUnsavedChanges } = useNotepadStore.getState();
      const documentId = createDocument();

      expect(hasUnsavedChanges(documentId)).toBe(false);

      updateDocument(documentId, { content: 'Modified' });

      expect(hasUnsavedChanges(documentId)).toBe(true);
    });

    it('should get document list sorted by last modified', async () => {
      const { createDocument, updateDocument, getDocumentList } = useNotepadStore.getState();
      
      const doc1 = createDocument('First');
      const doc2 = createDocument('Second');
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      
      // Update first document to make it more recent
      updateDocument(doc1, { content: 'Updated first' });
      
      const documents = getDocumentList();
      expect(documents).toHaveLength(2);
      expect(documents[0].id).toBe(doc1); // Most recently modified first
      expect(documents[1].id).toBe(doc2);
    });
  });

  describe('preferences', () => {
    it('should toggle markdown preview', () => {
      const { toggleMarkdownPreview } = useNotepadStore.getState();

      expect(useNotepadStore.getState().markdownPreview).toBe(false);

      toggleMarkdownPreview();
      expect(useNotepadStore.getState().markdownPreview).toBe(true);

      toggleMarkdownPreview();
      expect(useNotepadStore.getState().markdownPreview).toBe(false);
    });

    it('should set auto-save preference', () => {
      const { setAutoSave } = useNotepadStore.getState();

      setAutoSave(false);
      expect(useNotepadStore.getState().autoSaveEnabled).toBe(false);

      setAutoSave(true);
      expect(useNotepadStore.getState().autoSaveEnabled).toBe(true);
    });
  });
});