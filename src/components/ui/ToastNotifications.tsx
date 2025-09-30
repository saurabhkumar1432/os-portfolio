import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotificationStore, type Notification as NotificationType } from '../../store/notificationStore';
import { usePreferencesStore } from '../../store/preferencesStore';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    light: 'bg-green-50 border-green-200 text-green-900',
    dark: 'bg-green-900/20 border-green-700 text-green-100',
    icon: 'text-green-500',
  },
  error: {
    light: 'bg-red-50 border-red-200 text-red-900',
    dark: 'bg-red-900/20 border-red-700 text-red-100',
    icon: 'text-red-500',
  },
  warning: {
    light: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    dark: 'bg-yellow-900/20 border-yellow-700 text-yellow-100',
    icon: 'text-yellow-500',
  },
  info: {
    light: 'bg-blue-50 border-blue-200 text-blue-900',
    dark: 'bg-blue-900/20 border-blue-700 text-blue-100',
    icon: 'text-blue-500',
  },
};

interface ToastItemProps {
  notification: NotificationType;
}

const ToastItem: React.FC<ToastItemProps> = ({ notification }) => {
  const { removeNotification } = useNotificationStore();
  const { theme } = usePreferencesStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  const Icon = iconMap[notification.type];
  const colors = colorMap[notification.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-xl ${
        isDark ? colors.dark : colors.light
      }`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${colors.icon}`} />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{notification.title}</h4>
        {notification.message && (
          <p className="text-xs mt-1 opacity-80">{notification.message}</p>
        )}
        {notification.actions && notification.actions.length > 0 && (
          <div className="flex gap-2 mt-2">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.action();
                  removeNotification(notification.id);
                }}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-black/10 hover:bg-black/20'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => removeNotification(notification.id)}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastNotifications: React.FC = () => {
  const { notifications } = useNotificationStore();

  // Only show unread notifications as toasts
  const toastNotifications = notifications
    .filter(n => !n.read)
    .slice(0, 3); // Limit to 3 simultaneous toasts

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toastNotifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <ToastItem notification={notification} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
