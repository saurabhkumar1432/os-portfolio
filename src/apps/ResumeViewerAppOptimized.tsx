import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
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
 * Optimized Resume Viewer with RAF rendering and proper cleanup
 */
const ResumeViewerAppOptimized: React.FC<AppProps> = ({ windowId: _windowId, focused: _focused, onTitleChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [pdfState, setPdfState] = useState<PDFViewerState>({
    document: null,
    currentPage: 1,
    totalPages: 0,
    scale: 1.2,
    rotation: 0,
    loading: true,
    error: null,
  });

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
      console.error('Failed to load PDF:', error);
      setPdfState(prev => ({
        ...prev,
        error: 'Failed to load resume. Please try again later.',
        loading: false,
      }));
    }
  }, [resumePath]);

  // Render current page with optimization
  const renderPage = useCallback(async () => {
    const { document, currentPage, scale, rotation } = pdfState;
    const canvas = canvasRef.current;

    if (!document || !canvas) return;

    try {
      // Cancel any ongoing render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      const page: PDFPageProxy = await document.getPage(currentPage);
      const viewport = page.getViewport({ scale, rotation });

      const context = canvas.getContext('2d', {
        alpha: false,
        willReadFrequently: false,
      });

      if (!context) return;

      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      renderTaskRef.current = page.render(renderContext);

      await renderTaskRef.current.promise;
      renderTaskRef.current = null;

      // Clean up page
      page.cleanup();
    } catch (error: any) {
      if (error.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', error);
      }
    }
  }, [pdfState]);

  // Load PDF on mount
  useEffect(() => {
    loadPDF();

    return () => {
      // Cleanup on unmount
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      if (pdfState.document) {
        pdfState.document.destroy();
      }
    };
  }, []);

  // Render page when state changes
  useEffect(() => {
    if (pdfState.document && !pdfState.loading) {
      renderPage();
    }
  }, [pdfState.currentPage, pdfState.scale, pdfState.rotation, pdfState.document, renderPage]);

  // Navigation handlers
  const goToPreviousPage = useCallback(() => {
    setPdfState(prev => ({
      ...prev,
      currentPage: Math.max(1, prev.currentPage - 1),
    }));
  }, []);

  const goToNextPage = useCallback(() => {
    setPdfState(prev => ({
      ...prev,
      currentPage: Math.min(prev.totalPages, prev.currentPage + 1),
    }));
  }, []);

  // Zoom handlers
  const zoomIn = useCallback(() => {
    setPdfState(prev => ({
      ...prev,
      scale: Math.min(3, prev.scale + 0.2),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setPdfState(prev => ({
      ...prev,
      scale: Math.max(0.5, prev.scale - 0.2),
    }));
  }, []);

  const rotate = useCallback(() => {
    setPdfState(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  }, []);

  // Download handler
  const downloadResume = useCallback(() => {
    const link = document.createElement('a');
    link.href = resumePath;
    link.download = 'Saurabh_Kumar_Resume.pdf';
    link.click();
  }, [resumePath]);

  // Open in new tab
  const openInNewTab = useCallback(() => {
    window.open(resumePath, '_blank');
  }, [resumePath]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPreviousPage();
      if (e.key === 'ArrowRight') goToNextPage();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === 'r' || e.key === 'R') rotate();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPreviousPage, goToNextPage, zoomIn, zoomOut, rotate]);

  const { currentPage, totalPages, scale, loading, error } = pdfState;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">Error Loading Resume</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={loadPDF}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous page (←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px] text-center">
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next page (→)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom out (-)"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom in (+)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <button
            onClick={rotate}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-2"
            title="Rotate (R)"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={downloadResume}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          
          <button
            onClick={openInNewTab}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div ref={containerRef} className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="shadow-2xl bg-white"
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      </div>
    </div>
  );
};

export default ResumeViewerAppOptimized;
