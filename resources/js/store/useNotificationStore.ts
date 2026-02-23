import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    data?: any;
}

interface NotificationState {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
    unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            addNotification: (notif) => {
                const newNotification: Notification = {
                    ...notif,
                    id: Math.random().toString(36).substring(7),
                    timestamp: Date.now(),
                    read: false,
                };
                set((state) => ({
                    notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
                }));
            },
            markAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                    ),
                }));
            },
            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                }));
            },
            clearNotifications: () => set({ notifications: [] }),
            unreadCount: () => get().notifications.filter((n) => !n.read).length,
        }),
        {
            name: 'forafix-notifications',
        }
    )
);
