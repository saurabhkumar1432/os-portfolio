import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface ClockWidgetProps {
  compact?: boolean;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({ compact = false }) => {
  const [time, setTime] = useState(new Date());
  const [show24Hour, setShow24Hour] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4" />
        <span className="font-medium">
          {format(time, show24Hour ? 'HH:mm' : 'h:mm a')}
        </span>
      </div>
    );
  }

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Calculate hand positions
  const secondsDeg = (seconds / 60) * 360;
  const minutesDeg = ((minutes + seconds / 60) / 60) * 360;
  const hoursDeg = ((hours % 12 + minutes / 60) / 12) * 360;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20"
    >
      {/* Digital Time */}
      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
          {format(time, show24Hour ? 'HH:mm:ss' : 'h:mm:ss')}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {format(time, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Analog Clock */}
      <div className="relative w-40 h-40 mx-auto mb-4">
        {/* Clock Face */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 shadow-inner border-4 border-gray-200 dark:border-gray-600">
          {/* Hour Markers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = 50 + 35 * Math.cos(angle);
            const y = 50 + 35 * Math.sin(angle);
            return (
              <div
                key={i}
                className="absolute w-1 h-2 bg-gray-400 dark:bg-gray-500 rounded"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                }}
              />
            );
          })}

          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-30" />

          {/* Hour Hand */}
          <motion.div
            className="absolute top-1/2 left-1/2 origin-bottom"
            style={{
              width: '4px',
              height: '25%',
              backgroundColor: '#1f2937',
              borderRadius: '2px',
              transform: `translate(-50%, -100%) rotate(${hoursDeg}deg)`,
            }}
            animate={{ rotate: hoursDeg }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {/* Minute Hand */}
          <motion.div
            className="absolute top-1/2 left-1/2 origin-bottom"
            style={{
              width: '3px',
              height: '35%',
              backgroundColor: '#374151',
              borderRadius: '2px',
              transform: `translate(-50%, -100%) rotate(${minutesDeg}deg)`,
            }}
            animate={{ rotate: minutesDeg }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {/* Second Hand */}
          <motion.div
            className="absolute top-1/2 left-1/2 origin-bottom"
            style={{
              width: '2px',
              height: '40%',
              backgroundColor: '#ef4444',
              borderRadius: '1px',
              transform: `translate(-50%, -100%) rotate(${secondsDeg}deg)`,
            }}
            animate={{ rotate: secondsDeg }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setShow24Hour(!show24Hour)}
        className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {show24Hour ? '12-hour format' : '24-hour format'}
      </button>
    </motion.div>
  );
};

// World Clock Sub-Widget
interface WorldClockProps {
  timezone: string;
  city: string;
}

export const WorldClockItem: React.FC<WorldClockProps> = ({ timezone, city }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time for specific timezone
  const timeString = time.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{city}</span>
      </div>
      <span className="text-sm font-mono text-gray-600 dark:text-gray-400 tabular-nums">
        {timeString}
      </span>
    </div>
  );
};

// World Clock Container Widget
export const WorldClockWidget: React.FC = () => {
  const worldClocks = [
    { city: 'New York', timezone: 'America/New_York' },
    { city: 'London', timezone: 'Europe/London' },
    { city: 'Tokyo', timezone: 'Asia/Tokyo' },
    { city: 'Sydney', timezone: 'Australia/Sydney' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">World Clocks</h3>
      </div>
      <div className="space-y-2">
        {worldClocks.map((clock) => (
          <WorldClockItem key={clock.city} {...clock} />
        ))}
      </div>
    </motion.div>
  );
};
