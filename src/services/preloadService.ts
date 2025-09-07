import type { AppId } from '../types';

/**
 * Service for intelligent preloading of application chunks
 * Implements various preloading strategies based on user behavior
 */
export class PreloadService {
  private static instance: PreloadService;
  private preloadedApps = new Set<AppId>();
  private preloadPromises = new Map<AppId, Promise<any>>();
  private userInteractionCount = new Map<AppId, number>();

  private constructor() {
    this.initializePreloading();
  }

  public static getInstance(): PreloadService {
    if (!PreloadService.instance) {
      PreloadService.instance = new PreloadService();
    }
    return PreloadService.instance;
  }

  /**
   * Initialize preloading strategies
   */
  private initializePreloading(): void {
    // Preload critical apps on idle
    this.scheduleIdlePreload(['projects', 'file-explorer']);
    
    // Set up intersection observer for hover preloading
    this.setupHoverPreloading();
    
    // Preload based on user preferences
    this.preloadFromUserHistory();
  }

  /**
   * Preload apps during browser idle time
   */
  private scheduleIdlePreload(appIds: AppId[]): void {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        appIds.forEach(appId => this.preloadApp(appId));
      }, { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        appIds.forEach(appId => this.preloadApp(appId));
      }, 2000);
    }
  }

  /**
   * Set up hover-based preloading for desktop icons and taskbar items
   */
  private setupHoverPreloading(): void {
    // Use event delegation for better performance
    document.addEventListener('mouseenter', (event) => {
      const target = event.target as HTMLElement;
      const appId = target.dataset?.appId as AppId;
      
      if (appId && !this.preloadedApps.has(appId)) {
        // Debounce hover preloading
        setTimeout(() => {
          if (target.matches(':hover')) {
            this.preloadApp(appId);
          }
        }, 100);
      }
    }, true);
  }

  /**
   * Preload apps based on user interaction history
   */
  private preloadFromUserHistory(): void {
    try {
      const history = localStorage.getItem('app-usage-history');
      if (history) {
        const usageData = JSON.parse(history) as Record<AppId, number>;
        
        // Sort apps by usage frequency
        const frequentApps = Object.entries(usageData)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([appId]) => appId as AppId);
        
        // Preload most frequently used apps
        this.scheduleIdlePreload(frequentApps);
      }
    } catch (error) {
      console.warn('Failed to load app usage history:', error);
    }
  }

  /**
   * Preload a specific app
   */
  public async preloadApp(appId: AppId): Promise<void> {
    if (this.preloadedApps.has(appId)) {
      return;
    }

    // Check if already preloading
    if (this.preloadPromises.has(appId)) {
      return this.preloadPromises.get(appId);
    }

    const preloadPromise = this.loadAppChunk(appId);
    this.preloadPromises.set(appId, preloadPromise);

    try {
      await preloadPromise;
      this.preloadedApps.add(appId);
    } catch (error) {
      console.warn(`Failed to preload app ${appId}:`, error);
    } finally {
      this.preloadPromises.delete(appId);
    }
  }

  /**
   * Load the app chunk based on app ID
   */
  private async loadAppChunk(appId: AppId): Promise<any> {
    switch (appId) {
      case 'projects':
        return Promise.all([
          import('../apps/ProjectsApp')
        ]);
      
      case 'file-explorer':
        return Promise.all([
          import('../apps/FileExplorerApp')
        ]);
      
      case 'terminal':
        return Promise.all([
          import('../apps/TerminalApp'),
          import('../utils/terminalCommands')
        ]);
      
      case 'about':
        return Promise.all([
          import('../apps/AboutApp')
        ]);
      
      case 'notepad':
        return Promise.all([
          import('../apps/NotepadApp'),
          import('../components/MarkdownRenderer')
        ]);
      
      case 'settings':
        return Promise.all([
          import('../apps/SettingsApp'),
          import('../components/ThemeProvider')
        ]);
      
      case 'resume-viewer':
        return Promise.all([
          import('../apps/ResumeViewerApp'),
          import('pdfjs-dist')
        ]);
      
      default:
        throw new Error(`Unknown app ID: ${appId}`);
    }
  }

  /**
   * Track app usage for intelligent preloading
   */
  public trackAppUsage(appId: AppId): void {
    const currentCount = this.userInteractionCount.get(appId) || 0;
    this.userInteractionCount.set(appId, currentCount + 1);
    
    // Persist to localStorage for future sessions
    try {
      const history = localStorage.getItem('app-usage-history');
      const usageData = history ? JSON.parse(history) : {};
      usageData[appId] = (usageData[appId] || 0) + 1;
      localStorage.setItem('app-usage-history', JSON.stringify(usageData));
    } catch (error) {
      console.warn('Failed to save app usage history:', error);
    }
  }

  /**
   * Preload apps that are likely to be used next
   */
  public preloadRelatedApps(currentAppId: AppId): void {
    const relatedApps: Record<AppId, AppId[]> = {
      'projects': ['file-explorer', 'terminal'],
      'file-explorer': ['notepad', 'resume-viewer'],
      'terminal': ['projects', 'file-explorer'],
      'about': ['resume-viewer', 'projects'],
      'notepad': ['file-explorer'],
      'settings': ['about'],
      'resume-viewer': ['about', 'projects']
    };

    const related = relatedApps[currentAppId] || [];
    related.forEach(appId => this.preloadApp(appId));
  }

  /**
   * Get preload status for debugging
   */
  public getPreloadStatus(): {
    preloaded: AppId[];
    preloading: AppId[];
    usage: Partial<Record<AppId, number>>;
  } {
    return {
      preloaded: Array.from(this.preloadedApps),
      preloading: Array.from(this.preloadPromises.keys()),
      usage: Object.fromEntries(this.userInteractionCount) as Partial<Record<AppId, number>>
    };
  }

  /**
   * Clear preload cache (useful for development)
   */
  public clearCache(): void {
    this.preloadedApps.clear();
    this.preloadPromises.clear();
    this.userInteractionCount.clear();
  }
}

// Export singleton instance
export const preloadService = PreloadService.getInstance();