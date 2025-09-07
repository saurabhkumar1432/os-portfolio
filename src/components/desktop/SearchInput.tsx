import React from 'react';
import { usePreferencesStore } from '../../store/preferencesStore';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...'
}) => {
  const { theme } = usePreferencesStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="relative">
      {/* Search Icon */}
      <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-10 py-2 rounded-md border transition-colors focus:outline-none focus:ring-2 ${
          isDark
            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
        }`}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={onClear}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
            isDark
              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Clear search"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};