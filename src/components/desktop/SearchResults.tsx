import React from 'react';
import { motion } from 'framer-motion';
import { usePreferencesStore } from '../../store/preferencesStore';
import type { SearchResult } from '../../types';

interface SearchResultsProps {
  results: SearchResult[];
  selectedIndex: number;
  onItemClick: (item: SearchResult) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  selectedIndex,
  onItemClick
}) => {
  const { theme } = usePreferencesStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.JSX.Element> = {
      app: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      project: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      file: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      command: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    };

    return iconMap[category] || iconMap.app;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      app: isDark ? 'text-blue-400' : 'text-blue-500',
      project: isDark ? 'text-green-400' : 'text-green-500',
      file: isDark ? 'text-yellow-400' : 'text-yellow-500',
      command: isDark ? 'text-purple-400' : 'text-purple-500'
    };

    return colorMap[category] || colorMap.app;
  };

  const highlightMatches = (text: string, matches?: Array<{ indices: readonly [number, number][]; key?: string; value?: string }>) => {
    if (!matches || matches.length === 0) {
      return text;
    }

    // Find the match for the title field
    const titleMatch = matches.find(match => match.key === 'title');
    if (!titleMatch) {
      return text;
    }

    const indices = titleMatch.indices;
    if (!indices || indices.length === 0) {
      return text;
    }

    let result: (string | React.JSX.Element)[] = [];
    let lastIndex = 0;

    indices.forEach(([start, end], i) => {
      // Add text before match
      if (start > lastIndex) {
        result.push(text.slice(lastIndex, start));
      }

      // Add highlighted match
      result.push(
        <mark
          key={i}
          className={`${
            isDark ? 'bg-yellow-600/30 text-yellow-300' : 'bg-yellow-200 text-yellow-800'
          } px-0.5 rounded`}
        >
          {text.slice(start, end + 1)}
        </mark>
      );

      lastIndex = end + 1;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  };

  if (results.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className={`text-4xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          🔍
        </div>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          No results found
        </p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="space-y-1">
        {results.map((result, index) => (
          <motion.button
            key={result.id}
            onClick={() => onItemClick(result)}
            className={`w-full flex items-center p-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              index === selectedIndex
                ? isDark
                  ? 'bg-blue-600/20 border border-blue-500/30'
                  : 'bg-blue-50 border border-blue-200'
                : isDark
                ? 'hover:bg-gray-800'
                : 'hover:bg-gray-50'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Category Icon */}
            <div className={`mr-3 ${getCategoryColor(result.category)}`}>
              {getCategoryIcon(result.category)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-sm ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {highlightMatches(result.title, result.matches)}
              </div>
              <div className={`text-xs mt-0.5 truncate ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {result.description}
              </div>
            </div>

            {/* Category Badge */}
            <div className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              isDark
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {result.category}
            </div>

            {/* Score (for debugging - remove in production) */}
            {result.score !== undefined && (
              <div className={`ml-2 text-xs ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {Math.round((1 - result.score) * 100)}%
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};