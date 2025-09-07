import Fuse from 'fuse.js';
import type { SearchableItem, SearchIndex, SearchResult, AppId } from '../types';
import { appLauncher } from './appLauncher';

class SearchService {
  private fuse: Fuse<SearchableItem> | null = null;
  private searchIndex: SearchIndex = {
    apps: [],
    projects: [],
    files: [],
    commands: []
  };

  constructor() {
    this.buildSearchIndex();
    this.initializeFuse();
  }

  private buildSearchIndex(): void {
    // Build apps index
    this.searchIndex.apps = [
      {
        id: 'projects',
        title: 'Projects',
        description: 'View and explore my portfolio projects',
        keywords: ['portfolio', 'work', 'code', 'development'],
        category: 'app',
        icon: 'folder',
        action: () => this.openApp('projects')
      },
      {
        id: 'file-explorer',
        title: 'File Explorer',
        description: 'Browse files and folders',
        keywords: ['files', 'folders', 'browse', 'explorer'],
        category: 'app',
        icon: 'folder-open',
        action: () => this.openApp('file-explorer')
      },
      {
        id: 'terminal',
        title: 'Terminal',
        description: 'Command line interface',
        keywords: ['command', 'cli', 'shell', 'console'],
        category: 'app',
        icon: 'terminal',
        action: () => this.openApp('terminal')
      },
      {
        id: 'about',
        title: 'About',
        description: 'Learn about my background and experience',
        keywords: ['bio', 'resume', 'experience', 'background'],
        category: 'app',
        icon: 'user',
        action: () => this.openApp('about')
      },
      {
        id: 'notepad',
        title: 'Notepad',
        description: 'Simple text editor for notes',
        keywords: ['text', 'editor', 'notes', 'write'],
        category: 'app',
        icon: 'file-text',
        action: () => this.openApp('notepad')
      },
      {
        id: 'settings',
        title: 'Settings',
        description: 'Customize appearance and preferences',
        keywords: ['preferences', 'config', 'theme', 'options'],
        category: 'app',
        icon: 'settings',
        action: () => this.openApp('settings')
      },
      {
        id: 'resume-viewer',
        title: 'Resume',
        description: 'View and download my resume',
        keywords: ['cv', 'resume', 'pdf', 'download'],
        category: 'app',
        icon: 'file-text',
        action: () => this.openApp('resume-viewer')
      }
    ];

    // Build commands index
    this.searchIndex.commands = [
      {
        id: 'help',
        title: 'Help',
        description: 'Show available commands and shortcuts',
        keywords: ['help', 'commands', 'shortcuts'],
        category: 'command',
        icon: 'help-circle',
        action: () => this.executeCommand('help')
      },
      {
        id: 'theme-dark',
        title: 'Switch to Dark Theme',
        description: 'Change to dark color scheme',
        keywords: ['dark', 'theme', 'mode'],
        category: 'command',
        icon: 'moon',
        action: () => this.executeCommand('theme dark')
      },
      {
        id: 'theme-light',
        title: 'Switch to Light Theme',
        description: 'Change to light color scheme',
        keywords: ['light', 'theme', 'mode'],
        category: 'command',
        icon: 'sun',
        action: () => this.executeCommand('theme light')
      },
      {
        id: 'minimize-all',
        title: 'Minimize All Windows',
        description: 'Minimize all open windows',
        keywords: ['minimize', 'windows', 'hide'],
        category: 'command',
        icon: 'minimize',
        action: () => this.executeCommand('minimize-all')
      }
    ];

    // Build files index (virtual file system)
    this.searchIndex.files = [
      {
        id: 'desktop',
        title: 'Desktop',
        description: 'Desktop folder',
        keywords: ['desktop', 'folder'],
        category: 'file',
        icon: 'monitor',
        action: () => this.openFile('/Desktop')
      },
      {
        id: 'documents',
        title: 'Documents',
        description: 'Documents folder',
        keywords: ['documents', 'folder', 'files'],
        category: 'file',
        icon: 'folder',
        action: () => this.openFile('/Documents')
      },
      {
        id: 'projects-folder',
        title: 'Projects Folder',
        description: 'Projects and portfolio items',
        keywords: ['projects', 'portfolio', 'work'],
        category: 'file',
        icon: 'folder',
        action: () => this.openFile('/Projects')
      }
    ];

    // Sample projects (this would be loaded from actual project data)
    this.searchIndex.projects = [
      {
        id: 'sample-project-1',
        title: 'Portfolio Website',
        description: 'Interactive portfolio built with React and TypeScript',
        keywords: ['react', 'typescript', 'portfolio', 'web'],
        category: 'project',
        icon: 'globe',
        action: () => this.openProject('portfolio-website')
      },
      {
        id: 'sample-project-2',
        title: 'Task Management App',
        description: 'Full-stack task management application',
        keywords: ['tasks', 'management', 'productivity', 'app'],
        category: 'project',
        icon: 'check-square',
        action: () => this.openProject('task-management')
      }
    ];
  }

  private initializeFuse(): void {
    // Combine all searchable items
    const allItems = [
      ...this.searchIndex.apps,
      ...this.searchIndex.projects,
      ...this.searchIndex.files,
      ...this.searchIndex.commands
    ];

    // Configure Fuse.js options
    const options = {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'keywords', weight: 0.3 }
      ],
      threshold: 0.4, // Lower = more strict matching
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 1,
      shouldSort: true,
      findAllMatches: true
    };

    this.fuse = new Fuse(allItems, options);
  }

  public search(query: string): SearchResult[] {
    if (!this.fuse || !query.trim()) {
      return [];
    }

    const results = this.fuse.search(query, { limit: 10 });
    
    return results.map(result => ({
      ...result.item,
      score: result.score,
      matches: result.matches?.map(match => ({
        indices: match.indices,
        key: match.key,
        value: match.value
      }))
    }));
  }

  public getItemsByCategory(category: SearchableItem['category']): SearchableItem[] {
    return this.searchIndex[category === 'app' ? 'apps' : 
                           category === 'project' ? 'projects' :
                           category === 'file' ? 'files' : 'commands'];
  }

  public getAllApps(): SearchableItem[] {
    return this.searchIndex.apps;
  }

  public getPinnedApps(pinnedIds: AppId[]): SearchableItem[] {
    return this.searchIndex.apps.filter(app => pinnedIds.includes(app.id as AppId));
  }

  public getRecentApps(recentIds: AppId[]): SearchableItem[] {
    return this.searchIndex.apps.filter(app => recentIds.includes(app.id as AppId));
  }

  private async openApp(appId: AppId): Promise<void> {
    try {
      const result = await appLauncher.launchApp(appId);
      if (!result.success) {
        console.error(`Failed to launch app ${appId}:`, result.error);
      }
    } catch (error) {
      console.error(`Error launching app ${appId}:`, error);
    }
  }

  private openProject(projectId: string): void {
    // This will open the projects app with specific project
    console.log(`Opening project: ${projectId}`);
    // TODO: Integrate with projects app
  }

  private openFile(path: string): void {
    // This will open file explorer at specific path
    console.log(`Opening file: ${path}`);
    // TODO: Integrate with file explorer
  }

  private executeCommand(command: string): void {
    // This will execute system commands
    console.log(`Executing command: ${command}`);
    // TODO: Integrate with command system
  }

  public updateSearchIndex(): void {
    this.buildSearchIndex();
    this.initializeFuse();
  }
}

// Export singleton instance
export const searchService = new SearchService();