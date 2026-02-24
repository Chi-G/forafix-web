import { create } from 'zustand';
import axios from 'axios';

export interface Notification {
    uuid: string;
    type: string;
    title: string;
    message: string;
    created_at: string;
    read_at: string | null;
    data?: any;
}

interface NotificationState {
    notifications: Notification[];
    isLoading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (uuid: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearNotifications: () => Promise<void>;
    unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    isLoading: false,

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get('/users/notifications');
            // The API returns a paginated response, so we grab the data array
            set({ notifications: response.data.data || [] });
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    markAsRead: async (uuid) => {
        try {
            await axios.post(`/users/notifications/${uuid}/read`);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.uuid === uuid ? { ...n, read_at: new Date().toISOString() } : n
                ),
            }));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            await axios.post('/users/notifications/read-all');
            set((state) => ({
                notifications: state.notifications.map((n) => ({
                    ...n,
                    read_at: new Date().toISOString()
                })),
            }));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    },

    clearNotifications: async () => {
        try {
            await axios.delete('/users/notifications');
            set({ notifications: [] });
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    },

    unreadCount: () => get().notifications.filter((n) => !n.read_at).length,
}));
