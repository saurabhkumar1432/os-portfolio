import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { usePreferencesStore } from '../../store/preferencesStore';
import { searchService } from '../../services/searchService';
import type { SearchableItem } from '../../types';

export const TaskbarSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { theme } = usePreferencesStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  // Search when query changes
  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchService.search(query);
      setResults(searchResults.slice(0, 8)); // Limit to 8 results
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            results[selectedIndex].action();
            handleClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, results, selectedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    if (isFocused) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isFocused]);

  const handleClose = () => {
    setQuery('');
    setIsFocused(false);
    setResults([]);
    inputRef.current?.blur();
  };

  return (
    <div className="relative flex-1 max-w-md mx-4">
      {/* Search Input */}
      <div className={`relative flex items-center transition-all duration-200 ${
        isFocused ? 'ring-2 ring-blue-500' : ''
      }`}>
        <div className={`absolute left-3 pointer-events-none ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search apps, files, and more..."
          className={`w-full h-8 pl-10 pr-8 rounded text-sm outline-none transition-colors ${
            isDark
              ? 'bg-gray-700/50 hover:bg-gray-700 text-white placeholder-gray-400'
              : 'bg-gray-200/50 hover:bg-gray-200 text-gray-900 placeholder-gray-500'
          }`}
        />
        {query && (
          <button
            onClick={handleClose}
            className={`absolute right-2 p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {isFocused && results.length > 0 && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute bottom-full left-0 right-0 mb-2 rounded-lg shadow-2xl border overflow-hidden ${
              isDark
                ? 'bg-gray-800/95 border-gray-700 backdrop-blur-xl'
                : 'bg-white/95 border-gray-200 backdrop-blur-xl'
            }`}
            style={{ maxHeight: '400px' }}
          >
            <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => {
                    result.action();
                    handleClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                    index === selectedIndex
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDark
                      ? 'hover:bg-gray-700 text-white'
                      : 'hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  {result.icon && (
                    <div className={`flex-shrink-0 ${
                      index === selectedIndex ? 'text-white' : 'text-blue-500'
                    }`}>
                      {result.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{result.title}</div>
                    {result.description && (
                      <div className={`text-xs truncate ${
                        index === selectedIndex
                          ? 'text-blue-100'
                          : isDark
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`}>
                        {result.description}
                      </div>
                    )}
                  </div>
                  {result.category && (
                    <div className={`text-xs px-2 py-0.5 rounded ${
                      index === selectedIndex
                        ? 'bg-white/20 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {result.category}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
