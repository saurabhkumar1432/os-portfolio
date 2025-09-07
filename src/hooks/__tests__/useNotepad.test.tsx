import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useNotepad } from '../useNotepad';
import { useNotepadStore } from '../../store/notepadStore';

// Mock the notepad store
vi.mock('../../store/notepadStore');

const mockUseNotepadStore = vi.mocked(useNotepadStore);

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock URL.createObjectURL and related APIs
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('useNotepad', () => {
  const mockOnUnsavedStateChange = vi.fn();
  const mockStore = {
    documents: {},
    activeDocumentId: null,
    versions: {},
    autoSaveEnabled: true,
    markdownPreview: false,
    unsavedChanges: new Set<string>(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
    setActiveDocument: vi.fn(),
    toggleMarkdownMode: vi.fn(),
    toggleMarkdownPreview: vi.fn(),
    setAutoSave: vi.fn(),
    saveVersion: vi.fn(),
    restoreVersion: vi.fn(),
    getVersions: vi.fn(),
    exportDocument: vi.fn(),
    importDocument: vi.fn(),
    getActiveDocument: vi.fn(),
    hasUnsavedChanges: vi.fn(),
    getDocumentList: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNotepadStore.mockReturnValue(mockStore);
  });

  it('should initialize with store state', () => {
    const mockDocument = {
      id: 'doc-1',
      title: 'Test Document',
      content: 'Test content',
      lastModified: new Date(),
      created: new Date(),
      markdownMode: false,
    };

    mockStore.getActiveDocument.mockReturnValue(mockDocument);
    mockStore.getDocumentList.mockReturnValue([mockDocument]);

    const { result } = renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    expect(result.current.activeDocument).toBe(mockDocument);
    expect(result.current.documents).toEqual([mockDocument]);
    expect(result.current.markdownPreview).toBe(false);
    expect(result.current.autoSaveEnabled).toBe(true);
  });

  it('should create welcome document when no documents exist', () => {
    mockStore.getActiveDocument.mockReturnValue(null);
    mockStore.documents = {};
    mockStore.activeDocumentId = 'new-doc';
    mockStore.createDocument.mockReturnValue('new-doc');

    renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    expect(mockStore.createDocument).toHaveBeenCalledWith('Welcome Note');
    expect(mockStore.updateDocument).toHaveBeenCalledWith('new-doc', {
      content: expect.stringContaining('# Welcome to Notepad'),
      markdownMode: true,
    });
  });

  it('should handle content changes', () => {
    const mockDocument = {
      id: 'doc-1',
      title: 'Test Document',
      content: 'Test content',
      lastModified: new Date(),
      created: new Date(),
      markdownMode: false,
    };

    mockStore.getActiveDocument.mockReturnValue(mockDocument);

    const { result } = renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    act(() => {
      result.current.handleContentChange('New content');
    });

    expect(mockStore.updateDocument).toHaveBeenCalledWith('doc-1', {
      content: 'New content',
    });
  });

  it('should handle title changes', () => {
    const mockDocument = {
      id: 'doc-1',
      title: 'Test Document',
      content: 'Test content',
      lastModified: new Date(),
      created: new Date(),
      markdownMode: false,
    };

    mockStore.getActiveDocument.mockReturnValue(mockDocument);

    const { result } = renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    act(() => {
      result.current.handleTitleChange('New Title');
    });

    expect(mockStore.updateDocument).toHaveBeenCalledWith('doc-1', {
      title: 'New Title',
    });
  });

  it('should notify about unsaved state changes', () => {
    const mockDocument = {
      id: 'doc-1',
      title: 'Test Document',
      content: 'Test content',
      lastModified: new Date(),
      created: new Date(),
      markdownMode: false,
    };

    mockStore.getActiveDocument.mockReturnValue(mockDocument);
    mockStore.hasUnsavedChanges.mockReturnValue(true);

    renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    expect(mockOnUnsavedStateChange).toHaveBeenCalledWith(true);
  });

  it('should handle keyboard shortcuts', () => {
    const mockDocument = {
      id: 'doc-1',
      title: 'Test Document',
      content: 'Test content',
      lastModified: new Date(),
      created: new Date(),
      markdownMode: false,
    };

    mockStore.getActiveDocument.mockReturnValue(mockDocument);

    const { result } = renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    // Test Ctrl+S (save version)
    const saveEvent = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    }) as any;
    saveEvent.preventDefault = vi.fn();

    act(() => {
      result.current.handleKeyDown(saveEvent);
    });

    expect(saveEvent.preventDefault).toHaveBeenCalled();
    expect(mockStore.saveVersion).toHaveBeenCalledWith('doc-1');

    // Test Ctrl+N (new document)
    const newEvent = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
    }) as any;
    newEvent.preventDefault = vi.fn();

    act(() => {
      result.current.handleKeyDown(newEvent);
    });

    expect(newEvent.preventDefault).toHaveBeenCalled();
    expect(mockStore.createDocument).toHaveBeenCalled();

    // Test Ctrl+M (toggle markdown)
    const markdownEvent = new KeyboardEvent('keydown', {
      key: 'm',
      ctrlKey: true,
    }) as any;
    markdownEvent.preventDefault = vi.fn();

    act(() => {
      result.current.handleKeyDown(markdownEvent);
    });

    expect(markdownEvent.preventDefault).toHaveBeenCalled();
    expect(mockStore.toggleMarkdownMode).toHaveBeenCalledWith('doc-1');

    // Test Ctrl+P (toggle preview)
    const previewEvent = new KeyboardEvent('keydown', {
      key: 'p',
      ctrlKey: true,
    }) as any;
    previewEvent.preventDefault = vi.fn();

    act(() => {
      result.current.handleKeyDown(previewEvent);
    });

    expect(previewEvent.preventDefault).toHaveBeenCalled();
    expect(mockStore.toggleMarkdownPreview).toHaveBeenCalled();
  });

  it('should handle tab insertion in textarea', () => {
    const mockDocument = {
      id: 'doc-1',
      title: 'Test Document',
      content: 'Line 1\nLine 2',
      lastModified: new Date(),
      created: new Date(),
      markdownMode: false,
    };

    mockStore.getActiveDocument.mockReturnValue(mockDocument);

    const { result } = renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    // Mock textarea ref
    const mockTextarea = {
      selectionStart: 5,
      selectionEnd: 5,
    };
    result.current.textareaRef.current = mockTextarea as any;

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
    }) as any;
    tabEvent.preventDefault = vi.fn();

    act(() => {
      result.current.handleKeyDown(tabEvent);
    });

    expect(tabEvent.preventDefault).toHaveBeenCalled();
    expect(mockStore.updateDocument).toHaveBeenCalledWith('doc-1', {
      content: 'Line \t1\nLine 2',
    });
  });

  it('should export document to clipboard', async () => {
    const mockDocument = {
      id: 'doc-1',
      title: 'Test Document',
      content: 'Test content',
      lastModified: new Date(),
      created: new Date(),
      markdownMode: false,
    };

    mockStore.getActiveDocument.mockReturnValue(mockDocument);
    mockStore.exportDocument.mockReturnValue('Test content');

    const { result } = renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    const success = await act(async () => {
      return await result.current.exportDocument('clipboard');
    });

    expect(success).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test content');
  });

  it('should export document as file download', async () => {
    const mockDocument = {
      id: 'doc-1',
      title: 'Test Document',
      content: 'Test content',
      lastModified: new Date(),
      created: new Date(),
      markdownMode: false,
    };

    mockStore.getActiveDocument.mockReturnValue(mockDocument);
    mockStore.exportDocument.mockReturnValue('Test content');

    // Mock DOM methods
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);
    global.Blob = vi.fn().mockImplementation(() => new Blob(['Test content'], { type: 'text/plain' }));

    const { result } = renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    const success = await act(async () => {
      return await result.current.exportDocument('txt');
    });

    expect(success).toBe(true);
    expect(mockStore.exportDocument).toHaveBeenCalledWith('doc-1', 'txt');
  });

  it('should import document from file', async () => {
    mockStore.importDocument.mockReturnValue('new-doc-id');

    const { result } = renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: 'File content',
    };
    
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    const mockFile = new File(['File content'], 'test.md', { type: 'text/plain' });

    const importPromise = act(async () => {
      return result.current.importDocument(mockFile);
    });

    // Simulate successful file read
    act(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: { result: 'File content' } } as any);
      }
    });

    const documentId = await importPromise;

    expect(documentId).toBe('new-doc-id');
    expect(mockStore.importDocument).toHaveBeenCalledWith('File content', 'test', 'md');
    expect(mockStore.setActiveDocument).toHaveBeenCalledWith('new-doc-id');
  });

  it('should handle import errors', async () => {
    const { result } = renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    // Mock FileReader to simulate error
    const mockFileReader = {
      readAsText: vi.fn(),
      onerror: null as any,
      onload: null as any,
    };
    
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    const mockFile = new File([''], 'test.txt', { type: 'text/plain' });

    const importPromise = act(async () => {
      return result.current.importDocument(mockFile);
    });

    // Simulate error
    act(() => {
      if (mockFileReader.onerror) {
        mockFileReader.onerror(new Event('error'));
      }
    });

    await expect(importPromise).rejects.toThrow('Failed to read file');
  });

  it('should get versions for active document', () => {
    const mockDocument = {
      id: 'doc-1',
      title: 'Test Document',
      content: 'Test content',
      lastModified: new Date(),
      created: new Date(),
      markdownMode: false,
    };

    const mockVersions = [
      {
        id: 'version-1',
        content: 'Old content',
        timestamp: new Date(),
        title: 'Old Title',
      },
    ];

    mockStore.getActiveDocument.mockReturnValue(mockDocument);
    mockStore.getVersions.mockReturnValue(mockVersions);

    const { result } = renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    const versions = result.current.getVersions();

    expect(versions).toBe(mockVersions);
    expect(mockStore.getVersions).toHaveBeenCalledWith('doc-1');
  });

  it('should return empty versions when no active document', () => {
    mockStore.getActiveDocument.mockReturnValue(null);

    const { result } = renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    const versions = result.current.getVersions();

    expect(versions).toEqual([]);
  });

  it('should check unsaved changes for active document', () => {
    const mockDocument = {
      id: 'doc-1',
      title: 'Test Document',
      content: 'Test content',
      lastModified: new Date(),
      created: new Date(),
      markdownMode: false,
    };

    mockStore.getActiveDocument.mockReturnValue(mockDocument);
    mockStore.hasUnsavedChanges.mockReturnValue(true);

    const { result } = renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    const hasUnsaved = result.current.hasUnsavedChanges();

    expect(hasUnsaved).toBe(true);
    expect(mockStore.hasUnsavedChanges).toHaveBeenCalledWith('doc-1');
  });

  it('should check unsaved changes for specific document', () => {
    mockStore.hasUnsavedChanges.mockReturnValue(false);

    const { result } = renderHook(() =>
      useNotepad({
        windowId: 'window-1',
        onUnsavedStateChange: mockOnUnsavedStateChange,
      })
    );

    const hasUnsaved = result.current.hasUnsavedChanges('doc-2');

    expect(hasUnsaved).toBe(false);
    expect(mockStore.hasUnsavedChanges).toHaveBeenCalledWith('doc-2');
  });
});