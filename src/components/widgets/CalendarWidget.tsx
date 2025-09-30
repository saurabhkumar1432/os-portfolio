import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, addMonths, subMonths } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color?: string;
}

interface CalendarWidgetProps {
  compact?: boolean;
  events?: CalendarEvent[];
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ compact = false, events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <CalendarIcon className="w-4 h-4" />
        <span className="font-medium">{format(new Date(), 'MMM d')}</span>
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day to properly offset the calendar
  const firstDayOfWeek = monthStart.getDay();

  // Pad the beginning of the month with empty cells
  const paddingDays = Array(firstDayOfWeek).fill(null);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20 min-w-[300px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleToday}
            className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding days */}
        {paddingDays.map((_, index) => (
          <div key={`padding-${index}`} className="aspect-square" />
        ))}
        
        {/* Actual days */}
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const hasEvents = dayEvents.length > 0;
          const isSelected = isSameDay(day, selectedDate);
          const isDayToday = isToday(day);

          return (
            <motion.button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center relative
                transition-colors text-sm
                ${isDayToday
                  ? 'bg-blue-500 text-white font-bold'
                  : isSelected
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              {format(day, 'd')}
              {hasEvents && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: event.color || '#3b82f6' }}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {getEventsForDate(selectedDate).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Events on {format(selectedDate, 'MMMM d')}
          </div>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: event.color || '#3b82f6' }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {event.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Mini Calendar for taskbar/system tray
export const MiniCalendar: React.FC = () => {
  const today = new Date();

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {format(today, 'EEE')}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {format(today, 'd')}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {format(today, 'MMM')}
      </div>
    </div>
  );
};
