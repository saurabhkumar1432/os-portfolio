import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
  read: boolean;
  icon?: React.ReactNode;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isActionCenterOpen: boolean;
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  toggleActionCenter: () => void;
  setActionCenterOpen: (isOpen: boolean) => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isActionCenterOpen: false,

  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  },

  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === id);
      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount,
      };
    });
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },

  toggleActionCenter: () => {
    set((state) => ({ isActionCenterOpen: !state.isActionCenterOpen }));
  },

  setActionCenterOpen: (isOpen) => {
    set({ isActionCenterOpen: isOpen });
  },
}));

// Hook for easy notification usage
export const useNotifications = () => {
  const { addNotification } = useNotificationStore();

  const showNotification = (
    type: NotificationType,
    title: string,
    message?: string,
    options?: Partial<Omit<Notification, 'id' | 'type' | 'title' | 'message' | 'timestamp' | 'read'>>
  ) => {
    return addNotification({
      type,
      title,
      message,
      ...options,
    });
  };

  return {
    success: (title: string, message?: string, options?: any) =>
      showNotification('success', title, message, options),
    error: (title: string, message?: string, options?: any) =>
      showNotification('error', title, message, options),
    warning: (title: string, message?: string, options?: any) =>
      showNotification('warning', title, message, options),
    info: (title: string, message?: string, options?: any) =>
      showNotification('info', title, message, options),
  };
};
