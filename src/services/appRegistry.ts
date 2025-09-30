import { lazy } from 'react';
import type { BaseApp, AppId } from '../types';

// Lazy load app components for code splitting with preloading
const ProjectsApp = lazy(() => import('../apps/ProjectsApp'));

const FileExplorerApp = lazy(() => import('../apps/FileExplorerApp'));

const TerminalApp = lazy(() => 
  import('../apps/TerminalApp').then(module => {
    // Preload terminal utilities
    import('../utils/terminalCommands');
    return module;
  })
);

const AboutApp = lazy(() => import('../apps/AboutApp'));

const NotepadApp = lazy(() => 
  import('../apps/NotepadApp').then(module => {
    // Preload markdown renderer
    import('../components/MarkdownRenderer');
    return module;
  })
);

const SettingsApp = lazy(() => 
  import('../apps/SettingsApp').then(module => {
    // Preload theme provider
    import('../components/ThemeProvider');
    return module;
  })
);

const ResumeViewerApp = lazy(() => 
  import('../apps/ResumeViewerAppOptimized').then(module => {
    // Preload PDF.js
    import('pdfjs-dist');
    return module;
  })
);

const CalculatorApp = lazy(() => import('../apps/CalculatorApp'));

const ClipboardManagerApp = lazy(() => import('../apps/ClipboardManagerApp'));

const ScreenshotApp = lazy(() => import('../apps/ScreenshotApp'));

const TaskManagerApp = lazy(() => import('../apps/TaskManagerApp'));

const ColorPickerApp = lazy(() => import('../apps/ColorPickerApp'));

/**
 * Application registry that manages all available applications
 * Provides centralized configuration and dynamic loading capabilities
 */
export class AppRegistry {
  private static instance: AppRegistry;
  private apps: Map<AppId, BaseApp> = new Map();

  private constructor() {
    this.initializeApps();
  }

  public static getInstance(): AppRegistry {
    if (!AppRegistry.instance) {
      AppRegistry.instance = new AppRegistry();
    }
    return AppRegistry.instance;
  }

  /**
   * Initialize all available applications with their configurations
   */
  private initializeApps(): void {
    const appConfigs: BaseApp[] = [
      {
        id: 'projects',
        name: 'Projects',
        icon: 'FolderOpen',
        component: ProjectsApp,
        defaultSize: { width: 900, height: 700 },
        minSize: { width: 400, height: 300 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      },
      {
        id: 'file-explorer',
        name: 'File Explorer',
        icon: 'Folder',
        component: FileExplorerApp,
        defaultSize: { width: 800, height: 600 },
        minSize: { width: 320, height: 240 },
        resizable: true,
        maximizable: true,
        multiInstance: true,
      },
      {
        id: 'terminal',
        name: 'Terminal',
        icon: 'Terminal',
        component: TerminalApp,
        defaultSize: { width: 700, height: 500 },
        minSize: { width: 400, height: 200 },
        resizable: true,
        maximizable: true,
        multiInstance: true,
      },
      {
        id: 'about',
        name: 'About',
        icon: 'User',
        component: AboutApp,
        defaultSize: { width: 600, height: 500 },
        minSize: { width: 400, height: 300 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      },
      {
        id: 'notepad',
        name: 'Notepad',
        icon: 'FileText',
        component: NotepadApp,
        defaultSize: { width: 600, height: 400 },
        minSize: { width: 320, height: 240 },
        resizable: true,
        maximizable: true,
        multiInstance: true,
      },
      {
        id: 'settings',
        name: 'Settings',
        icon: 'Settings',
        component: SettingsApp,
        defaultSize: { width: 500, height: 600 },
        minSize: { width: 400, height: 400 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      },
      {
        id: 'resume-viewer',
        name: 'Resume',
        icon: 'FileText',
        component: ResumeViewerApp,
        defaultSize: { width: 800, height: 900 },
        minSize: { width: 400, height: 500 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      },
      {
        id: 'calculator',
        name: 'Calculator',
        icon: 'Calculator',
        component: CalculatorApp,
        defaultSize: { width: 360, height: 640 },
        minSize: { width: 320, height: 580 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      },
      {
        id: 'clipboard',
        name: 'Clipboard Manager',
        icon: 'Clipboard',
        component: ClipboardManagerApp,
        defaultSize: { width: 500, height: 650 },
        minSize: { width: 350, height: 400 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      },
      {
        id: 'screenshot',
        name: 'Screenshot Tool',
        icon: 'Camera',
        component: ScreenshotApp,
        defaultSize: { width: 900, height: 700 },
        minSize: { width: 600, height: 500 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      },
      {
        id: 'task-manager',
        name: 'Task Manager',
        icon: 'Activity',
        component: TaskManagerApp,
        defaultSize: { width: 800, height: 650 },
        minSize: { width: 600, height: 450 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      },
      {
        id: 'color-picker',
        name: 'Color Picker',
        icon: 'Palette',
        component: ColorPickerApp,
        defaultSize: { width: 600, height: 700 },
        minSize: { width: 450, height: 600 },
        resizable: true,
        maximizable: true,
        multiInstance: false,
      },
    ];

    appConfigs.forEach(app => {
      this.apps.set(app.id, app);
    });
  }

  /**
   * Get application configuration by ID
   */
  public getApp(appId: AppId): BaseApp | undefined {
    return this.apps.get(appId);
  }

  /**
   * Get all registered applications
   */
  public getAllApps(): BaseApp[] {
    return Array.from(this.apps.values());
  }

  /**
   * Get applications that support multiple instances
   */
  public getMultiInstanceApps(): BaseApp[] {
    return this.getAllApps().filter(app => app.multiInstance);
  }

  /**
   * Get applications that only support single instances
   */
  public getSingleInstanceApps(): BaseApp[] {
    return this.getAllApps().filter(app => !app.multiInstance);
  }

  /**
   * Check if an application exists
   */
  public hasApp(appId: AppId): boolean {
    return this.apps.has(appId);
  }

  /**
   * Register a new application (for dynamic app loading)
   */
  public registerApp(app: BaseApp): void {
    this.apps.set(app.id, app);
  }

  /**
   * Unregister an application
   */
  public unregisterApp(appId: AppId): boolean {
    return this.apps.delete(appId);
  }

  /**
   * Get app configuration for window creation
   */
  public getAppWindowConfig(appId: AppId): Pick<BaseApp, 'defaultSize' | 'minSize' | 'resizable' | 'maximizable'> | null {
    const app = this.getApp(appId);
    if (!app) return null;

    return {
      defaultSize: app.defaultSize,
      minSize: app.minSize,
      resizable: app.resizable,
      maximizable: app.maximizable,
    };
  }
}

// Export singleton instance
export const appRegistry = AppRegistry.getInstance();