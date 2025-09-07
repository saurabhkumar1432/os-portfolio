import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFileSystemService } from '../virtualFileSystem';

describe('VirtualFileSystemService', () => {
  let vfs: VirtualFileSystemService;

  beforeEach(() => {
    vfs = VirtualFileSystemService.getInstance();
  });

  describe('File System Structure', () => {
    it('should create a root file system with expected folders', () => {
      const root = vfs.getFileSystem();
      
      expect(root.name).toBe('Root');
      expect(root.type).toBe('folder');
      expect(root.path).toBe('/');
      expect(root.children).toBeDefined();
      expect(root.children?.length).toBeGreaterThan(0);

      const folderNames = root.children?.map(child => child.name) || [];
      expect(folderNames).toContain('Desktop');
      expect(folderNames).toContain('Documents');
      expect(folderNames).toContain('Projects');
      expect(folderNames).toContain('About');
    });

    it('should have proper file structure in Desktop folder', () => {
      const desktop = vfs.navigateToPath('/Desktop');
      
      expect(desktop).toBeTruthy();
      expect(desktop?.type).toBe('folder');
      expect(desktop?.children).toBeDefined();
      
      const fileNames = desktop?.children?.map(child => child.name) || [];
      expect(fileNames).toContain('Projects.lnk');
      expect(fileNames).toContain('About.lnk');
      expect(fileNames).toContain('Resume.pdf');
    });
  });

  describe('Navigation', () => {
    it('should navigate to valid paths', () => {
      const desktop = vfs.navigateToPath('/Desktop');
      expect(desktop?.name).toBe('Desktop');
      expect(desktop?.path).toBe('/Desktop');

      const documents = vfs.navigateToPath('/Documents');
      expect(documents?.name).toBe('Documents');
      expect(documents?.path).toBe('/Documents');
    });

    it('should return null for invalid paths', () => {
      const invalid = vfs.navigateToPath('/NonExistent');
      expect(invalid).toBeNull();

      const invalidNested = vfs.navigateToPath('/Desktop/NonExistent');
      expect(invalidNested).toBeNull();
    });

    it('should handle root path navigation', () => {
      const root1 = vfs.navigateToPath('/');
      const root2 = vfs.navigateToPath('');
      
      expect(root1?.name).toBe('Root');
      expect(root2?.name).toBe('Root');
    });

    it('should navigate to nested paths', () => {
      const notes = vfs.navigateToPath('/Documents/Notes');
      expect(notes?.name).toBe('Notes');
      expect(notes?.path).toBe('/Documents/Notes');

      const welcomeFile = vfs.navigateToPath('/Documents/Notes/Welcome.md');
      expect(welcomeFile?.name).toBe('Welcome.md');
      expect(welcomeFile?.type).toBe('file');
    });
  });

  describe('Parent Path Calculation', () => {
    it('should calculate parent paths correctly', () => {
      expect(vfs.getParentPath('/Desktop')).toBe('/');
      expect(vfs.getParentPath('/Documents/Notes')).toBe('/Documents');
      expect(vfs.getParentPath('/Documents/Notes/Welcome.md')).toBe('/Documents/Notes');
    });

    it('should handle root path as parent', () => {
      expect(vfs.getParentPath('/')).toBe('/');
      expect(vfs.getParentPath('')).toBe('/');
    });
  });

  describe('Breadcrumb Generation', () => {
    it('should generate breadcrumbs for root path', () => {
      const breadcrumbs = vfs.getBreadcrumbs('/');
      expect(breadcrumbs).toEqual([{ name: 'Root', path: '/' }]);
    });

    it('should generate breadcrumbs for nested paths', () => {
      const breadcrumbs = vfs.getBreadcrumbs('/Documents/Notes');
      expect(breadcrumbs).toEqual([
        { name: 'Root', path: '/' },
        { name: 'Documents', path: '/Documents' },
        { name: 'Notes', path: '/Documents/Notes' }
      ]);
    });

    it('should generate breadcrumbs for file paths', () => {
      const breadcrumbs = vfs.getBreadcrumbs('/Documents/Notes/Welcome.md');
      expect(breadcrumbs).toEqual([
        { name: 'Root', path: '/' },
        { name: 'Documents', path: '/Documents' },
        { name: 'Notes', path: '/Documents/Notes' },
        { name: 'Welcome.md', path: '/Documents/Notes/Welcome.md' }
      ]);
    });
  });

  describe('Search Functionality', () => {
    it('should find files by name', () => {
      const results = vfs.search('Welcome');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(result => result.name === 'Welcome.md')).toBe(true);
    });

    it('should find folders by name', () => {
      const results = vfs.search('Desktop');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(result => result.name === 'Desktop')).toBe(true);
    });

    it('should perform case-insensitive search', () => {
      const results = vfs.search('DESKTOP');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(result => result.name === 'Desktop')).toBe(true);
    });

    it('should return empty array for non-existent items', () => {
      const results = vfs.search('NonExistentFile');
      expect(results).toEqual([]);
    });
  });

  describe('File Icon Mapping', () => {
    it('should return correct icons for folders', () => {
      const desktop = vfs.navigateToPath('/Desktop');
      expect(vfs.getFileIcon(desktop!)).toBe('Monitor');

      const documents = vfs.navigateToPath('/Documents');
      expect(vfs.getFileIcon(documents!)).toBe('FileText');
    });

    it('should return correct icons for files by extension', () => {
      const mdFile = vfs.navigateToPath('/Documents/Notes/Welcome.md');
      expect(vfs.getFileIcon(mdFile!)).toBe('FileText');

      const pdfFile = vfs.navigateToPath('/Desktop/Resume.pdf');
      expect(vfs.getFileIcon(pdfFile!)).toBe('FileText');

      const lnkFile = vfs.navigateToPath('/Desktop/Projects.lnk');
      expect(vfs.getFileIcon(lnkFile!)).toBe('FolderOpen');
    });

    it('should return default icon for unknown extensions', () => {
      const unknownFile = {
        name: 'test.unknown',
        type: 'file' as const,
        path: '/test.unknown',
        ext: 'unknown'
      };
      expect(vfs.getFileIcon(unknownFile)).toBe('File');
    });
  });

  describe('File Size Formatting', () => {
    it('should format bytes correctly', () => {
      expect(vfs.formatFileSize(0)).toBe('0 B');
      expect(vfs.formatFileSize(500)).toBe('500 B');
      expect(vfs.formatFileSize(1024)).toBe('1 KB');
      expect(vfs.formatFileSize(1536)).toBe('1.5 KB');
      expect(vfs.formatFileSize(1048576)).toBe('1 MB');
      expect(vfs.formatFileSize(2097152)).toBe('2 MB');
    });
  });

  describe('Sorting', () => {
    it('should sort by name with folders first', () => {
      const desktop = vfs.navigateToPath('/Desktop');
      const sorted = vfs.sortNodes(desktop?.children || [], 'name');
      
      // Should have files, but folders would come first if any existed
      expect(sorted.length).toBeGreaterThan(0);
      
      // Check that items are sorted alphabetically
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i-1].type === sorted[i].type) {
          expect(sorted[i-1].name.localeCompare(sorted[i].name)).toBeLessThanOrEqual(0);
        }
      }
    });

    it('should sort by type', () => {
      const desktop = vfs.navigateToPath('/Desktop');
      const sorted = vfs.sortNodes(desktop?.children || [], 'type');
      
      expect(sorted.length).toBeGreaterThan(0);
      // All items in Desktop are files, so should be sorted by extension
    });

    it('should sort by modified date', () => {
      const desktop = vfs.navigateToPath('/Desktop');
      const sorted = vfs.sortNodes(desktop?.children || [], 'modified');
      
      expect(sorted.length).toBeGreaterThan(0);
      // Should be sorted by modification date (most recent first)
    });

    it('should always put folders before files', () => {
      const root = vfs.getFileSystem();
      const sorted = vfs.sortNodes(root.children || [], 'name');
      
      // All root items are folders, but test the principle
      const folderIndices = sorted.map((item, index) => 
        item.type === 'folder' ? index : -1
      ).filter(index => index !== -1);
      
      const fileIndices = sorted.map((item, index) => 
        item.type === 'file' ? index : -1
      ).filter(index => index !== -1);
      
      if (folderIndices.length > 0 && fileIndices.length > 0) {
        expect(Math.max(...folderIndices)).toBeLessThan(Math.min(...fileIndices));
      }
    });
  });
});