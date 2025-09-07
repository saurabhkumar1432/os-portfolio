import { describe, it, expect, beforeEach } from 'vitest';
import { useTerminalStore } from '../terminalStore';
import type { TerminalOutput } from '../../types';

describe('terminalStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTerminalStore.setState({
      history: [],
      currentInput: '',
      commandHistory: [],
      historyIndex: -1,
      isProcessing: false,
      suggestions: [],
      showSuggestions: false,
    });
  });

  describe('setCurrentInput', () => {
    it('should update current input', () => {
      const { setCurrentInput } = useTerminalStore.getState();
      setCurrentInput('test command');
      
      expect(useTerminalStore.getState().currentInput).toBe('test command');
    });
  });

  describe('addToHistory', () => {
    it('should add command and output to history', () => {
      const { addToHistory } = useTerminalStore.getState();
      const output: TerminalOutput = {
        type: 'success',
        content: 'Command executed successfully',
        timestamp: new Date(),
      };

      addToHistory('test command', [output]);

      const state = useTerminalStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.history[0].command).toBe('test command');
      expect(state.history[0].output).toEqual([output]);
      expect(state.history[0].timestamp).toBeInstanceOf(Date);
    });

    it('should maintain history order', () => {
      const { addToHistory } = useTerminalStore.getState();
      const output1: TerminalOutput = { type: 'info', content: 'First', timestamp: new Date() };
      const output2: TerminalOutput = { type: 'info', content: 'Second', timestamp: new Date() };

      addToHistory('first', [output1]);
      addToHistory('second', [output2]);

      const state = useTerminalStore.getState();
      expect(state.history).toHaveLength(2);
      expect(state.history[0].command).toBe('first');
      expect(state.history[1].command).toBe('second');
    });
  });

  describe('addToCommandHistory', () => {
    it('should add command to command history', () => {
      const { addToCommandHistory } = useTerminalStore.getState();
      addToCommandHistory('test command');

      const state = useTerminalStore.getState();
      expect(state.commandHistory).toEqual(['test command']);
      expect(state.historyIndex).toBe(-1);
    });

    it('should not add empty commands', () => {
      const { addToCommandHistory } = useTerminalStore.getState();
      addToCommandHistory('');
      addToCommandHistory('   ');

      const state = useTerminalStore.getState();
      expect(state.commandHistory).toHaveLength(0);
    });

    it('should not add duplicate consecutive commands', () => {
      const { addToCommandHistory } = useTerminalStore.getState();
      addToCommandHistory('test command');
      addToCommandHistory('test command');

      const state = useTerminalStore.getState();
      expect(state.commandHistory).toEqual(['test command']);
    });

    it('should allow duplicate non-consecutive commands', () => {
      const { addToCommandHistory } = useTerminalStore.getState();
      addToCommandHistory('first');
      addToCommandHistory('second');
      addToCommandHistory('first');

      const state = useTerminalStore.getState();
      expect(state.commandHistory).toEqual(['first', 'second', 'first']);
    });

    it('should limit history to 100 commands', () => {
      const { addToCommandHistory } = useTerminalStore.getState();
      
      // Add 101 commands
      for (let i = 0; i < 101; i++) {
        addToCommandHistory(`command ${i}`);
      }

      const state = useTerminalStore.getState();
      expect(state.commandHistory).toHaveLength(100);
      expect(state.commandHistory[0]).toBe('command 1'); // First command removed
      expect(state.commandHistory[99]).toBe('command 100'); // Last command kept
    });
  });

  describe('setHistoryIndex', () => {
    it('should update history index', () => {
      const { setHistoryIndex } = useTerminalStore.getState();
      setHistoryIndex(5);

      expect(useTerminalStore.getState().historyIndex).toBe(5);
    });
  });

  describe('getCurrentHistoryCommand', () => {
    it('should return correct command for valid index', () => {
      const { addToCommandHistory, setHistoryIndex, getCurrentHistoryCommand } = useTerminalStore.getState();
      addToCommandHistory('first');
      addToCommandHistory('second');
      addToCommandHistory('third');

      setHistoryIndex(0); // Most recent (third)
      expect(getCurrentHistoryCommand()).toBe('third');

      setHistoryIndex(1); // Second most recent
      expect(getCurrentHistoryCommand()).toBe('second');

      setHistoryIndex(2); // Oldest
      expect(getCurrentHistoryCommand()).toBe('first');
    });

    it('should return null for invalid index', () => {
      const { addToCommandHistory, setHistoryIndex, getCurrentHistoryCommand } = useTerminalStore.getState();
      addToCommandHistory('test');

      setHistoryIndex(-1);
      expect(getCurrentHistoryCommand()).toBeNull();

      setHistoryIndex(5);
      expect(getCurrentHistoryCommand()).toBeNull();
    });

    it('should return null for empty history', () => {
      const { setHistoryIndex, getCurrentHistoryCommand } = useTerminalStore.getState();
      setHistoryIndex(0);

      expect(getCurrentHistoryCommand()).toBeNull();
    });
  });

  describe('getFilteredSuggestions', () => {
    beforeEach(() => {
      const { setSuggestions } = useTerminalStore.getState();
      setSuggestions(['help', 'history', 'clear', 'about', 'projects']);
    });

    it('should return matching suggestions', () => {
      const { getFilteredSuggestions } = useTerminalStore.getState();
      const results = getFilteredSuggestions('he');

      expect(results).toEqual(['help']);
    });

    it('should return multiple matches', () => {
      const { getFilteredSuggestions } = useTerminalStore.getState();
      const results = getFilteredSuggestions('h');

      expect(results).toEqual(['help', 'history']);
    });

    it('should be case insensitive', () => {
      const { getFilteredSuggestions } = useTerminalStore.getState();
      const results = getFilteredSuggestions('HE');

      expect(results).toEqual(['help']);
    });

    it('should return empty array for no matches', () => {
      const { getFilteredSuggestions } = useTerminalStore.getState();
      const results = getFilteredSuggestions('xyz');

      expect(results).toEqual([]);
    });

    it('should return empty array for empty input', () => {
      const { getFilteredSuggestions } = useTerminalStore.getState();
      const results = getFilteredSuggestions('');

      expect(results).toEqual([]);
    });

    it('should limit results to 5 suggestions', () => {
      const { setSuggestions, getFilteredSuggestions } = useTerminalStore.getState();
      setSuggestions([
        'command1', 'command2', 'command3', 
        'command4', 'command5', 'command6', 'command7'
      ]);
      
      const results = getFilteredSuggestions('command');

      expect(results).toHaveLength(5);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      const { addToHistory, clearHistory } = useTerminalStore.getState();
      const output: TerminalOutput = { type: 'info', content: 'test', timestamp: new Date() };
      
      addToHistory('test1', [output]);
      addToHistory('test2', [output]);

      expect(useTerminalStore.getState().history).toHaveLength(2);

      clearHistory();

      expect(useTerminalStore.getState().history).toHaveLength(0);
    });
  });

  describe('processing state', () => {
    it('should update processing state', () => {
      const { setIsProcessing } = useTerminalStore.getState();
      
      expect(useTerminalStore.getState().isProcessing).toBe(false);

      setIsProcessing(true);
      expect(useTerminalStore.getState().isProcessing).toBe(true);

      setIsProcessing(false);
      expect(useTerminalStore.getState().isProcessing).toBe(false);
    });
  });

  describe('suggestions state', () => {
    it('should update suggestions', () => {
      const { setSuggestions } = useTerminalStore.getState();
      const suggestions = ['help', 'clear', 'about'];

      setSuggestions(suggestions);
      expect(useTerminalStore.getState().suggestions).toEqual(suggestions);
    });

    it('should update show suggestions flag', () => {
      const { setShowSuggestions } = useTerminalStore.getState();

      expect(useTerminalStore.getState().showSuggestions).toBe(false);

      setShowSuggestions(true);
      expect(useTerminalStore.getState().showSuggestions).toBe(true);

      setShowSuggestions(false);
      expect(useTerminalStore.getState().showSuggestions).toBe(false);
    });
  });
});