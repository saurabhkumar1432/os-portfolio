import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Clock, 
  FileText, 
  Settings, 
  Calculator,
  Palette,
  Moon,
  Sun,
  Monitor,
  Command
} from 'lucide-react';
import { useWindowStore } from '../../store/windowStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { appRegistry } from '../../services/appRegistry';
import type { AppId } from '../../types';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string[];
  action: () => void;
  category: 'apps' | 'actions' | 'settings' | 'recent';
  keywords?: string[];
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const { createWindow } = useWindowStore();
  const { theme, setTheme, setWallpaper, resetPreferences } = usePreferencesStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  // Generate command items
  const generateCommands = useCallback((): CommandItem[] => {
    const commands: CommandItem[] = [];

    // App launching commands
    const apps = appRegistry.getAllApps();
    apps.forEach(app => {
      commands.push({
        id: `app-${app.id}`,
        label: `Open ${app.name}`,
        description: `Launch ${app.name} application`,
        icon: <FileText className="w-4 h-4" />,
        action: () => {
          createWindow(app.id as AppId);
          setIsOpen(false);
        },
        category: 'apps',
        keywords: [app.name.toLowerCase(), 'open', 'launch', 'app']
      });
    });

    // Theme commands
    commands.push(
      {
        id: 'theme-light',
        label: 'Switch to Light Theme',
        description: 'Use light color scheme',
        icon: <Sun className="w-4 h-4" />,
        action: () => {
          setTheme('light');
          setIsOpen(false);
        },
        category: 'settings',
        keywords: ['theme', 'light', 'bright', 'appearance']
      },
      {
        id: 'theme-dark',
        label: 'Switch to Dark Theme',
        description: 'Use dark color scheme',
        icon: <Moon className="w-4 h-4" />,
        action: () => {
          setTheme('dark');
          setIsOpen(false);
        },
        category: 'settings',
        keywords: ['theme', 'dark', 'night', 'appearance']
      },
      {
        id: 'theme-auto',
        label: 'Auto Theme',
        description: 'Follow system theme',
        icon: <Monitor className="w-4 h-4" />,
        action: () => {
          setTheme('auto');
          setIsOpen(false);
        },
        category: 'settings',
        keywords: ['theme', 'auto', 'system', 'appearance']
      }
    );

    // Settings commands
    commands.push(
      {
        id: 'settings-reset',
        label: 'Reset All Settings',
        description: 'Restore default preferences',
        icon: <Settings className="w-4 h-4" />,
        action: () => {
          if (confirm('Are you sure you want to reset all settings?')) {
            resetPreferences();
            setIsOpen(false);
          }
        },
        category: 'settings',
        keywords: ['reset', 'default', 'restore', 'settings']
      },
      {
        id: 'wallpaper-change',
        label: 'Change Wallpaper',
        description: 'Select a new desktop background',
        icon: <Palette className="w-4 h-4" />,
        action: () => {
          createWindow('settings' as AppId);
          setIsOpen(false);
        },
        category: 'settings',
        keywords: ['wallpaper', 'background', 'desktop', 'appearance']
      }
    );

    // Quick actions
    commands.push(
      {
        id: 'calculator',
        label: 'Quick Calculate',
        description: 'Perform calculations',
        icon: <Calculator className="w-4 h-4" />,
        shortcut: ['Ctrl', 'C'],
        action: () => {
          // Will be implemented with calculator app
          alert('Calculator coming soon!');
          setIsOpen(false);
        },
        category: 'actions',
        keywords: ['calculate', 'math', 'calculator']
      },
      {
        id: 'time',
        label: 'Current Time',
        description: new Date().toLocaleTimeString(),
        icon: <Clock className="w-4 h-4" />,
        action: () => {
          setIsOpen(false);
        },
        category: 'actions',
        keywords: ['time', 'clock', 'date']
      }
    );

    return commands;
  }, [createWindow, setTheme, resetPreferences, setWallpaper]);

  const [commands] = useState<CommandItem[]>(generateCommands);

  // Filter commands based on search
  const filteredCommands = commands.filter(cmd => {
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some(k => k.includes(searchLower))
    );
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const categoryLabels: Record<string, string> = {
    apps: 'Applications',
    actions: 'Quick Actions',
    settings: 'Settings',
    recent: 'Recent'
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        return;
      }

      if (!isOpen) return;

      // Close with Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        setSearch('');
        setSelectedIndex(0);
        return;
      }

      // Navigate with arrow keys
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }

      // Execute with Enter
      if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-start justify-center pt-32 px-4"
        onClick={() => setIsOpen(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Command Palette */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden ${
            isDark ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'
          } backdrop-blur-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className={`flex-1 bg-transparent outline-none text-base ${
                isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
              }`}
              autoFocus
            />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <kbd className={`px-2 py-1 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>ESC</kbd>
              <span>to close</span>
            </div>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No commands found
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category} className="py-2">
                  <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {categoryLabels[category]}
                  </div>
                  {items.map((cmd) => {
                    const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        className={`w-full flex items-center gap-3 px-4 py-2 transition-colors ${
                          isSelected
                            ? isDark
                              ? 'bg-blue-600/20 text-blue-400'
                              : 'bg-blue-50 text-blue-600'
                            : isDark
                            ? 'text-gray-300 hover:bg-gray-800'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded ${
                          isSelected
                            ? isDark ? 'bg-blue-600/30' : 'bg-blue-100'
                            : isDark ? 'bg-gray-800' : 'bg-gray-100'
                        }`}>
                          {cmd.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">{cmd.label}</div>
                          {cmd.description && (
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {cmd.description}
                            </div>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <div className="flex items-center gap-1">
                            {cmd.shortcut.map((key, i) => (
                              <kbd
                                key={i}
                                className={`px-2 py-1 text-xs rounded ${
                                  isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between px-4 py-2 text-xs border-t ${
            isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
          }`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <span>+</span>
                <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>K</kbd>
                <span className="ml-1">to open</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>↑↓</kbd>
              <span>navigate</span>
              <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>↵</kbd>
              <span>select</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
