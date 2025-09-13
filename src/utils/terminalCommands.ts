import type { TerminalCommand, TerminalOutput, TerminalContext } from '../types';

// Helper function to create command output
const createOutput = (
  type: TerminalOutput['type'],
  content: string | React.ReactNode
): TerminalOutput => ({
  type,
  content,
  timestamp: new Date(),
});

// Command implementations
const helpCommand: TerminalCommand = {
  id: 'help',
  name: 'help',
  description: 'Display available commands and their usage',
  usage: 'help [command]',
  aliases: ['?', 'h'],
  execute: (args: string[]) => {
    if (args.length > 0) {
      const commandName = args[0];
      const command = terminalCommands.find(cmd => 
        cmd.name === commandName || cmd.aliases?.includes(commandName)
      );
      
      if (command) {
        return createOutput('info', `
${command.name} - ${command.description}
Usage: ${command.usage}
${command.aliases ? `Aliases: ${command.aliases.join(', ')}` : ''}
        `.trim());
      } else {
        return createOutput('error', `Command '${commandName}' not found. Type 'help' to see all commands.`);
      }
    }

    const commandList = terminalCommands
      .map(cmd => `  ${cmd.name.padEnd(12)} - ${cmd.description}`)
      .join('\n');

    return createOutput('info', `
Available commands:

${commandList}

Type 'help <command>' for detailed usage information.
Use Tab for autocompletion and arrow keys for command history.
    `.trim());
  },
};

const clearCommand: TerminalCommand = {
  id: 'clear',
  name: 'clear',
  description: 'Clear the terminal screen',
  usage: 'clear',
  aliases: ['cls'],
  execute: () => {
    // This will be handled specially in the terminal component
    return createOutput('success', '__CLEAR_TERMINAL__');
  },
};

const aboutCommand: TerminalCommand = {
  id: 'about',
  name: 'about',
  description: 'Display information about this portfolio OS',
  usage: 'about',
  execute: () => {
    return createOutput('info', `
Portfolio OS v1.0.0

A browser-based desktop operating system experience showcasing projects and professional experience.

Built with:
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- Framer Motion for animations

Features:
- Window management system
- Virtual file explorer
- Interactive terminal
- Project showcase
- Responsive design
- Accessibility support

Type 'help' to see available commands.
    `.trim());
  },
};

const projectsCommand: TerminalCommand = {
  id: 'projects',
  name: 'projects',
  description: 'List and manage projects',
  usage: 'projects [list|open <slug>|filter <tech>]',
  aliases: ['proj'],
  execute: async (args: string[], context: TerminalContext) => {
    const subcommand = args[0] || 'list';
    const projects = await context.getProjects();

    switch (subcommand) {
      case 'list':
        if (projects.length === 0) {
          return createOutput('info', 'No projects found.');
        }

        const projectList = projects
          .map(project => `  ${project.slug.padEnd(20)} - ${project.title} (${project.year})`)
          .join('\n');

        return createOutput('info', `
Projects (${projects.length} total):

${projectList}

Use 'projects open <slug>' to view a specific project.
Use 'projects filter <tech>' to filter by technology.
        `.trim());

      case 'open':
        const slug = args[1];
        if (!slug) {
          return createOutput('error', 'Please specify a project slug. Use "projects list" to see available projects.');
        }

        const project = projects.find(p => p.slug === slug);
        if (!project) {
          return createOutput('error', `Project '${slug}' not found. Use "projects list" to see available projects.`);
        }

        // Open the projects app with the specific project
        context.openApp('projects', { selectedProject: slug });
        return createOutput('success', `Opening project: ${project.title}`);

      case 'filter':
        const tech = args[1];
        if (!tech) {
          return createOutput('error', 'Please specify a technology to filter by.');
        }

        const filteredProjects = projects.filter(project =>
          project.tech.some(t => t.toLowerCase().includes(tech.toLowerCase()))
        );

        if (filteredProjects.length === 0) {
          return createOutput('info', `No projects found using '${tech}'.`);
        }

        const filteredList = filteredProjects
          .map(project => `  ${project.slug.padEnd(20)} - ${project.title} (${project.tech.join(', ')})`)
          .join('\n');

        return createOutput('info', `
Projects using '${tech}' (${filteredProjects.length} found):

${filteredList}
        `.trim());

      default:
        return createOutput('error', `Unknown subcommand '${subcommand}'. Use 'help projects' for usage information.`);
    }
  },
};

const openCommand: TerminalCommand = {
  id: 'open',
  name: 'open',
  description: 'Open applications or files',
  usage: 'open <app|file>',
  execute: (args: string[], context: TerminalContext) => {
    if (args.length === 0) {
      return createOutput('error', 'Please specify an application or file to open.');
    }

    const target = args[0].toLowerCase();
    
    // Map common app names to app IDs
    const appMap: Record<string, string> = {
      'projects': 'projects',
      'files': 'file-explorer',
      'explorer': 'file-explorer',
      'terminal': 'terminal',
      'about': 'about',
      'notepad': 'notepad',
      'settings': 'settings',
      'resume': 'resume-viewer',
    };

    const appId = appMap[target];
    if (appId) {
      context.openApp(appId as any);
      return createOutput('success', `Opening ${target}...`);
    }

    return createOutput('error', `Unknown application '${target}'. Available apps: ${Object.keys(appMap).join(', ')}`);
  },
};

