import React, { useEffect, useRef } from 'react';
import { useTerminal } from '../hooks/useTerminal';
import type { AppProps, TerminalOutput } from '../types';

/**
 * Terminal application component
 * Provides a functional command-line interface for portfolio navigation
 */
const TerminalApp: React.FC<AppProps> = ({ windowId, focused, onTitleChange }) => {
  const terminal = useTerminal(windowId);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onTitleChange('Terminal');
  }, [onTitleChange]);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [terminal.history]);

  // Format timestamp for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Get output color based on type
  const getOutputColor = (type: TerminalOutput['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'info':
      default:
        return 'text-gray-300';
    }
  };

  // Render output content
  const renderOutput = (output: TerminalOutput) => {
    if (typeof output.content === 'string') {
      return (
        <pre className={`whitespace-pre-wrap ${getOutputColor(output.type)}`}>
          {output.content}
        </pre>
      );
    }
    return <div className={getOutputColor(output.type)}>{output.content}</div>;
  };

  return (
    <div className="h-full bg-gray-900 text-gray-100 font-mono text-sm flex flex-col">
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-gray-400 text-xs">
          Portfolio OS Terminal - {formatTime(new Date())}
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {terminal.history.map((entry, index) => (
          <div key={index} className="space-y-1">
            {/* Command input */}
            {entry.command && (
              <div className="flex items-center space-x-2">
                <span className="text-green-400">$</span>
                <span className="text-white">{entry.command}</span>
                <span className="text-gray-500 text-xs ml-auto">
                  {formatTime(entry.timestamp)}
                </span>
              </div>
            )}
            
            {/* Command output */}
            {entry.output.map((output, outputIndex) => (
              <div key={outputIndex} className="ml-4">
                {renderOutput(output)}
              </div>
            ))}
          </div>
        ))}

        {/* Current input line */}
        <div className="flex items-center space-x-2">
          <span className="text-green-400">$</span>
          <div className="flex-1 relative">
            <input
              ref={terminal.inputRef}
              type="text"
              value={terminal.currentInput}
              onChange={(e) => {
                // Handle async input change
                terminal.handleInputChange(e.target.value).catch(console.error);
              }}
              onKeyDown={terminal.handleKeyPress}
              className="w-full bg-transparent text-white outline-none"
              placeholder={terminal.isProcessing ? 'Processing...' : 'Type a command...'}
              disabled={terminal.isProcessing}
              autoFocus={focused}
            />
            
            {/* Autocompletion suggestions */}
            {terminal.showSuggestions && terminal.suggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-10 min-w-48">
                {terminal.getFilteredSuggestions(terminal.currentInput).map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 text-gray-300 hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      terminal.handleInputChange(suggestion + ' ').catch(console.error);
                      terminal.setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Processing indicator */}
          {terminal.isProcessing && (
            <div className="text-yellow-400 animate-pulse">
              ●
            </div>
          )}
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="bg-gray-800 px-4 py-1 border-t border-gray-700 text-xs text-gray-500 flex justify-between">
        <div>
          Press Tab for autocompletion • ↑↓ for history • Ctrl+L to clear
        </div>
        <div>
          {terminal.commandHistory.length} commands in history
        </div>
      </div>
    </div>
  );
};

export default TerminalApp;