import { describe, it, expect } from 'vitest';
import { wallpapers, getWallpaperById, getWallpaperValue } from '../assets/wallpapers';

describe('Wallpaper utilities', () => {
  it('exports wallpapers array with correct structure', () => {
    expect(wallpapers).toBeInstanceOf(Array);
    expect(wallpapers.length).toBeGreaterThan(0);
    
    wallpapers.forEach(wallpaper => {
      expect(wallpaper).toHaveProperty('id');
      expect(wallpaper).toHaveProperty('name');
      expect(wallpaper).toHaveProperty('preview');
      expect(wallpaper).toHaveProperty('type');
      expect(wallpaper).toHaveProperty('value');
      
      expect(typeof wallpaper.id).toBe('string');
      expect(typeof wallpaper.name).toBe('string');
      expect(typeof wallpaper.preview).toBe('string');
      expect(['gradient', 'image', 'pattern']).toContain(wallpaper.type);
      expect(typeof wallpaper.value).toBe('string');
    });
  });

  it('includes default wallpaper', () => {
    const defaultWallpaper = wallpapers.find(w => w.id === 'default');
    expect(defaultWallpaper).toBeDefined();
    expect(defaultWallpaper?.name).toBe('Default Blue');
  });

  it('includes various wallpaper options', () => {
    const wallpaperIds = wallpapers.map(w => w.id);
    
    expect(wallpaperIds).toContain('default');
    expect(wallpaperIds).toContain('ocean');
    expect(wallpaperIds).toContain('sunset');
    expect(wallpaperIds).toContain('forest');
    expect(wallpaperIds).toContain('purple');
    expect(wallpaperIds).toContain('dark');
  });

  describe('getWallpaperById', () => {
    it('returns wallpaper for valid id', () => {
      const wallpaper = getWallpaperById('default');
      
      expect(wallpaper).toBeDefined();
      expect(wallpaper?.id).toBe('default');
      expect(wallpaper?.name).toBe('Default Blue');
    });

    it('returns undefined for invalid id', () => {
      const wallpaper = getWallpaperById('nonexistent');
      expect(wallpaper).toBeUndefined();
    });

    it('returns correct wallpaper for each id', () => {
      const oceanWallpaper = getWallpaperById('ocean');
      expect(oceanWallpaper?.name).toBe('Ocean Breeze');
      
      const sunsetWallpaper = getWallpaperById('sunset');
      expect(sunsetWallpaper?.name).toBe('Sunset');
      
      const forestWallpaper = getWallpaperById('forest');
      expect(forestWallpaper?.name).toBe('Forest');
    });
  });

  describe('getWallpaperValue', () => {
    it('returns wallpaper value for valid id', () => {
      const value = getWallpaperValue('default');
      
      expect(typeof value).toBe('string');
      expect(value).toContain('linear-gradient');
    });

    it('returns default wallpaper value for invalid id', () => {
      const value = getWallpaperValue('nonexistent');
      const defaultValue = getWallpaperValue('default');
      
      expect(value).toBe(defaultValue);
    });

    it('returns correct values for different wallpapers', () => {
      const oceanValue = getWallpaperValue('ocean');
      const sunsetValue = getWallpaperValue('sunset');
      
      expect(oceanValue).not.toBe(sunsetValue);
      expect(oceanValue).toContain('linear-gradient');
      expect(sunsetValue).toContain('linear-gradient');
    });

    it('handles empty string id', () => {
      const value = getWallpaperValue('');
      const defaultValue = getWallpaperValue('default');
      
      expect(value).toBe(defaultValue);
    });
  });

  describe('wallpaper gradients', () => {
    it('all gradient wallpapers have valid CSS gradient syntax', () => {
      const gradientWallpapers = wallpapers.filter(w => w.type === 'gradient');
      
      gradientWallpapers.forEach(wallpaper => {
        expect(wallpaper.value).toMatch(/linear-gradient\(/);
        expect(wallpaper.preview).toMatch(/linear-gradient\(/);
      });
    });

    it('gradient values contain color stops', () => {
      const gradientWallpapers = wallpapers.filter(w => w.type === 'gradient');
      
      gradientWallpapers.forEach(wallpaper => {
        // Should contain at least two color values (hex colors)
        const hexColorMatches = wallpaper.value.match(/#[0-9a-fA-F]{6}/g);
        expect(hexColorMatches).toBeTruthy();
        expect(hexColorMatches!.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('wallpaper names', () => {
    it('all wallpapers have unique names', () => {
      const names = wallpapers.map(w => w.name);
      const uniqueNames = new Set(names);
      
      expect(uniqueNames.size).toBe(names.length);
    });

    it('all wallpapers have descriptive names', () => {
      wallpapers.forEach(wallpaper => {
        expect(wallpaper.name.length).toBeGreaterThan(0);
        expect(wallpaper.name.trim()).toBe(wallpaper.name);
      });
    });
  });

  describe('wallpaper ids', () => {
    it('all wallpapers have unique ids', () => {
      const ids = wallpapers.map(w => w.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all ids are lowercase and kebab-case', () => {
      wallpapers.forEach(wallpaper => {
        expect(wallpaper.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
      });
    });
  });
});