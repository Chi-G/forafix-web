import axios from 'axios';
import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
    fetchUser: () => Promise<void>;
    updateProfile: (data: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
        city?: string;
        postal_code?: string;
    }) => Promise<void>;
    updateAgentProfile: (data: { bio?: string; skills?: string[]; location_base?: string; is_available?: boolean }) => Promise<void>;
    uploadAvatar: (file: File) => Promise<void>;
    logout: () => Promise<void>;
}

// Config axios
axios.defaults.baseURL = '/api';
const token = localStorage.getItem('auth_token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: !!localStorage.getItem('auth_token'),
    setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Reconnect Echo if it was disconnected
        if (window.Echo) {
            window.Echo.connect();
            window.Echo.private(`App.Models.User.${user.id}`)
                .listen('.balance.updated', () => {
                    get().fetchUser();
                });
        }

        set({ user, token, isAuthenticated: true });
    },
    clearAuth: () => {
        localStorage.removeItem('auth_token');
        delete axios.defaults.headers.common['Authorization'];
        // Disconnect Echo if it exists to prevent 403/auth errors on logout
        if (window.Echo) {
            window.Echo.leave(`App.Models.User.${get().user?.id}`);
            window.Echo.disconnect();
        }
        set({ user: null, token: null, isAuthenticated: false });
    },
    fetchUser: async () => {
        try {
            const response = await axios.get('/me');
            const user = response.data;
            set({ user, isAuthenticated: true });

            if (window.Echo && user) {
                window.Echo.private(`App.Models.User.${user.id}`)
                    .listen('.balance.updated', () => {
                        get().fetchUser();
                    });
            }
        } catch (error: any) {
            // Only clear auth on 401 Unauthorized
            if (error.response?.status === 401) {
                get().clearAuth();
            }
        }
    },
    updateProfile: async (data) => {
        const response = await axios.post('/profile', data);
        set({ user: response.data });
    },
    updateAgentProfile: async (data) => {
        const response = await axios.post('/agent/profile', data);
        set({ user: response.data });
    },
    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await axios.post('/upload/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        set({ user: response.data });
    },
    logout: async () => {
        try {
            await axios.post('/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            get().clearAuth();
        }
    },
}));
