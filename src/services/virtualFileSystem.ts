import type { VNode } from '../types';

/**
 * Virtual File System Service
 * Manages the virtual file system structure and navigation
 */
export class VirtualFileSystemService {
  private static instance: VirtualFileSystemService;
  private fileSystem: VNode;

  private constructor() {
    this.fileSystem = this.createFileSystem();
  }

  public static getInstance(): VirtualFileSystemService {
    if (!VirtualFileSystemService.instance) {
      VirtualFileSystemService.instance = new VirtualFileSystemService();
    }
    return VirtualFileSystemService.instance;
  }

  /**
   * Create the virtual file system structure
   */
  private createFileSystem(): VNode {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      name: 'Root',
      type: 'folder',
      path: '/',
      modified: now,
      children: [
        {
          name: 'Desktop',
          type: 'folder',
          path: '/Desktop',
          modified: now,
          icon: 'Monitor',
          children: [
            {
              name: 'Projects.lnk',
              type: 'file',
              path: '/Desktop/Projects.lnk',
              ext: 'lnk',
              size: 1024,
              modified: lastWeek,
              icon: 'FolderOpen',
              content: 'Shortcut to Projects application'
            },
            {
              name: 'About.lnk',
              type: 'file',
              path: '/Desktop/About.lnk',
              ext: 'lnk',
              size: 1024,
              modified: lastWeek,
              icon: 'User',
              content: 'Shortcut to About application'
            },
            {
              name: 'Resume.pdf',
              type: 'file',
              path: '/Desktop/Resume.pdf',
              ext: 'pdf',
              size: 2048000,
              modified: lastMonth,
              icon: 'FileText',
              content: 'Professional resume document'
            }
          ]
        },
        {
          name: 'Documents',
          type: 'folder',
          path: '/Documents',
          modified: now,
          icon: 'FileText',
          children: [
            {
              name: 'Notes',
              type: 'folder',
              path: '/Documents/Notes',
              modified: lastWeek,
              icon: 'StickyNote',
              children: [
                {
                  name: 'Welcome.md',
                  type: 'file',
                  path: '/Documents/Notes/Welcome.md',
                  ext: 'md',
                  size: 1500,
                  modified: lastWeek,
                  icon: 'FileText',
                  content: `# Welcome to Portfolio OS

This is a virtual file system that showcases my portfolio in an interactive desktop environment.

## Navigation
- Use the file explorer to browse through different sections
- Double-click files to open them
- Right-click for context menus

## Applications
- **Projects**: Browse my development projects
- **About**: Learn about my background and experience
- **Terminal**: Interact via command line
- **Settings**: Customize the experience

Enjoy exploring!`
                },
                {
                  name: 'TODO.txt',
                  type: 'file',
                  path: '/Documents/Notes/TODO.txt',
                  ext: 'txt',
                  size: 800,
                  modified: now,
                  icon: 'CheckSquare',
                  content: `Portfolio OS TODO:
- Implement file preview functionality
- Add more interactive elements
- Optimize performance
- Add more project details
- Implement search functionality`
                }
              ]
            },
            {
              name: 'README.md',
              type: 'file',
              path: '/Documents/README.md',
              ext: 'md',
              size: 2500,
              modified: lastMonth,
              icon: 'FileText',
              content: `# Portfolio OS Documentation

## Overview
This is an interactive portfolio website designed as a desktop operating system experience.

## Features
- Window management system
- Virtual file system
- Multiple applications
- Keyboard shortcuts
- Responsive design

## Technology Stack
- React 18 with TypeScript
- Tailwind CSS
- Zustand for state management
- Framer Motion for animations
- Vite for build tooling

## Getting Started
Explore the desktop environment by:
1. Opening applications from the taskbar
2. Using the Start menu to search
3. Navigating through the file system
4. Trying keyboard shortcuts

## Contact
Feel free to reach out through the About application or via the contact links provided.`
            }
          ]
        },
        {
          name: 'Projects',
          type: 'folder',
          path: '/Projects',
          modified: now,
          icon: 'FolderOpen',
          children: [
            {
              name: 'Web Development',
              type: 'folder',
              path: '/Projects/Web Development',
              modified: lastWeek,
              icon: 'Globe',
              children: [
                {
                  name: 'Portfolio OS.md',
                  type: 'file',
                  path: '/Projects/Web Development/Portfolio OS.md',
                  ext: 'md',
                  size: 3200,
                  modified: now,
                  icon: 'Monitor',
                  content: `# Portfolio OS

## Description
An interactive portfolio website designed as a desktop operating system experience.

## Technologies
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- Framer Motion

## Features
- Window management
- Virtual file system
- Multiple applications
- Keyboard shortcuts
- Responsive design

## Status
In Development`
                }
              ]
            },
            {
              name: 'Mobile Apps',
              type: 'folder',
              path: '/Projects/Mobile Apps',
              modified: lastMonth,
              icon: 'Smartphone',
              children: []
            },
            {
              name: 'Systems',
              type: 'folder',
              path: '/Projects/Systems',
              modified: lastMonth,
              icon: 'Server',
              children: []
            }
          ]
        },
        {
          name: 'About',
          type: 'folder',
          path: '/About',
          modified: now,
          icon: 'User',
          children: [
            {
              name: 'Experience.md',
              type: 'file',
              path: '/About/Experience.md',
              ext: 'md',
              size: 4500,
              modified: lastWeek,
              icon: 'Briefcase',
              content: `# Professional Experience

## Current Role
Software Developer focused on creating innovative web applications and user experiences.

## Skills
- Frontend Development (React, TypeScript, CSS)
- Backend Development (Node.js, Python)
- Database Design (PostgreSQL, MongoDB)
- Cloud Services (AWS, Vercel)
- DevOps (Docker, CI/CD)

## Interests
- User Experience Design
- Performance Optimization
- Accessibility
- Open Source Contributions`
            },
            {
              name: 'Contact.txt',
              type: 'file',
              path: '/About/Contact.txt',
              ext: 'txt',
              size: 500,
              modified: lastMonth,
              icon: 'Mail',
              content: `Contact Information:

Email: contact@example.com
LinkedIn: linkedin.com/in/example
GitHub: github.com/example
Portfolio: portfolio-os.example.com

Feel free to reach out for collaboration opportunities or just to connect!`
            }
          ]
        }
      ]
    };
  }

  /**
   * Get the root file system
   */
  public getFileSystem(): VNode {
    return this.fileSystem;
  }

  /**
   * Navigate to a specific path
   */
  public navigateToPath(path: string): VNode | null {
    if (path === '/' || path === '') {
      return this.fileSystem;
    }

    const pathParts = path.split('/').filter(part => part !== '');
    let currentNode = this.fileSystem;

    for (const part of pathParts) {
      if (!currentNode.children) {
        return null;
      }

      const childNode = currentNode.children.find(child => child.name === part);
      if (!childNode) {
        return null;
      }

      currentNode = childNode;
    }

    return currentNode;
  }

  /**
   * Get parent path
   */
  public getParentPath(path: string): string {
    if (path === '/' || path === '') {
      return '/';
    }

    const pathParts = path.split('/').filter(part => part !== '');
    pathParts.pop();

    return pathParts.length === 0 ? '/' : '/' + pathParts.join('/');
  }

  /**
   * Get breadcrumb items for a path
   */
  public getBreadcrumbs(path: string): Array<{ name: string; path: string }> {
    if (path === '/' || path === '') {
      return [{ name: 'Root', path: '/' }];
    }

    const pathParts = path.split('/').filter(part => part !== '');
    const breadcrumbs = [{ name: 'Root', path: '/' }];

    let currentPath = '';
    for (const part of pathParts) {
      currentPath += '/' + part;
      breadcrumbs.push({ name: part, path: currentPath });
    }

    return breadcrumbs;
  }

  /**
   * Search files and folders
   */
  public search(query: string, node: VNode = this.fileSystem): VNode[] {
    const results: VNode[] = [];
    const lowerQuery = query.toLowerCase();

    if (node.name.toLowerCase().includes(lowerQuery)) {
      results.push(node);
    }

    if (node.children) {
      for (const child of node.children) {
        results.push(...this.search(query, child));
      }
    }

    return results;
  }

  /**
   * Get file extension icon
   */
  public getFileIcon(node: VNode): string {
    if (node.icon) {
      return node.icon;
    }

    if (node.type === 'folder') {
      return 'Folder';
    }

    switch (node.ext) {
      case 'md':
        return 'FileText';
      case 'txt':
        return 'FileText';
      case 'pdf':
        return 'FileText';
      case 'lnk':
        return 'Link';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'Image';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'Video';
      case 'mp3':
      case 'wav':
      case 'ogg':
        return 'Music';
      default:
        return 'File';
    }
  }

  /**
   * Format file size
   */
  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Sort files and folders
   */
  public sortNodes(nodes: VNode[], sortBy: 'name' | 'type' | 'modified'): VNode[] {
    return [...nodes].sort((a, b) => {
      // Always put folders first
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;

      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          if (a.ext && b.ext) {
            return a.ext.localeCompare(b.ext);
          }
          return a.name.localeCompare(b.name);
        case 'modified':
          const aTime = a.modified?.getTime() || 0;
          const bTime = b.modified?.getTime() || 0;
          return bTime - aTime; // Most recent first
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }
}

// Export singleton instance
export const virtualFileSystem = VirtualFileSystemService.getInstance();