import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Download, Copy, Crop, Square, Circle, Pencil, Type, Trash2, X } from 'lucide-react';

type CaptureMode = 'fullscreen' | 'window' | 'selection';
type ToolMode = 'select' | 'draw' | 'text' | 'crop';

interface Screenshot {
  id: string;
  dataUrl: string;
  timestamp: Date;
  mode: CaptureMode;
  name: string;
}

export const ScreenshotApp: React.FC = () => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [currentScreenshot, setCurrentScreenshot] = useState<Screenshot | null>(null);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('fullscreen');
  const [isCapturing, setIsCapturing] = useState(false);
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Capture screenshot using modern Screen Capture API or fallback
  const captureScreenshot = useCallback(async () => {
    setIsCapturing(true);
    try {
      // Try to use native screen capture API if available
      if ('mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: 'screen' } as MediaTrackConstraints,
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        await new Promise(resolve => {
          video.onloadedmetadata = resolve;
        });

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          
          const screenshot: Screenshot = {
            id: Date.now().toString(),
            dataUrl,
            timestamp: new Date(),
            mode: captureMode,
            name: `Screenshot-${Date.now()}`,
          };

          setScreenshots(prev => [screenshot, ...prev]);
          setCurrentScreenshot(screenshot);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      } else {
        throw new Error('Screen capture not supported');
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      alert('Failed to capture screenshot. This feature requires browser support for Screen Capture API.');
    } finally {
      setIsCapturing(false);
    }
  }, [captureMode]);

  // Download screenshot
  const downloadScreenshot = useCallback((screenshot: Screenshot) => {
    const link = document.createElement('a');
    link.download = `${screenshot.name}.png`;
    link.href = screenshot.dataUrl;
    link.click();
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (screenshot: Screenshot) => {
    try {
      const blob = await (await fetch(screenshot.dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      alert('Screenshot copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard.');
    }
  }, []);

  // Delete screenshot
  const deleteScreenshot = useCallback((id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
    if (currentScreenshot?.id === id) {
      setCurrentScreenshot(null);
    }
  }, [currentScreenshot]);

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Controls */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Capture Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Capture Mode
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setCaptureMode('fullscreen')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                captureMode === 'fullscreen'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Square className="w-4 h-4" />
              Full Screen
            </button>
            <button
              onClick={() => setCaptureMode('window')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                captureMode === 'window'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Crop className="w-4 h-4" />
              Window
            </button>
            <button
              onClick={() => setCaptureMode('selection')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                captureMode === 'selection'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Circle className="w-4 h-4" />
              Selection
            </button>
          </div>

          <motion.button
            onClick={captureScreenshot}
            disabled={isCapturing}
            aria-label="Capture screenshot"
            aria-busy={isCapturing}
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Camera className="w-5 h-5" />
            {isCapturing ? 'Capturing...' : 'Capture'}
          </motion.button>
        </div>

        {/* Annotation Tools */}
        {currentScreenshot && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Annotation Tools
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setToolMode('select')}
                className={`p-2 rounded text-sm flex items-center justify-center gap-1 ${
                  toolMode === 'select'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => setToolMode('draw')}
                className={`p-2 rounded text-sm flex items-center justify-center gap-1 ${
                  toolMode === 'draw'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setToolMode('text')}
                className={`p-2 rounded text-sm flex items-center justify-center gap-1 ${
                  toolMode === 'text'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Type className="w-4 h-4" />
              </button>
              <button
                onClick={() => setToolMode('crop')}
                className={`p-2 rounded text-sm flex items-center justify-center gap-1 ${
                  toolMode === 'crop'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Crop className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Screenshot History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Recent Screenshots ({screenshots.length})
          </h3>
          <div className="space-y-2">
            {screenshots.map((screenshot) => (
              <motion.div
                key={screenshot.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${
                  currentScreenshot?.id === screenshot.id
                    ? 'border-blue-500'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setCurrentScreenshot(screenshot)}
              >
                <img
                  src={screenshot.dataUrl}
                  alt={screenshot.name}
                  className="w-full h-20 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadScreenshot(screenshot);
                    }}
                    className="p-1.5 bg-white rounded hover:bg-gray-100"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(screenshot);
                    }}
                    className="p-1.5 bg-white rounded hover:bg-gray-100"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScreenshot(screenshot.id);
                    }}
                    className="p-1.5 bg-red-500 rounded hover:bg-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col">
        {currentScreenshot ? (
          <>
            {/* Preview Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div>
                <input
                  type="text"
                  value={currentScreenshot.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setScreenshots(prev =>
                      prev.map(s =>
                        s.id === currentScreenshot.id ? { ...s, name: newName } : s
                      )
                    );
                    setCurrentScreenshot(prev => prev ? { ...prev, name: newName } : null);
                  }}
                  className="text-lg font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white"
                />
                <p className="text-sm text-gray-500">
                  {currentScreenshot.timestamp.toLocaleString()} · {currentScreenshot.mode}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadScreenshot(currentScreenshot)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => copyToClipboard(currentScreenshot)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={() => setCurrentScreenshot(null)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Preview Canvas */}
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950 p-8 flex items-center justify-center">
              <div className="relative bg-white rounded-lg shadow-2xl">
                <img
                  src={currentScreenshot.dataUrl}
                  alt={currentScreenshot.name}
                  className="max-w-full max-h-full"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 pointer-events-none"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Screenshot Selected
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Capture a screenshot to get started
              </p>
              <motion.button
                onClick={captureScreenshot}
                disabled={isCapturing}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="w-5 h-5" />
                {isCapturing ? 'Capturing...' : 'Capture Screenshot'}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenshotApp;
