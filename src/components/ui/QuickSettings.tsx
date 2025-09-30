import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Monitor,
  Volume2,
  VolumeX,
  Zap,
  Wind,
  Sparkles,
  Gauge,
  X,
} from 'lucide-react';
import { usePreferencesStore } from '../../store/preferencesStore';

interface QuickSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSettings: React.FC<QuickSettingsProps> = ({ isOpen, onClose }) => {
  const {
    theme,
    setTheme,
    sounds,
    setSounds,
    reduceMotion,
    setReduceMotion,
    enableBlur,
    setEnableBlur,
    imageQuality,
    setImageQuality,
    applyPerformanceProfile,
  } = usePreferencesStore();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
            onClick={handleBackdropClick}
          />

          {/* Quick Settings Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed right-4 bottom-14 w-80 rounded-2xl shadow-2xl overflow-hidden z-[9999] ${
              isDark
                ? 'bg-gray-800/95 border border-gray-700'
                : 'bg-white/95 border border-gray-200'
            } backdrop-blur-xl`}
          >
            {/* Header */}
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Quick Settings
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className={`p-1 rounded-lg hover:bg-opacity-10 ${
                    isDark ? 'hover:bg-white text-gray-400' : 'hover:bg-black text-gray-600'
                  }`}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Theme Selector */}
              <div>
                <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <ThemeButton
                    icon={<Sun className="w-4 h-4" />}
                    label="Light"
                    active={theme === 'light'}
                    onClick={() => setTheme('light')}
                    isDark={isDark}
                  />
                  <ThemeButton
                    icon={<Moon className="w-4 h-4" />}
                    label="Dark"
                    active={theme === 'dark'}
                    onClick={() => setTheme('dark')}
                    isDark={isDark}
                  />
                  <ThemeButton
                    icon={<Monitor className="w-4 h-4" />}
                    label="Auto"
                    active={theme === 'auto'}
                    onClick={() => setTheme('auto')}
                    isDark={isDark}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

              {/* Toggle Settings */}
              <div className="space-y-3">
                <SettingToggle
                  icon={sounds ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  label="System Sounds"
                  description="Play sounds for actions"
                  enabled={sounds}
                  onChange={setSounds}
                  isDark={isDark}
                />

                <SettingToggle
                  icon={<Wind className="w-5 h-5" />}
                  label="Reduce Motion"
                  description="Minimize animations"
                  enabled={reduceMotion}
                  onChange={setReduceMotion}
                  isDark={isDark}
                />

                <SettingToggle
                  icon={<Sparkles className="w-5 h-5" />}
                  label="Blur Effects"
                  description="Enable glass effects"
                  enabled={enableBlur}
                  onChange={setEnableBlur}
                  isDark={isDark}
                />
              </div>

              {/* Divider */}
              <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

              {/* Performance Mode */}
              <div>
                <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Performance Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <PerformanceButton
                    icon={<Gauge className="w-4 h-4" />}
                    label="Balanced"
                    onClick={() => applyPerformanceProfile('balanced')}
                    isDark={isDark}
                  />
                  <PerformanceButton
                    icon={<Wind className="w-4 h-4" />}
                    label="Performance"
                    onClick={() => applyPerformanceProfile('high')}
                    isDark={isDark}
                  />
                  <PerformanceButton
                    icon={<Zap className="w-4 h-4" />}
                    label="Power Saver"
                    onClick={() => applyPerformanceProfile('low')}
                    isDark={isDark}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

              {/* Image Quality */}
              <div>
                <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Image Quality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <QualityButton
                    label="Low"
                    active={imageQuality === 'low'}
                    onClick={() => setImageQuality('low')}
                    isDark={isDark}
                  />
                  <QualityButton
                    label="Medium"
                    active={imageQuality === 'medium'}
                    onClick={() => setImageQuality('medium')}
                    isDark={isDark}
                  />
                  <QualityButton
                    label="High"
                    active={imageQuality === 'high'}
                    onClick={() => setImageQuality('high')}
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>

            {/* Footer Hint */}
            <div className={`px-4 py-2 text-center border-t ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Press <kbd className={`px-1 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>Esc</kbd> to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Theme Button Component
interface ThemeButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  isDark: boolean;
}

const ThemeButton: React.FC<ThemeButtonProps> = ({ icon, label, active, onClick, isDark }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
      active
        ? isDark
          ? 'bg-blue-600 text-white'
          : 'bg-blue-500 text-white'
        : isDark
        ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </motion.button>
);

// Setting Toggle Component
interface SettingToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  isDark: boolean;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  icon,
  label,
  description,
  enabled,
  onChange,
  isDark,
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 flex-1">
      <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{icon}</div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {label}
        </p>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
    </div>
    <motion.button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled
          ? 'bg-blue-600'
          : isDark
          ? 'bg-gray-700'
          : 'bg-gray-300'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  </div>
);

// Performance Button Component
interface PerformanceButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isDark: boolean;
}

const PerformanceButton: React.FC<PerformanceButtonProps> = ({ icon, label, onClick, isDark }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
      isDark
        ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </motion.button>
);

// Quality Button Component
interface QualityButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  isDark: boolean;
}

const QualityButton: React.FC<QualityButtonProps> = ({ label, active, onClick, isDark }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`p-2 rounded-lg text-xs font-medium transition-all ${
      active
        ? isDark
          ? 'bg-blue-600 text-white'
          : 'bg-blue-500 text-white'
        : isDark
        ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {label}
  </motion.button>
);
