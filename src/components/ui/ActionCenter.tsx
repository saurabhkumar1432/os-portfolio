import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Bell, BellOff } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { formatDistanceToNow } from 'date-fns';

const iconMap = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export const ActionCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isActionCenterOpen,
    setActionCenterOpen,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  } = useNotificationStore();

  const { theme } = usePreferencesStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  if (!isActionCenterOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998]"
        onClick={() => setActionCenterOpen(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={`absolute right-0 top-0 bottom-0 w-full max-w-md shadow-2xl ${
            isDark
              ? 'bg-gray-900/95 border-l border-gray-700'
              : 'bg-white/95 border-l border-gray-200'
          } backdrop-blur-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {unreadCount}
                </span>
              )}
            </div>
            
            <button
              onClick={() => setActionCenterOpen(false)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className={`flex items-center gap-2 p-3 border-b ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAll}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <BellOff className="w-12 h-12 mb-3" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    notification.read
                      ? isDark
                        ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      : isDark
                      ? 'bg-blue-900/20 border-blue-700 hover:bg-blue-900/30'
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                      isDark ? 'bg-gray-700' : 'bg-white'
                    }`}>
                      {iconMap[notification.type]}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      
                      {notification.message && (
                        <p className={`text-xs mb-1 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                      )}
                      
                      <p className={`text-xs ${
                        isDark ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>

                      {notification.actions && notification.actions.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {notification.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.action();
                                removeNotification(notification.id);
                              }}
                              className={`text-xs px-2 py-1 rounded transition-colors ${
                                isDark
                                  ? 'bg-gray-700 hover:bg-gray-600'
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className={`flex-shrink-0 p-1 rounded transition-colors ${
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
