import { create } from 'zustand';
import type { DesktopState } from '../types';

interface DesktopActions {
  updateIconPosition: (iconId: string, x: number, y: number) => void;
  updateMultipleIconPositions: (updates: Array<{ id: string; x: number; y: number }>) => void;
  selectIcon: (iconId: string, multiSelect?: boolean) => void;
  selectMultipleIcons: (iconIds: string[], replace?: boolean) => void;
  clearSelection: () => void;
  setWallpaper: (wallpaper: string) => void;
  setIconSize: (size: 'sm' | 'md' | 'lg') => void;
  showContextMenu: (x: number, y: number, target?: string) => void;
  hideContextMenu: () => void;
  createNewNote: () => void;
  createNewFolder: () => void;
  saveIconLayout: () => void;
  loadIconLayout: () => void;
  startDragSelection: (x: number, y: number) => void;
  updateDragSelection: (x: number, y: number) => void;
  endDragSelection: () => void;
}

type DesktopStore = DesktopState & DesktopActions;

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  // Initial state
  icons: [
    {
      id: 'projects',
      label: 'Projects',
      appId: 'projects',
      x: 50,
      y: 50,
      selected: false,
    },
    {
      id: 'file-explorer',
      label: 'File Explorer',
      appId: 'file-explorer',
      x: 50,
      y: 150,
      selected: false,
    },
    {
      id: 'terminal',
      label: 'Terminal',
      appId: 'terminal',
      x: 50,
      y: 250,
      selected: false,
    },
    {
      id: 'calculator',
      label: 'Calculator',
      appId: 'calculator',
      x: 50,
      y: 350,
      selected: false,
    },
    {
      id: 'clipboard',
      label: 'Clipboard',
      appId: 'clipboard',
      x: 50,
      y: 450,
      selected: false,
    },
    {
      id: 'screenshot',
      label: 'Screenshot',
      appId: 'screenshot',
      x: 50,
      y: 550,
      selected: false,
    },
    {
      id: 'task-manager',
      label: 'Task Manager',
      appId: 'task-manager',
      x: 200,
      y: 50,
      selected: false,
    },
    {
      id: 'color-picker',
      label: 'Color Picker',
      appId: 'color-picker',
      x: 200,
      y: 150,
      selected: false,
    },
  ],
  wallpaper: 'default',
  iconSize: 'md',
  contextMenu: null,
  dragSelection: null,

  // Actions
  updateIconPosition: (iconId: string, x: number, y: number) => {
    set((state) => ({
      icons: state.icons.map((icon) =>
        icon.id === iconId ? { ...icon, x, y } : icon
      ),
    }));
    // Auto-save layout after position update
    setTimeout(() => get().saveIconLayout(), 100);
  },

  updateMultipleIconPositions: (updates: Array<{ id: string; x: number; y: number }>) => {
    set((state) => ({
      icons: state.icons.map((icon) => {
        const update = updates.find(u => u.id === icon.id);
        return update ? { ...icon, x: update.x, y: update.y } : icon;
      }),
    }));
    // Auto-save layout after position updates
    setTimeout(() => get().saveIconLayout(), 100);
  },

  selectIcon: (iconId: string, multiSelect = false) => {
    set((state) => ({
      icons: state.icons.map((icon) => ({
        ...icon,
        selected: multiSelect
          ? icon.id === iconId
            ? !icon.selected
            : icon.selected
          : icon.id === iconId,
      })),
    }));
  },

  selectMultipleIcons: (iconIds: string[], replace = true) => {
    set((state) => ({
      icons: state.icons.map((icon) => ({
        ...icon,
        selected: replace 
          ? iconIds.includes(icon.id)
          : icon.selected || iconIds.includes(icon.id),
      })),
    }));
  },

  clearSelection: () => {
    set((state) => ({
      icons: state.icons.map((icon) => ({ ...icon, selected: false })),
    }));
  },

  setWallpaper: (wallpaper: string) => {
    set({ wallpaper });
  },

  setIconSize: (iconSize: 'sm' | 'md' | 'lg') => {
    set({ iconSize });
  },

  showContextMenu: (x: number, y: number, target?: string) => {
    // Import wallpapers and stores synchronously
    const wallpapers = [
      { id: 'default', name: 'Default Blue' },
      { id: 'ocean', name: 'Ocean Breeze' },
      { id: 'sunset', name: 'Sunset' },
      { id: 'forest', name: 'Forest' },
      { id: 'purple', name: 'Purple Dream' },
      { id: 'dark', name: 'Dark Space' },
    ];
    
    const contextMenuItems = [
      {
        id: 'view',
        label: 'View',
        icon: '👁️',
        action: () => {},
        children: [
          {
            id: 'icon-size-sm',
            label: 'Small icons',
            action: () => {
              get().setIconSize('sm');
              get().hideContextMenu();
            },
          },
          {
            id: 'icon-size-md',
            label: 'Medium icons',
            action: () => {
              get().setIconSize('md');
              get().hideContextMenu();
            },
          },
          {
            id: 'icon-size-lg',
            label: 'Large icons',
            action: () => {
              get().setIconSize('lg');
              get().hideContextMenu();
            },
          },
        ],
      },
      {
        id: 'new',
        label: 'New',
        icon: '➕',
        action: () => {},
        children: [
          {
            id: 'new-note',
            label: 'Note',
            icon: '📝',
            action: () => get().createNewNote(),
          },
          {
            id: 'new-folder',
            label: 'Folder',
            icon: '📁',
            action: () => get().createNewFolder(),
          },
        ],
      },
      { id: 'separator-1', separator: true },
      {
        id: 'wallpaper',
        label: 'Wallpaper',
        icon: '🖼️',
        action: () => {},
        children: wallpapers.map(wallpaper => ({
          id: `wallpaper-${wallpaper.id}`,
          label: wallpaper.name,
          action: () => {
            const { usePreferencesStore } = require('./preferencesStore');
            usePreferencesStore.getState().setWallpaper(wallpaper.id);
            get().hideContextMenu();
          },
        })),
      },
      {
        id: 'theme',
        label: 'Theme',
        icon: '🎨',
        action: () => {},
        children: [
          {
            id: 'theme-light',
            label: 'Light',
            action: () => {
              const { usePreferencesStore } = require('./preferencesStore');
              usePreferencesStore.getState().setTheme('light');
              get().hideContextMenu();
            },
          },
          {
            id: 'theme-dark',
            label: 'Dark',
            action: () => {
              const { usePreferencesStore } = require('./preferencesStore');
              usePreferencesStore.getState().setTheme('dark');
              get().hideContextMenu();
            },
          },
          {
            id: 'theme-auto',
            label: 'Auto',
            action: () => {
              const { usePreferencesStore } = require('./preferencesStore');
              usePreferencesStore.getState().setTheme('auto');
              get().hideContextMenu();
            },
          },
        ],
      },
      { id: 'separator-2', separator: true },
      {
        id: 'settings',
        label: 'Settings',
        icon: '⚙️',
        action: () => {
          const { useWindowStore } = require('./windowStore');
          useWindowStore.getState().createWindow('settings');
          get().hideContextMenu();
        },
      },
    ];

    set({
      contextMenu: {
        x,
        y,
        items: contextMenuItems,
        target,
      },
    });
  },

  hideContextMenu: () => {
    set({ contextMenu: null });
  },

  createNewNote: () => {
    const { useWindowStore } = require('../store/windowStore');
    useWindowStore.getState().createWindow('notepad');
    get().hideContextMenu();
  },

  createNewFolder: () => {
    // For now, just hide the context menu
    // This could be expanded to create virtual folders in the file system
    get().hideContextMenu();
  },

  saveIconLayout: () => {
    const { icons } = get();
    const layout = icons.map(icon => ({
      id: icon.id,
      x: icon.x,
      y: icon.y,
    }));
    localStorage.setItem('desktop-icon-layout', JSON.stringify(layout));
  },

  loadIconLayout: () => {
    try {
      const saved = localStorage.getItem('desktop-icon-layout');
      if (saved) {
        const layout = JSON.parse(saved);
        set((state) => ({
          icons: state.icons.map((icon) => {
            const savedPosition = layout.find((l: any) => l.id === icon.id);
            return savedPosition 
              ? { ...icon, x: savedPosition.x, y: savedPosition.y }
              : icon;
          }),
        }));
      }
    } catch (error) {
      console.warn('Failed to load icon layout:', error);
    }
  },

  startDragSelection: (x: number, y: number) => {
    set({
      dragSelection: {
        active: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
      },
    });
  },

  updateDragSelection: (x: number, y: number) => {
    set((state) => ({
      dragSelection: state.dragSelection
        ? { ...state.dragSelection, currentX: x, currentY: y }
        : null,
    }));
  },

  endDragSelection: () => {
    const { dragSelection, icons } = get();
    
    if (dragSelection) {
      // Calculate selection rectangle
      const rect = {
        left: Math.min(dragSelection.startX, dragSelection.currentX),
        top: Math.min(dragSelection.startY, dragSelection.currentY),
        right: Math.max(dragSelection.startX, dragSelection.currentX),
        bottom: Math.max(dragSelection.startY, dragSelection.currentY),
      };

      // Select icons within the rectangle
      const selectedIconIds = icons
        .filter((icon) => {
          const iconRect = {
            left: icon.x,
            top: icon.y,
            right: icon.x + 64, // Approximate icon width
            bottom: icon.y + 80, // Approximate icon height
          };
          
          return (
            iconRect.left < rect.right &&
            iconRect.right > rect.left &&
            iconRect.top < rect.bottom &&
            iconRect.bottom > rect.top
          );
        })
        .map(icon => icon.id);

      get().selectMultipleIcons(selectedIconIds, true);
    }

    set({ dragSelection: null });
  },
}));
