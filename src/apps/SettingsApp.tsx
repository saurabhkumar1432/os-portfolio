import React, { useState } from 'react';
import { 
  Settings, 
  Palette, 
  Monitor, 
  Accessibility, 
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';
import type { AppProps } from '../types';
import { usePreferencesStore } from '../store/preferencesStore';
import { wallpapers, type WallpaperOption } from '../assets/wallpapers';

type SettingsSection = 'appearance' | 'performance' | 'accessibility';

interface SettingsSectionConfig {
  id: SettingsSection;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

const settingsSections: SettingsSectionConfig[] = [
  {
    id: 'appearance',
    title: 'Appearance',
    icon: Palette,
    description: 'Themes, wallpapers, and visual preferences',
  },
  {
    id: 'performance',
    title: 'Performance',
    icon: Zap,
    description: 'Optimize for speed and responsiveness',
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    icon: Accessibility,
    description: 'Make the interface more accessible',
  },
];

const SettingsApp: React.FC<AppProps> = ({ windowId: _windowId, focused: _focused, onTitleChange }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const {
    theme,
    accentColor,
    wallpaper,
    iconSize,
    sounds,
    reduceMotion,
    enableAnimations,
    enableBlur,
    maxConcurrentWindows,
    imageQuality,
    highContrast,
    largeText,
    screenReaderOptimized,
    keyboardNavigation,
    focusIndicators,
    setTheme,
    setAccentColor,
    setWallpaper,
    setIconSize,
    setSounds,
    setReduceMotion,
    setEnableAnimations,
    setEnableBlur,
    setMaxConcurrentWindows,
    setImageQuality,
    setHighContrast,
    setLargeText,
    setScreenReaderOptimized,
    setKeyboardNavigation,
    setFocusIndicators,
    applyPerformanceProfile,
  } = usePreferencesStore();

  React.useEffect(() => {
    onTitleChange('Settings');
  }, [onTitleChange]);

  const renderSidebar = () => (
    <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={20} className="text-blue-600 dark:text-blue-400" />
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
      </div>
      
      <nav className="space-y-2">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={18} />
              <div className="flex-1 min-w-0">
                <div className="font-medium">{section.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {section.description}
                </div>
              </div>
              {isActive && <ChevronRight size={16} />}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const renderThemeSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Theme
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'auto'] as const).map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => setTheme(themeOption)}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === themeOption
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <Monitor size={24} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                {themeOption}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {themeOption === 'auto' ? 'Follow system' : `${themeOption} mode`}
              </div>
              {theme === themeOption && (
                <div className="flex justify-center mt-2">
                  <Check size={16} className="text-blue-500" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Accent Color
        </h3>
        <div className="grid grid-cols-8 gap-2">
          {[
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
            '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
          ].map((color) => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                accentColor === color
                  ? 'border-gray-400 dark:border-gray-300 scale-110'
                  : 'border-gray-200 dark:border-gray-700 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select ${color} accent color`}
            >
              {accentColor === color && (
                <Check size={16} className="text-white mx-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Wallpaper
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {wallpapers.map((wallpaperOption: WallpaperOption) => (
            <button
              key={wallpaperOption.id}
              onClick={() => setWallpaper(wallpaperOption.id)}
              className={`relative aspect-video rounded-lg border-2 overflow-hidden transition-all ${
                wallpaper === wallpaperOption.id
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div
                className="w-full h-full"
                style={{ background: wallpaperOption.preview }}
              />
              <div className="absolute inset-0 bg-black/20 flex items-end p-2">
                <div className="text-xs font-medium text-white">
                  {wallpaperOption.name}
                </div>
              </div>
              {wallpaper === wallpaperOption.id && (
                <div className="absolute top-2 right-2">
                  <Check size={16} className="text-white bg-blue-500 rounded-full p-0.5" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Icon Size
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <button
              key={size}
              onClick={() => setIconSize(size)}
              className={`p-4 rounded-lg border-2 transition-all ${
                iconSize === size
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
              </div>
              {iconSize === size && (
                <div className="flex justify-center mt-2">
                  <Check size={16} className="text-blue-500" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Performance Profiles
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['low', 'balanced', 'high'] as const).map((profile) => (
            <button
              key={profile}
              onClick={() => applyPerformanceProfile(profile)}
              className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                {profile === 'low' ? 'Power Saver' : profile === 'balanced' ? 'Balanced' : 'High Performance'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {profile === 'low' 
                  ? 'Minimal effects, best battery' 
                  : profile === 'balanced' 
                  ? 'Good balance of features' 
                  : 'All effects enabled'
                }
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Animation Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Reduce Motion
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Minimize animations for better performance and accessibility
              </div>
            </div>
            <button
              onClick={() => setReduceMotion(!reduceMotion)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                reduceMotion ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  reduceMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Enable Animations
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Window transitions and UI animations
              </div>
            </div>
            <button
              onClick={() => setEnableAnimations(!enableAnimations)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableAnimations && !reduceMotion ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              disabled={reduceMotion}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableAnimations && !reduceMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Blur Effects
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Background blur and glass effects
              </div>
            </div>
            <button
              onClick={() => setEnableBlur(!enableBlur)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableBlur ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableBlur ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Sound Effects
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Enable audio feedback for interactions
              </div>
            </div>
            <button
              onClick={() => setSounds(!sounds)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                sounds ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  sounds ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Resource Limits
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Max Concurrent Windows
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {maxConcurrentWindows}
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              value={maxConcurrentWindows}
              onChange={(e) => setMaxConcurrentWindows(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>3</span>
              <span>15</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Image Quality
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((quality) => (
                <button
                  key={quality}
                  onClick={() => setImageQuality(quality)}
                  className={`p-2 rounded text-sm font-medium transition-colors ${
                    imageQuality === quality
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccessibilitySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Motion and Animation
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Reduce Motion
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Minimize animations and transitions for users with vestibular disorders
              </div>
            </div>
            <button
              onClick={() => setReduceMotion(!reduceMotion)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                reduceMotion ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  reduceMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Visual Accessibility
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                High Contrast Mode
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Increase contrast for better visibility
              </div>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                highContrast ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Large Text
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Increase text size for better readability
              </div>
            </div>
            <button
              onClick={() => setLargeText(!largeText)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                largeText ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  largeText ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Enhanced Focus Indicators
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                More visible focus outlines for keyboard navigation
              </div>
            </div>
            <button
              onClick={() => setFocusIndicators(!focusIndicators)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                focusIndicators ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  focusIndicators ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Navigation and Input
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Enhanced Keyboard Navigation
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Improved keyboard shortcuts and navigation
              </div>
            </div>
            <button
              onClick={() => setKeyboardNavigation(!keyboardNavigation)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                keyboardNavigation ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Screen Reader Optimization
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Optimize interface for screen readers
              </div>
            </div>
            <button
              onClick={() => setScreenReaderOptimized(!screenReaderOptimized)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                screenReaderOptimized ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  screenReaderOptimized ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Built-in Accessibility Features
        </div>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Automatic system preference detection (dark mode, reduced motion)</li>
          <li>• WCAG AA+ compliant color contrast ratios</li>
          <li>• Comprehensive ARIA labels and semantic markup</li>
          <li>• Full keyboard navigation support</li>
          <li>• Screen reader announcements for dynamic content</li>
          <li>• Scalable text up to 200% without loss of functionality</li>
        </ul>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return renderThemeSettings();
      case 'performance':
        return renderPerformanceSettings();
      case 'accessibility':
        return renderAccessibilitySettings();
      default:
        return renderThemeSettings();
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {renderSidebar()}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {settingsSections.find(s => s.id === activeSection)?.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {settingsSections.find(s => s.id === activeSection)?.description}
            </p>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;