import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { TerminalState, TerminalHistoryEntry, TerminalOutput } from '../types';

interface TerminalStore extends TerminalState {
  // Actions
  setCurrentInput: (input: string) => void;
  addToHistory: (command: string, output: TerminalOutput[]) => void;
  addToCommandHistory: (command: string) => void;
  setHistoryIndex: (index: number) => void;
  setIsProcessing: (processing: boolean) => void;
  setSuggestions: (suggestions: string[]) => void;
  setShowSuggestions: (show: boolean) => void;
  clearHistory: () => void;
  
  // Computed
  getCurrentHistoryCommand: () => string | null;
  getFilteredSuggestions: (input: string) => string[];
}

const initialState: TerminalState = {
  history: [],
  currentInput: '',
  commandHistory: [],
  historyIndex: -1,
  isProcessing: false,
  suggestions: [],
  showSuggestions: false,
};

export const useTerminalStore = create<TerminalStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentInput: (input: string) => {
        set({ currentInput: input });
      },

      addToHistory: (command: string, output: TerminalOutput[]) => {
        const entry: TerminalHistoryEntry = {
          command,
          output,
          timestamp: new Date(),
        };
        
        set((state) => ({
          history: [...state.history, entry],
        }));
      },

      addToCommandHistory: (command: string) => {
        set((state) => {
          // Don't add empty commands or duplicates of the last command
          if (!command.trim() || state.commandHistory[state.commandHistory.length - 1] === command) {
            return state;
          }
          
          const newHistory = [...state.commandHistory, command];
          // Keep only last 100 commands
          if (newHistory.length > 100) {
            newHistory.shift();
          }
          
          return {
            commandHistory: newHistory,
            historyIndex: -1, // Reset history index
          };
        });
      },

      setHistoryIndex: (index: number) => {
        set({ historyIndex: index });
      },

      setIsProcessing: (processing: boolean) => {
        set({ isProcessing: processing });
      },

      setSuggestions: (suggestions: string[]) => {
        set({ suggestions });
      },

      setShowSuggestions: (show: boolean) => {
        set({ showSuggestions: show });
      },

      clearHistory: () => {
        set({ history: [] });
      },

      getCurrentHistoryCommand: () => {
        const { commandHistory, historyIndex } = get();
        if (historyIndex >= 0 && historyIndex < commandHistory.length) {
          return commandHistory[commandHistory.length - 1 - historyIndex];
        }
        return null;
      },

      getFilteredSuggestions: (input: string) => {
        const { suggestions } = get();
        if (!input.trim()) return [];
        
        return suggestions.filter(suggestion =>
          suggestion.toLowerCase().startsWith(input.toLowerCase())
        ).slice(0, 5); // Limit to 5 suggestions
      },
    }),
    {
      name: 'terminal-store',
    }
  )
);