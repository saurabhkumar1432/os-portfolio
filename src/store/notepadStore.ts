import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { NotepadState, NotepadDocument, NotepadVersion } from '../types';
import { performanceUtils } from '../utils';

interface NotepadStore extends NotepadState {
  // Actions
  createDocument: (title?: string) => string;
  updateDocument: (id: string, updates: Partial<NotepadDocument>) => void;
  deleteDocument: (id: string) => void;
  setActiveDocument: (id: string | null) => void;
  toggleMarkdownMode: (id: string) => void;
  toggleMarkdownPreview: () => void;
  setAutoSave: (enabled: boolean) => void;
  
  // Version management
  saveVersion: (documentId: string) => void;
  restoreVersion: (documentId: string, versionId: string) => void;
  getVersions: (documentId: string) => NotepadVersion[];
  
  // Content operations
  exportDocument: (id: string, format: 'txt' | 'md') => string;
  importDocument: (content: string, title: string, format: 'txt' | 'md') => string;
  
  // Computed
  getActiveDocument: () => NotepadDocument | null;
  hasUnsavedChanges: (id: string) => boolean;
  getDocumentList: () => NotepadDocument[];
}

const MAX_VERSIONS = 10;
const AUTO_SAVE_DELAY = 2000; // 2 seconds

const initialState: NotepadState = {
  documents: {},
  activeDocumentId: null,
  versions: {},
  autoSaveEnabled: true,
  markdownPreview: false,
  unsavedChanges: new Set(),
};

export const useNotepadStore = create<NotepadStore>()(
  devtools(
    persist(
      (set, get) => {
        // Debounced auto-save function
        const debouncedAutoSave = performanceUtils.debounce((documentId: string) => {
          const state = get();
          const document = state.documents[documentId];
          if (document && state.autoSaveEnabled) {
            // Save version if significant changes
            const versions = state.versions[documentId] || [];
            const lastVersion = versions[versions.length - 1];
            
            if (!lastVersion || lastVersion.content !== document.content) {
              get().saveVersion(documentId);
            }
            
            // Mark as saved
            set((state) => ({
              unsavedChanges: new Set([...state.unsavedChanges].filter(id => id !== documentId))
            }));
          }
        }, AUTO_SAVE_DELAY);

        return {
          ...initialState,

          createDocument: (title = 'Untitled') => {
            const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date();
            
            const document: NotepadDocument = {
              id,
              title,
              content: '',
              lastModified: now,
              created: now,
              markdownMode: false,
            };

            set((state) => ({
              documents: {
                ...state.documents,
                [id]: document,
              },
              activeDocumentId: id,
              versions: {
                ...state.versions,
                [id]: [],
              },
            }));

            return id;
          },

          updateDocument: (id: string, updates: Partial<NotepadDocument>) => {
            set((state) => {
              const document = state.documents[id];
              if (!document) return state;

              const updatedDocument = {
                ...document,
                ...updates,
                lastModified: new Date(),
              };

              const newUnsavedChanges = new Set(state.unsavedChanges);
              newUnsavedChanges.add(id);

              return {
                documents: {
                  ...state.documents,
                  [id]: updatedDocument,
                },
                unsavedChanges: newUnsavedChanges,
              };
            });

            // Trigger auto-save only for content changes
            if (updates.content !== undefined) {
              debouncedAutoSave(id);
            }
          },

          deleteDocument: (id: string) => {
            set((state) => {
              const { [id]: deletedDoc, ...remainingDocs } = state.documents;
              const { [id]: deletedVersions, ...remainingVersions } = state.versions;
              const newUnsavedChanges = new Set(state.unsavedChanges);
              newUnsavedChanges.delete(id);

              return {
                documents: remainingDocs,
                versions: remainingVersions,
                activeDocumentId: state.activeDocumentId === id ? null : state.activeDocumentId,
                unsavedChanges: newUnsavedChanges,
              };
            });
          },

          setActiveDocument: (id: string | null) => {
            set({ activeDocumentId: id });
          },

          toggleMarkdownMode: (id: string) => {
            set((state) => {
              const document = state.documents[id];
              if (!document) return state;

              return {
                documents: {
                  ...state.documents,
                  [id]: {
                    ...document,
                    markdownMode: !document.markdownMode,
                    lastModified: new Date(),
                  },
                },
              };
            });
          },

          toggleMarkdownPreview: () => {
            set((state) => ({
              markdownPreview: !state.markdownPreview,
            }));
          },

          setAutoSave: (enabled: boolean) => {
            set({ autoSaveEnabled: enabled });
          },

          saveVersion: (documentId: string) => {
            set((state) => {
              const document = state.documents[documentId];
              if (!document) return state;

              const existingVersions = state.versions[documentId] || [];
              const version: NotepadVersion = {
                id: `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content: document.content,
                timestamp: new Date(),
                title: document.title,
              };

              // Keep only the last MAX_VERSIONS versions
              const newVersions = [...existingVersions, version].slice(-MAX_VERSIONS);

              return {
                versions: {
                  ...state.versions,
                  [documentId]: newVersions,
                },
              };
            });
          },

          restoreVersion: (documentId: string, versionId: string) => {
            const state = get();
            const versions = state.versions[documentId] || [];
            const version = versions.find(v => v.id === versionId);
            
            if (version && state.documents[documentId]) {
              get().updateDocument(documentId, {
                content: version.content,
                title: version.title,
              });
            }
          },

          getVersions: (documentId: string) => {
            const state = get();
            const versions = state.versions[documentId] || [];
            // Ensure timestamps are Date objects
            return versions.map(version => ({
              ...version,
              timestamp: typeof version.timestamp === 'string' ? new Date(version.timestamp) : version.timestamp
            }));
          },

          exportDocument: (id: string, format: 'txt' | 'md') => {
            const state = get();
            const document = state.documents[id];
            if (!document) return '';

            // For markdown format, ensure proper extension and formatting
            if (format === 'md' && document.markdownMode) {
              return document.content;
            }
            
            // For plain text, strip markdown if needed
            return document.content;
          },

          importDocument: (content: string, title: string, format: 'txt' | 'md') => {
            const id = get().createDocument(title);
            get().updateDocument(id, {
              content,
              markdownMode: format === 'md',
            });
            return id;
          },

          getActiveDocument: () => {
            const state = get();
            const doc = state.activeDocumentId ? state.documents[state.activeDocumentId] || null : null;
            if (doc) {
              // Ensure dates are Date objects
              if (typeof doc.lastModified === 'string') {
                doc.lastModified = new Date(doc.lastModified);
              }
              if (typeof doc.created === 'string') {
                doc.created = new Date(doc.created);
              }
            }
            return doc;
          },

          hasUnsavedChanges: (id: string) => {
            const state = get();
            return state.unsavedChanges.has(id);
          },

          getDocumentList: () => {
            const state = get();
            return Object.values(state.documents).sort((a, b) => {
              // Ensure dates are Date objects and handle invalid dates
              const getTime = (date: any) => {
                if (date instanceof Date) return date.getTime();
                if (typeof date === 'string') {
                  const parsed = new Date(date);
                  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
                }
                return 0;
              };

              return getTime(b.lastModified) - getTime(a.lastModified);
            });
          },
        };
      },
      {
        name: 'notepad-store',
      }
    )
  )
);