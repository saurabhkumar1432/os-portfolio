import { useCallback, useEffect, useRef } from 'react';
import { useTerminalStore } from '../store/terminalStore';
import { useWindowStore } from '../store/windowStore';
import { usePreferencesStore } from '../store/preferencesStore';
import { projectService } from '../services/projectService';
import { findCommand, getAllCommandNames, parseCommand, getAutocompleteSuggestions } from '../utils/terminalCommands';
import type { TerminalContext, TerminalOutput, Project, AppId } from '../types';

export const useTerminal = (windowId: string) => {
  const terminalStore = useTerminalStore();
  const windowStore = useWindowStore();
  const preferencesStore = usePreferencesStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Create terminal context
  const createContext = useCallback((): TerminalContext => ({
    openApp: (appId: AppId, params?: any) => {
      windowStore.createWindow(appId, params);
    },
    getProjects: async (): Promise<Project[]> => {
      return await projectService.getAllProjects();
    },
    getTheme: () => preferencesStore.theme,
    setTheme: (theme: string) => preferencesStore.setTheme(theme as any),
    getWallpaper: () => preferencesStore.wallpaper,
    setWallpaper: (wallpaper: string) => preferencesStore.setWallpaper(wallpaper),
  }), [windowStore, preferencesStore]);

  // Execute command
  const executeCommand = useCallback(async (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    terminalStore.setIsProcessing(true);
    
    try {
      const { command, args } = parseCommand(trimmedInput);
      const cmd = findCommand(command);

      if (!cmd) {
        const output: TerminalOutput = {
          type: 'error',
          content: `Command '${command}' not found. Type 'help' to see available commands.`,
          timestamp: new Date(),
        };
        terminalStore.addToHistory(trimmedInput, [output]);
      } else {
        const context = createContext();
        const result = await cmd.execute(args, context);
        
        // Handle special commands
        if (result.content === '__CLEAR_TERMINAL__') {
          terminalStore.clearHistory();
        } else {
          terminalStore.addToHistory(trimmedInput, [result]);
        }
      }

      // Add to command history
      terminalStore.addToCommandHistory(trimmedInput);
      
    } catch (error) {
      const output: TerminalOutput = {
        type: 'error',
        content: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      terminalStore.addToHistory(trimmedInput, [output]);
    } finally {
      terminalStore.setIsProcessing(false);
      terminalStore.setCurrentInput('');
    }
  }, [terminalStore, createContext]);

  // Handle input change
  const handleInputChange = useCallback(async (value: string) => {
    terminalStore.setCurrentInput(value);
    
    // Update suggestions for autocompletion
    if (value.trim()) {
      try {
        const context = createContext();
        const suggestions = await getAutocompleteSuggestions(value, context);
        terminalStore.setSuggestions(suggestions);
        terminalStore.setShowSuggestions(suggestions.length > 0);
      } catch (error) {
        // Fallback to basic command suggestions
        const { command } = parseCommand(value);
        const allCommands = getAllCommandNames();
        const suggestions = allCommands.filter(cmd =>
          cmd.toLowerCase().startsWith(command.toLowerCase())
        );
        terminalStore.setSuggestions(suggestions);
        terminalStore.setShowSuggestions(suggestions.length > 0 && command.length > 0);
      }
    } else {
      terminalStore.setShowSuggestions(false);
    }
  }, [terminalStore, createContext]);

  // Handle key press
  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key, ctrlKey } = event;

    switch (key) {
      case 'Enter':
        event.preventDefault();
        executeCommand(terminalStore.currentInput);
        break;

      case 'Tab':
        event.preventDefault();
        // Autocompletion
        const suggestions = terminalStore.getFilteredSuggestions(terminalStore.currentInput);
        if (suggestions.length === 1) {
          // Complete with the single suggestion
          const parts = terminalStore.currentInput.split(' ');
          const lastPart = parts[parts.length - 1];
          const suggestion = suggestions[0];
          
          if (suggestion.toLowerCase().startsWith(lastPart.toLowerCase())) {
            parts[parts.length - 1] = suggestion;
            const newInput = parts.join(' ') + ' ';
            handleInputChange(newInput);
          }
        } else if (suggestions.length > 1) {
          // Show all suggestions
          const output: TerminalOutput = {
            type: 'info',
            content: `Available completions: ${suggestions.join(', ')}`,
            timestamp: new Date(),
          };
          terminalStore.addToHistory(terminalStore.currentInput, [output]);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        // Navigate command history up
        const currentIndex = terminalStore.historyIndex;
        const maxIndex = terminalStore.commandHistory.length - 1;
        if (currentIndex < maxIndex) {
          const newIndex = currentIndex + 1;
          terminalStore.setHistoryIndex(newIndex);
          const historyCommand = terminalStore.getCurrentHistoryCommand();
          if (historyCommand) {
            handleInputChange(historyCommand);
          }
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        // Navigate command history down
        const currentDownIndex = terminalStore.historyIndex;
        if (currentDownIndex > 0) {
          const newIndex = currentDownIndex - 1;
          terminalStore.setHistoryIndex(newIndex);
          const historyCommand = terminalStore.getCurrentHistoryCommand();
          if (historyCommand) {
            handleInputChange(historyCommand);
          }
        } else if (currentDownIndex === 0) {
          terminalStore.setHistoryIndex(-1);
          handleInputChange('');
        }
        break;

      case 'c':
        if (ctrlKey) {
          event.preventDefault();
          // Cancel current input
          handleInputChange('');
          terminalStore.setIsProcessing(false);
        }
        break;

      case 'l':
        if (ctrlKey) {
          event.preventDefault();
          // Clear terminal
          terminalStore.clearHistory();
        }
        break;

      case 'Escape':
        event.preventDefault();
        // Hide suggestions and clear input
        terminalStore.setShowSuggestions(false);
        handleInputChange('');
        break;
    }
  }, [terminalStore, executeCommand, handleInputChange]);

  // Focus input when terminal becomes focused
  useEffect(() => {
    const window = windowStore.windows[windowId];
    if (window?.focused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [windowStore.windows, windowId]);

  // Initialize with welcome message
  useEffect(() => {
    if (terminalStore.history.length === 0) {
      const welcomeOutput: TerminalOutput = {
        type: 'info',
        content: `Welcome to Portfolio OS Terminal v1.0.0

Type 'help' to see available commands.
Use Tab for autocompletion and arrow keys for command history.

Ready for input...`,
        timestamp: new Date(),
      };
      terminalStore.addToHistory('', [welcomeOutput]);
    }
  }, [terminalStore]);

  return {
    ...terminalStore,
    inputRef,
    executeCommand,
    handleInputChange,
    handleKeyPress,
  };
};