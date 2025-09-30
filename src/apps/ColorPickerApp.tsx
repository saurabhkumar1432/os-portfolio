import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RefreshCw, Palette } from 'lucide-react';

interface ColorFormat {
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
}

interface SavedColor {
  id: string;
  hex: string;
  timestamp: number;
}

export const ColorPickerApp: React.FC = () => {
  const [currentColor, setCurrentColor] = useState('#3B82F6');
  const [colorFormats, setColorFormats] = useState<ColorFormat>({
    hex: '#3B82F6',
    rgb: 'rgb(59, 130, 246)',
    hsl: 'hsl(217, 91%, 60%)',
    hsv: 'hsv(217, 76%, 96%)',
  });
  const [savedColors, setSavedColors] = useState<SavedColor[]>([]);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // Convert RGB to HSV
  const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  };

  // Update all color formats
  const updateColorFormats = (hex: string) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

    setColorFormats({
      hex: hex.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    });
  };

  // Handle color change
  const handleColorChange = (hex: string) => {
    setCurrentColor(hex);
    updateColorFormats(hex);
  };

  // Copy color to clipboard
  const handleCopy = async (format: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Save color to palette
  const handleSaveColor = () => {
    const newColor: SavedColor = {
      id: Date.now().toString(),
      hex: currentColor,
      timestamp: Date.now(),
    };
    setSavedColors((prev) => [newColor, ...prev].slice(0, 20)); // Keep last 20 colors
  };

  // Remove saved color
  const handleRemoveColor = (id: string) => {
    setSavedColors((prev) => prev.filter((c) => c.id !== id));
  };

  // Generate random color
  const handleRandomColor = () => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    handleColorChange(randomHex);
  };

  // Initialize canvas with gradient
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw color gradient
    const width = canvas.width;
    const height = canvas.height;

    // Horizontal gradient (white to color)
    const horizontalGradient = ctx.createLinearGradient(0, 0, width, 0);
    horizontalGradient.addColorStop(0, '#FFFFFF');
    horizontalGradient.addColorStop(1, currentColor);
    ctx.fillStyle = horizontalGradient;
    ctx.fillRect(0, 0, width, height);

    // Vertical gradient (transparent to black)
    const verticalGradient = ctx.createLinearGradient(0, 0, 0, height);
    verticalGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    verticalGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = verticalGradient;
    ctx.fillRect(0, 0, width, height);
  }, [currentColor]);

  // Handle canvas click to pick color
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b] = imageData.data;

    const hex = '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
    handleColorChange(hex);
  };

  const colorFormatsArray = [
    { label: 'HEX', key: 'hex' as const, value: colorFormats.hex },
    { label: 'RGB', key: 'rgb' as const, value: colorFormats.rgb },
    { label: 'HSL', key: 'hsl' as const, value: colorFormats.hsl },
    { label: 'HSV', key: 'hsv' as const, value: colorFormats.hsv },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Current Color Preview */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-6">
          {/* Color Preview */}
          <motion.div
            className="w-32 h-32 rounded-xl shadow-lg border-4 border-white dark:border-gray-700"
            style={{ backgroundColor: currentColor }}
            animate={{ backgroundColor: currentColor }}
            transition={{ duration: 0.3 }}
          />

          {/* Color Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Current Color
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleSaveColor}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Palette className="w-4 h-4" />
                Save Color
              </button>
              <button
                onClick={handleRandomColor}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Random
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Color Picker Canvas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Color Selector
          </h3>
          <div className="space-y-4">
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              onClick={handleCanvasClick}
              role="img"
              aria-label="Color selector canvas - click to pick a color"
              className="w-full h-[300px] rounded-lg cursor-crosshair border-2 border-gray-200 dark:border-gray-700"
            />

            {/* Hue Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hue
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={rgbToHsl(
                  hexToRgb(currentColor).r,
                  hexToRgb(currentColor).g,
                  hexToRgb(currentColor).b
                ).h}
                onChange={(e) => {
                  const hue = parseInt(e.target.value);
                  const hsl = `hsl(${hue}, 100%, 50%)`;
                  const temp = document.createElement('div');
                  temp.style.color = hsl;
                  document.body.appendChild(temp);
                  const computed = window.getComputedStyle(temp).color;
                  document.body.removeChild(temp);
                  
                  const match = computed.match(/\d+/g);
                  if (match) {
                    const [r, g, b] = match.map(Number);
                    const hex = '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
                    handleColorChange(hex);
                  }
                }}
                className="w-full h-8 rounded-lg"
                style={{
                  background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                }}
              />
            </div>

            {/* Direct Hex Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hex Color
              </label>
              <input
                type="text"
                value={currentColor}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                    if (value.length === 7) {
                      handleColorChange(value);
                    } else {
                      setCurrentColor(value);
                    }
                  }
                }}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono"
                placeholder="#3B82F6"
              />
            </div>
          </div>
        </div>

        {/* Color Formats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Color Formats
          </h3>
          <div className="space-y-3">
            {colorFormatsArray.map(({ label, key, value }) => (
              <div
                key={key}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">
                  {label}
                </span>
                <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm font-mono text-gray-900 dark:text-white">
                  {value}
                </code>
                <button
                  onClick={() => handleCopy(key, value)}
                  aria-label={`Copy ${label} color format`}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedFormat === key ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Colors Palette */}
        {savedColors.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Saved Colors ({savedColors.length})
            </h3>
            <div className="grid grid-cols-10 gap-2">
              {savedColors.map((color) => (
                <motion.button
                  key={color.id}
                  onClick={() => handleColorChange(color.hex)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleRemoveColor(color.id);
                  }}
                  className="w-full aspect-square rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
                  style={{ backgroundColor: color.hex }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={`${color.hex} - Click to use, Right-click to remove`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPickerApp;