const themeCommand: TerminalCommand = {
  id: 'theme',
  name: 'theme',
  description: 'Get or set the current theme',
  usage: 'theme [light|dark|auto]',
  execute: (args: string[], context: TerminalContext) => {
    if (args.length === 0) {
      const currentTheme = context.getTheme();
      return createOutput('info', `Current theme: ${currentTheme}`);
    }

    const newTheme = args[0].toLowerCase();
    if (!['light', 'dark', 'auto'].includes(newTheme)) {
      return createOutput('error', 'Invalid theme. Available themes: light, dark, auto');
    }

    context.setTheme(newTheme);
    return createOutput('success', `Theme changed to: ${newTheme}`);
  },
};

const systemCommand: TerminalCommand = {
  id: 'system',
  name: 'system',
  description: 'Display system information',
  usage: 'system [info|status]',
  aliases: ['sys'],
  execute: (args: string[], context: TerminalContext) => {
    const subcommand = args[0] || 'info';

    switch (subcommand) {
      case 'info':
        return createOutput('info', `
System Information:

OS: Portfolio OS v1.0.0
Browser: ${navigator.userAgent.split(' ').pop() || 'Unknown'}
Platform: ${navigator.platform}
Language: ${navigator.language}
Screen: ${screen.width}x${screen.height}
Viewport: ${window.innerWidth}x${window.innerHeight}
Theme: ${context.getTheme()}
Wallpaper: ${context.getWallpaper()}

Memory: ${(performance as any).memory ? 
  `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB used` : 
  'Not available'}
        `.trim());

      case 'status':
        return createOutput('info', `
System Status: ✅ Online
Performance: ✅ Good
Memory: ✅ Normal
Network: ✅ Connected
        `.trim());

      default:
        return createOutput('error', `Unknown subcommand '${subcommand}'. Use 'help system' for usage information.`);
    }
  },
};

// Export all commands
export const terminalCommands: TerminalCommand[] = [
  helpCommand,
  clearCommand,
  aboutCommand,
  projectsCommand,
  openCommand,
  themeCommand,
  systemCommand,
];

// Helper function to find command by name or alias
export const findCommand = (name: string): TerminalCommand | undefined => {
  return terminalCommands.find(cmd => 
    cmd.name === name || cmd.aliases?.includes(name)
  );
};

// Helper function to get all command names and aliases for autocompletion
export const getAllCommandNames = (): string[] => {
  const names: string[] = [];
  terminalCommands.forEach(cmd => {
    names.push(cmd.name);
    if (cmd.aliases) {
      names.push(...cmd.aliases);
    }
  });
  return names.sort();
};

// Helper function to get autocompletion suggestions based on context
export const getAutocompleteSuggestions = async (
  input: string, 
  context: TerminalContext
): Promise<string[]> => {
  const { command, args } = parseCommand(input);
  
  // If no command yet, suggest commands
  if (!args.length && !input.includes(' ')) {
    return getAllCommandNames().filter(name => 
      name.toLowerCase().startsWith(command.toLowerCase())
    );
  }

  // Command-specific autocompletion
  switch (command) {
    case 'projects':
    case 'proj':
      return await getProjectsAutocompletion(args, context);
    
    case 'open':
      return getOpenAutocompletion(args);
    
    case 'theme':
      return getThemeAutocompletion(args);
    
    case 'system':
    case 'sys':
      return getSystemAutocompletion(args);
    
    case 'help':
    case '?':
    case 'h':
      return getHelpAutocompletion(args);
    
    default:
      return [];
  }
};

// Projects command autocompletion
const getProjectsAutocompletion = async (
  args: string[], 
  context: TerminalContext
): Promise<string[]> => {
  if (args.length === 0) {
    return ['list', 'open', 'filter'];
  }
  
  const subcommand = args[0];
  
  if (subcommand === 'open' && args.length === 1) {
    // Suggest project slugs
    const projects = await context.getProjects();
    return projects.map(p => p.slug);
  }
  
  if (subcommand === 'filter' && args.length === 1) {
    // Suggest technologies
    const projects = await context.getProjects();
    const techSet = new Set<string>();
    projects.forEach(project => {
      project.tech.forEach(tech => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }
  
  return [];
};

// Open command autocompletion
const getOpenAutocompletion = (args: string[]): string[] => {
  if (args.length === 0) {
    return ['projects', 'files', 'explorer', 'terminal', 'about', 'notepad', 'settings', 'resume'];
  }
  return [];
};

// Theme command autocompletion
const getThemeAutocompletion = (args: string[]): string[] => {
  if (args.length === 0) {
    return ['light', 'dark', 'auto'];
  }
  return [];
};

// System command autocompletion
const getSystemAutocompletion = (args: string[]): string[] => {
  if (args.length === 0) {
    return ['info', 'status'];
  }
  return [];
};

// Help command autocompletion
const getHelpAutocompletion = (args: string[]): string[] => {
  if (args.length === 0) {
    return getAllCommandNames();
  }
  return [];
};

// Helper function to parse command input
export const parseCommand = (input: string): { command: string; args: string[] } => {
  const parts = input.trim().split(/\s+/);
  const command = parts[0] || '';
  const args = parts.slice(1);
  return { command, args };
};