import React from 'react';
import { motion } from 'framer-motion';
import { usePreferencesStore } from '../../store/preferencesStore';

export const SystemTray: React.FC = () => {
  const { theme } = usePreferencesStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const [currentTime, setCurrentTime] = React.useState(getCurrentTime());
  const [currentDate, setCurrentDate] = React.useState(getCurrentDate());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setCurrentDate(getCurrentDate());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* System Icons */}
      <div className="flex items-center gap-1">
        {/* Network Icon */}
        <motion.button
          className={`p-1 rounded hover:bg-opacity-20 ${
            isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-black text-gray-600'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Network"
        >
          <div className="w-4 h-4 flex items-end gap-0.5">
            <div className={`w-1 h-1 ${isDark ? 'bg-gray-300' : 'bg-gray-600'}`} />
            <div className={`w-1 h-2 ${isDark ? 'bg-gray-300' : 'bg-gray-600'}`} />
            <div className={`w-1 h-3 ${isDark ? 'bg-gray-300' : 'bg-gray-600'}`} />
            <div className={`w-1 h-4 ${isDark ? 'bg-gray-300' : 'bg-gray-600'}`} />
          </div>
        </motion.button>

        {/* Volume Icon */}
        <motion.button
          className={`p-1 rounded hover:bg-opacity-20 ${
            isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-black text-gray-600'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Volume"
        >
          <div className="w-4 h-4 flex items-center">
            <div className={`w-2 h-2 ${isDark ? 'bg-gray-300' : 'bg-gray-600'}`} />
            <div className={`w-1 h-3 ${isDark ? 'bg-gray-300' : 'bg-gray-600'} ml-0.5`} />
          </div>
        </motion.button>
      </div>

      {/* Clock */}
      <motion.button
        className={`px-2 py-1 rounded text-xs text-center min-w-16 hover:bg-opacity-20 ${
          isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-black text-gray-600'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title={`${currentDate} ${currentTime}`}
      >
        <div className="leading-tight">
          <div>{currentTime}</div>
          <div className="text-xs opacity-75">{currentDate}</div>
        </div>
      </motion.button>
    </div>
  );
};