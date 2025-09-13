import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStartMenuStore } from '../../store/startMenuStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useComponentKeyboardShortcuts } from '../KeyboardShortcutProvider';
import { searchService } from '../../services/searchService';
import { SearchInput } from './SearchInput';
import { AppGrid } from './AppGrid';
import { SearchResults } from './SearchResults';
import { QuickActions } from './QuickActions';

export const StartMenu: React.FC = () => {
  const {
    isOpen,
    searchQuery,
    searchResults,
    selectedIndex,
    pinnedApps,
    recentApps,
    setIsOpen,
    setSearchQuery,
    selectNext,
    selectPrevious,
    executeSelected,
    clearSearch
  } = useStartMenuStore();

  const { theme } = usePreferencesStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  // Keyboard shortcuts for start menu
  useComponentKeyboardShortcuts([
    {
      id: 'start-menu-close',
      keys: ['Escape'],
      description: 'Close Start Menu',
      action: () => {
        if (isOpen) {
          setIsOpen(false);
        }
      },
      context: 'desktop'
    },
    {
      id: 'start-menu-navigate-down',
      keys: ['ArrowDown'],
      description: 'Navigate down in search results',
      action: () => {
        if (isOpen && searchResults.length > 0) {
          selectNext();
        }
      },
      context: 'desktop'
    },
    {
      id: 'start-menu-navigate-up',
      keys: ['ArrowUp'],
      description: 'Navigate up in search results',
      action: () => {
        if (isOpen && searchResults.length > 0) {
          selectPrevious();
        }
      },
      context: 'desktop'
    },
    {
      id: 'start-menu-execute',
      keys: ['Enter'],
      description: 'Execute selected item',
      action: () => {
        if (isOpen && selectedIndex >= 0) {
          executeSelected();
        }
      },
      context: 'desktop'
    }
  ], { enabled: isOpen });

  // Handle clicks outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setIsOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the search input when menu opens
      const searchInput = menuRef.current?.querySelector('input');
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [isOpen]);

  const pinnedAppItems = searchService.getPinnedApps(pinnedApps);
  const recentAppItems = searchService.getRecentApps(recentApps);
  const allApps = searchService.getAllApps();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0"
            style={{ zIndex: 10000 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Start Menu */}
          <motion.div
            ref={menuRef}
            className={`fixed bottom-12 left-2 w-96 max-h-[600px] rounded-lg shadow-2xl border ${
              isDark
                ? 'bg-gray-900/95 border-gray-700 backdrop-blur-md'
                : 'bg-white/95 border-gray-200 backdrop-blur-md'
            }`}
            style={{ zIndex: 10001 }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex flex-col h-full">
              {/* Search Input */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={clearSearch}
                  placeholder="Search apps, files, and more..."
                />
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {searchQuery ? (
                  // Search Results
                  <SearchResults
                    results={searchResults}
                    selectedIndex={selectedIndex}
                    onItemClick={(item) => {
                      item.action();
                      setIsOpen(false);
                    }}
                  />
                ) : (
                  // Default View
                  <div className="p-4 space-y-6">
                    {/* Pinned Apps */}
                    {pinnedAppItems.length > 0 && (
                      <div>
                        <h3 className={`text-sm font-medium mb-3 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Pinned
                        </h3>
                        <AppGrid
                          apps={pinnedAppItems}
                          onAppClick={(app) => {
                            app.action();
                            setIsOpen(false);
                          }}
                        />
                      </div>
                    )}

                    {/* Recent Apps */}
                    {recentAppItems.length > 0 && (
                      <div>
                        <h3 className={`text-sm font-medium mb-3 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Recent
                        </h3>
                        <AppGrid
                          apps={recentAppItems}
                          onAppClick={(app) => {
                            app.action();
                            setIsOpen(false);
                          }}
                        />
                      </div>
                    )}

                    {/* All Apps */}
                    <div>
                      <h3 className={`text-sm font-medium mb-3 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        All Apps
                      </h3>
                      <AppGrid
                        apps={allApps}
                        onAppClick={(app) => {
                          app.action();
                          setIsOpen(false);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <QuickActions onActionClick={() => setIsOpen(false)} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};