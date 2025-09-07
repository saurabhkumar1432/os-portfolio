import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  wallpaper: string;
  iconSize: 'sm' | 'md' | 'lg';
  
  // Performance
  sounds: boolean;
  reduceMotion: boolean;
  enableAnimations: boolean;
  enableBlur: boolean;
  maxConcurrentWindows: number;
  imageQuality: 'low' | 'medium' | 'high';
  
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  
  // Window management
  windowPositions?: Record<string, {
    bounds: { x: number; y: number; w: number; h: number };
    maximized: boolean;
    minimized: boolean;
  }>;
  
  // Recent apps
  recentApps?: string[];
}

interface PreferencesActions {
  // Appearance actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setAccentColor: (color: string) => void;
  setWallpaper: (wallpaper: string) => void;
  setIconSize: (size: 'sm' | 'md' | 'lg') => void;
  
  // Performance actions
  setSounds: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setEnableAnimations: (enabled: boolean) => void;
  setEnableBlur: (enabled: boolean) => void;
  setMaxConcurrentWindows: (max: number) => void;
  setImageQuality: (quality: 'low' | 'medium' | 'high') => void;
  
  // Accessibility actions
  setHighContrast: (enabled: boolean) => void;
  setLargeText: (enabled: boolean) => void;
  setScreenReaderOptimized: (enabled: boolean) => void;
  setKeyboardNavigation: (enabled: boolean) => void;
  setFocusIndicators: (enabled: boolean) => void;
  
  // Utility actions
  resetPreferences: () => void;
  applyPerformanceProfile: (profile: 'low' | 'balanced' | 'high') => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

type PreferencesStore = UserPreferences & PreferencesActions;

const defaultPreferences: UserPreferences = {
  // Appearance
  theme: 'auto',
  accentColor: '#3b82f6',
  wallpaper: 'default',
  iconSize: 'md',
  
  // Performance
  sounds: true,
  reduceMotion: false,
  enableAnimations: true,
  enableBlur: true,
  maxConcurrentWindows: 10,
  imageQuality: 'high',
  
  // Accessibility
  highContrast: false,
  largeText: false,
  screenReaderOptimized: false,
  keyboardNavigation: true,
  focusIndicators: true,
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      ...defaultPreferences,

      // Appearance actions
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setWallpaper: (wallpaper) => set({ wallpaper }),
      setIconSize: (iconSize) => set({ iconSize }),
      
      // Performance actions
      setSounds: (sounds) => set({ sounds }),
      setReduceMotion: (reduceMotion) => {
        set({ 
          reduceMotion,
          enableAnimations: reduceMotion ? false : get().enableAnimations 
        });
      },
      setEnableAnimations: (enableAnimations) => set({ enableAnimations }),
      setEnableBlur: (enableBlur) => set({ enableBlur }),
      setMaxConcurrentWindows: (maxConcurrentWindows) => set({ maxConcurrentWindows }),
      setImageQuality: (imageQuality) => set({ imageQuality }),
      
      // Accessibility actions
      setHighContrast: (highContrast) => set({ highContrast }),
      setLargeText: (largeText) => set({ largeText }),
      setScreenReaderOptimized: (screenReaderOptimized) => set({ screenReaderOptimized }),
      setKeyboardNavigation: (keyboardNavigation) => set({ keyboardNavigation }),
      setFocusIndicators: (focusIndicators) => set({ focusIndicators }),
      
      // Utility actions
      resetPreferences: () => set(defaultPreferences),
      updatePreferences: (preferences) => set(preferences),
      applyPerformanceProfile: (profile) => {
        switch (profile) {
          case 'low':
            set({
              enableAnimations: false,
              enableBlur: false,
              sounds: false,
              reduceMotion: true,
              maxConcurrentWindows: 3,
              imageQuality: 'low',
            });
            break;
          case 'balanced':
            set({
              enableAnimations: true,
              enableBlur: false,
              sounds: true,
              reduceMotion: false,
              maxConcurrentWindows: 6,
              imageQuality: 'medium',
            });
            break;
          case 'high':
            set({
              enableAnimations: true,
              enableBlur: true,
              sounds: true,
              reduceMotion: false,
              maxConcurrentWindows: 10,
              imageQuality: 'high',
            });
            break;
        }
      },
    }),
    {
      name: 'portfolio-os-preferences',
    }
  )
);
