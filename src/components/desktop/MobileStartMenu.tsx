import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { Search, X, Grid3X3, Clock } from 'lucide-react';
import { useStartMenuStore } from '../../store/startMenuStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useResponsive } from '../../hooks/useResponsive';


export const MobileStartMenu: React.FC = () => {
  const { 
    isOpen, 
    searchQuery, 
    searchResults, 
    setIsOpen,
    setSearchQuery 
  } = useStartMenuStore();
  const { theme } = usePreferencesStore();
  const { isMobile, screenHeight } = useResponsive();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  // Auto-focus search input when menu opens on mobile
  useEffect(() => {
    if (isOpen && isMobile && searchInputRef.current) {
      // Small delay to ensure the animation has started
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMobile]);

  // Handle swipe down to close
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > 100) {
      setIsOpen(false);
    }
  };

  if (!isMobile) {
    return null;
  }

  const maxHeight = screenHeight * 0.85; // 85% of screen height

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-[2000]"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={handleDragEnd}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300 
            }}
            className={`fixed bottom-0 left-0 right-0 rounded-t-2xl shadow-2xl z-[2001] ${
              isDark 
                ? 'bg-gray-900 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
            style={{ maxHeight }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className={`w-12 h-1 rounded-full ${
                isDark ? 'bg-gray-600' : 'bg-gray-300'
              }`} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <h2 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Start
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-full transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {/* Search Section */}
              <div className="px-4 pb-4">
                <div className="relative">
                  <Search 
                    size={18} 
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} 
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search apps, projects, files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-base ${
                      isDark
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
              </div>

              {/* Results/Content */}
              <div className="flex-1 overflow-y-auto px-4 pb-6">
                {searchQuery ? (
                  <MobileSearchResults results={searchResults} />
                ) : (
                  <MobileStartContent />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const MobileSearchResults: React.FC<{ results: any[] }> = ({ results }) => {
  const { theme } = usePreferencesStore();
  const { setIsOpen } = useStartMenuStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <div className={`text-4xl mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          🔍
        </div>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          No results found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {results.map((result, index) => (
        <motion.button
          key={result.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => {
            result.action();
            setIsOpen(false);
          }}
          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
            isDark
              ? 'hover:bg-gray-800 text-white'
              : 'hover:bg-gray-50 text-gray-900'
          }`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            {result.icon || '📱'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{result.title}</div>
            <div className={`text-sm truncate ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {result.description}
            </div>
          </div>
          <div className={`text-xs px-2 py-1 rounded-full ${
            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            {result.category}
          </div>
        </motion.button>
      ))}
    </div>
  );
};

const MobileStartContent: React.FC = () => {
  const { theme } = usePreferencesStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <section>
        <h3 className={`text-sm font-medium mb-3 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionButton
            icon={<Grid3X3 size={20} />}
            label="All Apps"
            isDark={isDark}
          />
          <QuickActionButton
            icon={<Clock size={20} />}
            label="Recent"
            isDark={isDark}
          />
        </div>
      </section>

      {/* Pinned Apps */}
      <section>
        <h3 className={`text-sm font-medium mb-3 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Pinned Apps
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className={`text-center py-4 col-span-4 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            No pinned apps
          </div>
        </div>
      </section>

      {/* Recent Apps */}
      <section>
        <h3 className={`text-sm font-medium mb-3 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Recent
        </h3>
        <div className="space-y-2">
          {/* This would be populated with recent apps */}
          <div className={`text-center py-4 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            No recent apps
          </div>
        </div>
      </section>
    </div>
  );
};

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  isDark: boolean;
  onClick?: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ 
  icon, 
  label, 
  isDark, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
        isDark
          ? 'bg-gray-800 hover:bg-gray-700 text-white'
          : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        isDark ? 'bg-gray-700' : 'bg-white'
      }`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};