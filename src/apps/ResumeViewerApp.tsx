import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, Loader2, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { AppProps } from '../types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFViewerState {
  document: PDFDocumentProxy | null;
  currentPage: number;
  totalPages: number;
  scale: number;
  rotation: number;
  loading: boolean;
  error: string | null;
}

/**
 * Resume Viewer application component
 * Displays PDF resume with viewer controls, download, and external link functionality
 */
const ResumeViewerApp: React.FC<AppProps> = ({ windowId: _windowId, focused: _focused, onTitleChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfState, setPdfState] = useState<PDFViewerState>({
    document: null,
    currentPage: 1,
    totalPages: 0,
    scale: 1.0,
    rotation: 0,
    loading: true,
    error: null,
  });

  // Resume PDF path - in a real implementation, this would be configurable
  const resumePath = '/resume.pdf';

  useEffect(() => {
    onTitleChange('Resume Viewer');
  }, [onTitleChange]);

  // Load PDF document
  const loadPDF = useCallback(async () => {
    try {
      setPdfState(prev => ({ ...prev, loading: true, error: null }));
      
      const loadingTask = pdfjsLib.getDocument(resumePath);
      const pdf = await loadingTask.promise;
      
      setPdfState(prev => ({
        ...prev,
        document: pdf,
        totalPages: pdf.numPages,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading PDF:', error);
      setPdfState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load PDF',
      }));
    }
  }, [resumePath]);

  // Render PDF page
  const renderPage = useCallback(async (pageNumber: number) => {
    if (!pdfState.document || !canvasRef.current) return;

    try {
      const page = await pdfState.document.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      const viewport = page.getViewport({ 
        scale: pdfState.scale, 
        rotation: pdfState.rotation 
      });
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
      setPdfState(prev => ({
        ...prev,
        error: 'Failed to render PDF page',
      }));
    }
  }, [pdfState.document, pdfState.scale, pdfState.rotation]);

  // Load PDF on component mount
  useEffect(() => {
    loadPDF();
  }, [loadPDF]);

  // Re-render page when state changes
  useEffect(() => {
    if (pdfState.document && !pdfState.loading && !pdfState.error) {
      renderPage(pdfState.currentPage);
    }
  }, [pdfState.document, pdfState.currentPage, pdfState.scale, pdfState.rotation, pdfState.loading, pdfState.error, renderPage]);

  // Navigation handlers
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= pdfState.totalPages) {
      setPdfState(prev => ({ ...prev, currentPage: pageNumber }));
    }
  };

  const previousPage = () => goToPage(pdfState.currentPage - 1);
  const nextPage = () => goToPage(pdfState.currentPage + 1);

  // Zoom handlers
  const zoomIn = () => {
    setPdfState(prev => ({ 
      ...prev, 
      scale: Math.min(prev.scale * 1.2, 3.0) 
    }));
  };

  const zoomOut = () => {
    setPdfState(prev => ({ 
      ...prev, 
      scale: Math.max(prev.scale / 1.2, 0.5) 
    }));
  };

  const resetZoom = () => {
    setPdfState(prev => ({ ...prev, scale: 1.0 }));
  };

  // Rotation handler
  const rotate = () => {
    setPdfState(prev => ({ 
      ...prev, 
      rotation: (prev.rotation + 90) % 360 
    }));
  };

  // Download handler
  const downloadResume = () => {
    const link = document.createElement('a');
    link.href = resumePath;
    link.download = 'resume.pdf';
    link.click();
  };

  // Open in new tab handler
  const openInNewTab = () => {
    window.open(resumePath, '_blank');
  };

  // Retry loading
  const retryLoad = () => {
    loadPDF();
  };

  if (pdfState.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading resume...</p>
      </div>
    );
  }

  if (pdfState.error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-900">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Error Loading Resume
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
          {pdfState.error}
        </p>
        <div className="flex gap-2">
          <button
            onClick={retryLoad}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={downloadResume}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {/* Page Navigation */}
          <button
            onClick={previousPage}
            disabled={pdfState.currentPage <= 1}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
            {pdfState.currentPage} of {pdfState.totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={pdfState.currentPage >= pdfState.totalPages}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <button
            onClick={zoomOut}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetZoom}
            className="px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Reset Zoom"
          >
            {Math.round(pdfState.scale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Rotate */}
          <button
            onClick={rotate}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Actions */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
          
          <button
            onClick={downloadResume}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Download Resume"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={openInNewTab}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex justify-center">
          <div className="bg-white shadow-lg">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto"
              style={{
                display: pdfState.document ? 'block' : 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeViewerApp;