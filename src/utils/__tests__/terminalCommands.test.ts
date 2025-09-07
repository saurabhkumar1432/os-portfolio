import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  terminalCommands, 
  findCommand, 
  getAllCommandNames, 
  parseCommand,
  getAutocompleteSuggestions
} from '../terminalCommands';
import type { TerminalContext } from '../../types';

// Mock terminal context
const createMockContext = (): TerminalContext => ({
  openApp: vi.fn(),
  getProjects: vi.fn(async () => [
    {
      slug: 'test-project',
      title: 'Test Project',
      summary: 'A test project',
      description: 'Test description',
      year: 2024,
      role: 'Developer',
      tech: ['React', 'TypeScript'],
      type: 'web' as const,
      featured: true,
      complexity: 3,
    }
  ]),
  getTheme: vi.fn(() => 'dark'),
  setTheme: vi.fn(),
  getWallpaper: vi.fn(() => 'default.jpg'),
  setWallpaper: vi.fn(),
});

describe('terminalCommands', () => {
  let mockContext: TerminalContext;

  beforeEach(() => {
    mockContext = createMockContext();
    vi.clearAllMocks();
  });

  describe('parseCommand', () => {
    it('should parse simple command', () => {
      const result = parseCommand('help');
      expect(result).toEqual({ command: 'help', args: [] });
    });

    it('should parse command with arguments', () => {
      const result = parseCommand('projects open test-project');
      expect(result).toEqual({ 
        command: 'projects', 
        args: ['open', 'test-project'] 
      });
    });

    it('should handle extra whitespace', () => {
      const result = parseCommand('  help   arg1   arg2  ');
      expect(result).toEqual({ 
        command: 'help', 
        args: ['arg1', 'arg2'] 
      });
    });

    it('should handle empty input', () => {
      const result = parseCommand('');
      expect(result).toEqual({ command: '', args: [] });
    });
  });

  describe('findCommand', () => {
    it('should find command by name', () => {
      const command = findCommand('help');
      expect(command).toBeDefined();
      expect(command?.name).toBe('help');
    });

    it('should find command by alias', () => {
      const command = findCommand('?');
      expect(command).toBeDefined();
      expect(command?.name).toBe('help');
    });

    it('should return undefined for non-existent command', () => {
      const command = findCommand('nonexistent');
      expect(command).toBeUndefined();
    });
  });

  describe('getAllCommandNames', () => {
    it('should return all command names and aliases', () => {
      const names = getAllCommandNames();
      
      expect(names).toContain('help');
      expect(names).toContain('?');
      expect(names).toContain('clear');
      expect(names).toContain('cls');
      expect(names).toContain('about');
      expect(names).toContain('projects');
      expect(names).toContain('open');
      expect(names).toContain('theme');
      expect(names).toContain('system');
    });

    it('should return sorted names', () => {
      const names = getAllCommandNames();
      const sortedNames = [...names].sort();
      
      expect(names).toEqual(sortedNames);
    });
  });

  describe('help command', () => {
    it('should show all commands when no arguments', async () => {
      const helpCommand = findCommand('help')!;
      const result = await helpCommand.execute([], mockContext);

      expect(result.type).toBe('info');
      expect(result.content).toContain('Available commands:');
      expect(result.content).toContain('help');
      expect(result.content).toContain('clear');
      expect(result.content).toContain('about');
    });

    it('should show specific command help', async () => {
      const helpCommand = findCommand('help')!;
      const result = await helpCommand.execute(['clear'], mockContext);

      expect(result.type).toBe('info');
      expect(result.content).toContain('clear - Clear the terminal screen');
      expect(result.content).toContain('Usage: clear');
    });

    it('should show error for non-existent command', async () => {
      const helpCommand = findCommand('help')!;
      const result = await helpCommand.execute(['nonexistent'], mockContext);

      expect(result.type).toBe('error');
      expect(result.content).toContain('Command \'nonexistent\' not found');
    });
  });

  describe('clear command', () => {
    it('should return clear signal', async () => {
      const clearCommand = findCommand('clear')!;
      const result = await clearCommand.execute([], mockContext);

      expect(result.type).toBe('success');
      expect(result.content).toBe('__CLEAR_TERMINAL__');
    });
  });

  describe('about command', () => {
    it('should show portfolio information', async () => {
      const aboutCommand = findCommand('about')!;
      const result = await aboutCommand.execute([], mockContext);

      expect(result.type).toBe('info');
      expect(result.content).toContain('Portfolio OS v1.0.0');
      expect(result.content).toContain('React 18 + TypeScript');
      expect(result.content).toContain('Vite for build tooling');
    });
  });

  describe('projects command', () => {
    it('should list projects by default', async () => {
      const projectsCommand = findCommand('projects')!;
      const result = await projectsCommand.execute([], mockContext);

      expect(result.type).toBe('info');
      expect(result.content).toContain('Projects (1 total):');
      expect(result.content).toContain('test-project');
      expect(result.content).toContain('Test Project');
    });

    it('should list projects with explicit list command', async () => {
      const projectsCommand = findCommand('projects')!;
      const result = await projectsCommand.execute(['list'], mockContext);

      expect(result.type).toBe('info');
      expect(result.content).toContain('Projects (1 total):');
    });

    it('should open specific project', async () => {
      const projectsCommand = findCommand('projects')!;
      const result = await projectsCommand.execute(['open', 'test-project'], mockContext);

      expect(result.type).toBe('success');
      expect(result.content).toContain('Opening project: Test Project');
      expect(mockContext.openApp).toHaveBeenCalledWith('projects', { selectedProject: 'test-project' });
    });

    it('should show error for non-existent project', async () => {
      const projectsCommand = findCommand('projects')!;
      const result = await projectsCommand.execute(['open', 'nonexistent'], mockContext);

      expect(result.type).toBe('error');
      expect(result.content).toContain('Project \'nonexistent\' not found');
    });

    it('should filter projects by technology', async () => {
      const projectsCommand = findCommand('projects')!;
      const result = await projectsCommand.execute(['filter', 'React'], mockContext);

      expect(result.type).toBe('info');
      expect(result.content).toContain('Projects using \'React\'');
      expect(result.content).toContain('test-project');
    });

    it('should show no results for non-matching technology', async () => {
      const projectsCommand = findCommand('projects')!;
      const result = await projectsCommand.execute(['filter', 'Python'], mockContext);

      expect(result.type).toBe('info');
      expect(result.content).toContain('No projects found using \'Python\'');
    });
  });

  describe('open command', () => {
    it('should open valid application', async () => {
      const openCommand = findCommand('open')!;
      const result = await openCommand.execute(['projects'], mockContext);

      expect(result.type).toBe('success');
      expect(result.content).toContain('Opening projects...');
      expect(mockContext.openApp).toHaveBeenCalledWith('projects');
    });

    it('should handle application aliases', async () => {
      const openCommand = findCommand('open')!;
      const result = await openCommand.execute(['files'], mockContext);

      expect(result.type).toBe('success');
      expect(result.content).toContain('Opening files...');
      expect(mockContext.openApp).toHaveBeenCalledWith('file-explorer');
    });

    it('should show error for unknown application', async () => {
      const openCommand = findCommand('open')!;
      const result = await openCommand.execute(['unknown'], mockContext);

      expect(result.type).toBe('error');
      expect(result.content).toContain('Unknown application \'unknown\'');
    });

    it('should show error when no argument provided', async () => {
      const openCommand = findCommand('open')!;
      const result = await openCommand.execute([], mockContext);

      expect(result.type).toBe('error');
      expect(result.content).toContain('Please specify an application or file to open');
    });
  });

  describe('theme command', () => {
    it('should show current theme when no arguments', async () => {
      const themeCommand = findCommand('theme')!;
      const result = await themeCommand.execute([], mockContext);

      expect(result.type).toBe('info');
      expect(result.content).toContain('Current theme: dark');
    });

    it('should set valid theme', async () => {
      const themeCommand = findCommand('theme')!;
      const result = await themeCommand.execute(['light'], mockContext);

      expect(result.type).toBe('success');
      expect(result.content).toContain('Theme changed to: light');
      expect(mockContext.setTheme).toHaveBeenCalledWith('light');
    });

    it('should show error for invalid theme', async () => {
      const themeCommand = findCommand('theme')!;
      const result = await themeCommand.execute(['invalid'], mockContext);

      expect(result.type).toBe('error');
      expect(result.content).toContain('Invalid theme. Available themes: light, dark, auto');
    });
  });

  describe('system command', () => {
    it('should show system info by default', async () => {
      const systemCommand = findCommand('system')!;
      const result = await systemCommand.execute([], mockContext);

      expect(result.type).toBe('info');
      expect(result.content).toContain('System Information:');
      expect(result.content).toContain('OS: Portfolio OS v1.0.0');
      expect(result.content).toContain('Theme: dark');
    });

    it('should show system status', async () => {
      const systemCommand = findCommand('system')!;
      const result = await systemCommand.execute(['status'], mockContext);

      expect(result.type).toBe('info');
      expect(result.content).toContain('System Status: ✅ Online');
      expect(result.content).toContain('Performance: ✅ Good');
    });

    it('should show error for unknown subcommand', async () => {
      const systemCommand = findCommand('system')!;
      const result = await systemCommand.execute(['unknown'], mockContext);

      expect(result.type).toBe('error');
      expect(result.content).toContain('Unknown subcommand \'unknown\'');
    });
  });

  describe('getAutocompleteSuggestions', () => {
    it('should suggest commands for partial input', async () => {
      const suggestions = await getAutocompleteSuggestions('he', mockContext);
      expect(suggestions).toContain('help');
    });

    it('should suggest project subcommands', async () => {
      const suggestions = await getAutocompleteSuggestions('projects ', mockContext);
      expect(suggestions).toEqual(['list', 'open', 'filter']);
    });

    it('should suggest project slugs for open command', async () => {
      const suggestions = await getAutocompleteSuggestions('projects open ', mockContext);
      expect(suggestions).toContain('test-project');
    });

    it('should suggest technologies for filter command', async () => {
      const suggestions = await getAutocompleteSuggestions('projects filter ', mockContext);
      expect(suggestions).toContain('React');
      expect(suggestions).toContain('TypeScript');
    });

    it('should suggest apps for open command', async () => {
      const suggestions = await getAutocompleteSuggestions('open ', mockContext);
      expect(suggestions).toContain('projects');
      expect(suggestions).toContain('files');
      expect(suggestions).toContain('terminal');
    });

    it('should suggest themes for theme command', async () => {
      const suggestions = await getAutocompleteSuggestions('theme ', mockContext);
      expect(suggestions).toEqual(['light', 'dark', 'auto']);
    });

    it('should suggest system subcommands', async () => {
      const suggestions = await getAutocompleteSuggestions('system ', mockContext);
      expect(suggestions).toEqual(['info', 'status']);
    });

    it('should suggest commands for help command', async () => {
      const suggestions = await getAutocompleteSuggestions('help ', mockContext);
      expect(suggestions).toContain('help');
      expect(suggestions).toContain('clear');
      expect(suggestions).toContain('projects');
    });

    it('should return empty array for unknown commands', async () => {
      const suggestions = await getAutocompleteSuggestions('unknown ', mockContext);
      expect(suggestions).toEqual([]);
    });
  });
});