// Core application types
export type AppId =
  | 'projects'
  | 'file-explorer'
  | 'terminal'
  | 'about'
  | 'notepad'
  | 'settings'
  | 'resume-viewer'
  | 'calculator'
  | 'clipboard'
  | 'screenshot'
  | 'task-manager'
  | 'color-picker';

// Window management types
export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  bounds: { x: number; y: number; w: number; h: number };
  previousBounds?: { x: number; y: number; w: number; h: number }; // Store bounds before maximizing
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
  hasUnsavedState?: boolean;
  snapState?: 'left' | 'right' | 'maximized' | null;
}

export interface DragState {
  windowId: string;
  startPosition: { x: number; y: number };
  startBounds: { x: number; y: number; w: number; h: number };
  offset: { x: number; y: number };
}

export interface ResizeState {
  windowId: string;
  handle: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
  startBounds: { x: number; y: number; w: number; h: number };
  startPosition: { x: number; y: number };
}

// Desktop types
export interface DesktopIcon {
  id: string;
  label: string;
  appId?: AppId;
  path?: string;
  x: number;
  y: number;
  selected: boolean;
}

export interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
  target?: string;
}

export interface ContextMenuItem {
  id: string;
  label?: string;
  icon?: string;
  action?: () => void;
  disabled?: boolean;
  separator?: boolean;
  children?: ContextMenuItem[];
}

export interface DragSelectionState {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface DesktopState {
  icons: DesktopIcon[];
  wallpaper: string;
  iconSize: 'sm' | 'md' | 'lg';
  contextMenu: ContextMenuState | null;
  dragSelection: DragSelectionState | null;
}

// App state types
export interface AppState {
  id: AppId;
  name: string;
  icon: string;
  running: boolean;
  windows: string[];
  lastFocused?: string;
}

// Keyboard shortcut types
export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  action: () => void;
  preventDefault?: boolean;
  global?: boolean;
  context?: 'desktop' | 'window' | 'app';
}

export interface KeyboardState {
  pressedKeys: Set<string>;
  shortcuts: KeyboardShortcut[];
  enabled: boolean;
}

// Search types
export interface SearchableItem {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  category: 'app' | 'project' | 'file' | 'command';
  icon?: string;
  action: () => void;
}

export interface SearchIndex {
  apps: SearchableItem[];
  projects: SearchableItem[];
  files: SearchableItem[];
  commands: SearchableItem[];
}

export interface SearchResult extends SearchableItem {
  score?: number;
  matches?: Array<{
    indices: readonly [number, number][];
    key?: string;
    value?: string;
  }>;
}

// Start menu types
export interface StartMenuState {
  isOpen: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  selectedIndex: number;
  pinnedApps: AppId[];
  recentApps: AppId[];
}

// Base application interface
export interface AppProps {
  windowId: string;
  focused: boolean;
  onTitleChange: (title: string) => void;
  onUnsavedStateChange: (hasUnsaved: boolean) => void;
}

export interface BaseApp {
  id: AppId;
  name: string;
  icon: string;
  component: React.ComponentType<AppProps>;
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  resizable: boolean;
  maximizable: boolean;
  multiInstance: boolean;
}

// Project types
export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string;
  year: number;
  role: string;
  tech: string[];
  type: 'web' | 'mobile' | 'systems' | 'ml';
  links?: {
    github?: string;
    demo?: string;
    documentation?: string;
  };
  media?: {
    cover: string;
    gallery?: string[];
    video?: string;
  };
  highlights?: string[];
  metrics?: Array<{
    label: string;
    value: string;
  }>;
  featured: boolean;
  complexity: number;
}

export interface ProjectsAppState {
  view: 'grid' | 'list' | 'timeline';
  filters: {
    tech: string[];
    type: string[];
    year: number[];
  };
  sort: 'recent' | 'stars' | 'complexity';
  selectedProject: string | null;
  searchQuery: string;
}

export interface ProjectLoadError {
  slug: string;
  message: string;
  type: 'validation' | 'loading' | 'parsing';
}

// File Explorer types
export interface VNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  ext?: string;
  size?: number;
  modified?: Date;
  children?: VNode[];
  content?: string;
  icon?: string;
}

export interface VirtualFileSystem {
  root: VNode;
  currentPath: string;
  history: string[];
  historyIndex: number;
  selectedItems: string[];
  viewMode: 'list' | 'grid';
  sortBy: 'name' | 'type' | 'modified';
}

export interface FileExplorerState {
  fileSystem: VirtualFileSystem;
  previewFile: VNode | null;
  contextMenu: ContextMenuState | null;
  loading: boolean;
  error: string | null;
}

// Terminal types
export interface TerminalCommand {
  id: string;
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  execute: (args: string[], context: TerminalContext) => Promise<TerminalOutput> | TerminalOutput;
}

export interface TerminalOutput {
  type: 'success' | 'error' | 'info' | 'warning';
  content: string | React.ReactNode;
  timestamp?: Date;
}

export interface TerminalHistoryEntry {
  command: string;
  output: TerminalOutput[];
  timestamp: Date;
}

export interface TerminalContext {
  openApp: (appId: AppId, params?: any) => void;
  getProjects: () => Promise<Project[]>;
  getTheme: () => string;
  setTheme: (theme: string) => void;
  getWallpaper: () => string;
  setWallpaper: (wallpaper: string) => void;
}

export interface TerminalState {
  history: TerminalHistoryEntry[];
  currentInput: string;
  commandHistory: string[];
  historyIndex: number;
  isProcessing: boolean;
  suggestions: string[];
  showSuggestions: boolean;
}

// Notepad app types
export interface NotepadDocument {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  created: Date;
  markdownMode: boolean;
}

export interface NotepadVersion {
  id: string;
  content: string;
  timestamp: Date;
  title: string;
}

export interface NotepadState {
  documents: Record<string, NotepadDocument>;
  activeDocumentId: string | null;
  versions: Record<string, NotepadVersion[]>; // documentId -> versions
  autoSaveEnabled: boolean;
  markdownPreview: boolean;
  unsavedChanges: Set<string>; // document IDs with unsaved changes
}

// About app types
export interface Institution {
  name: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  gpa?: string;
  honors?: string[];
  description?: string;
}

export interface Company {
  name: string;
  position: string;
  startDate: string;
  endDate?: string;
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'mobile' | 'devops' | 'database' | 'tools' | 'languages';
  proficiency: 1 | 2 | 3 | 4 | 5; // 1 = Beginner, 5 = Expert
  yearsOfExperience: number;
  relatedProjects?: string[]; // Project slugs
}

export interface TimelineMilestone {
  id: string;
  date: string;
  title: string;
  type: 'education' | 'work' | 'project' | 'achievement' | 'certification';
  description: string;
  details?: string[];
  icon?: string;
  company?: string;
  location?: string;
}

export interface ContactInfo {
  email: string;
  linkedin: string;
  github: string;
  website?: string;
  location: string;
  phone?: string;
  leetcode?: string;
}

export interface AboutData {
  institutions: Institution[];
  companies: Company[];
  skills: Skill[];
  timeline: TimelineMilestone[];
  contact: ContactInfo;
}

export interface AboutAppState {
  activeSection: 'overview' | 'experience' | 'skills' | 'timeline' | 'contact';
  expandedMilestone: string | null;
  skillFilter: string | null;
  filteredProjects: string[];
}
