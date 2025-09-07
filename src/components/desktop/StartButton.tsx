import React from 'react';
import { motion } from 'framer-motion';
import { usePreferencesStore } from '../../store/preferencesStore';

interface StartButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const StartButton: React.FC<StartButtonProps> = ({ isOpen, onClick }) => {
  const { theme } = usePreferencesStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <motion.button
      className={`flex items-center justify-center w-10 h-8 rounded transition-colors ${
        isOpen
          ? isDark
            ? 'bg-blue-600 text-white'
            : 'bg-blue-500 text-white'
          : isDark
          ? 'hover:bg-gray-700 text-gray-300'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Start Menu"
    >
      {/* Windows-style logo placeholder */}
      <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
        <div className={`w-2 h-2 ${isOpen ? 'bg-white' : isDark ? 'bg-blue-400' : 'bg-blue-500'}`} />
        <div className={`w-2 h-2 ${isOpen ? 'bg-white' : isDark ? 'bg-blue-400' : 'bg-blue-500'}`} />
        <div className={`w-2 h-2 ${isOpen ? 'bg-white' : isDark ? 'bg-blue-400' : 'bg-blue-500'}`} />
        <div className={`w-2 h-2 ${isOpen ? 'bg-white' : isDark ? 'bg-blue-400' : 'bg-blue-500'}`} />
      </div>
    </motion.button>
  );
};