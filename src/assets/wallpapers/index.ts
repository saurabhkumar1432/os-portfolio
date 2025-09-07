// Wallpaper definitions
export interface WallpaperOption {
  id: string;
  name: string;
  preview: string;
  type: 'gradient' | 'image' | 'pattern';
  value: string;
}

export const wallpapers: WallpaperOption[] = [
  {
    id: 'default',
    name: 'Default Blue',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    preview: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    type: 'gradient',
    value: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    preview: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)',
  },
  {
    id: 'forest',
    name: 'Forest',
    preview: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
    type: 'gradient',
    value: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
  },
  {
    id: 'purple',
    name: 'Purple Dream',
    preview: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
    type: 'gradient',
    value: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
  },
  {
    id: 'dark',
    name: 'Dark Space',
    preview: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
    type: 'gradient',
    value: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
  },
];

export const getWallpaperById = (id: string): WallpaperOption | undefined => {
  return wallpapers.find(w => w.id === id);
};

export const getWallpaperValue = (id: string): string => {
  const wallpaper = getWallpaperById(id);
  return wallpaper?.value || wallpapers[0].value;
};