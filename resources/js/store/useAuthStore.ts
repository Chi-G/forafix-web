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
    updateProfile: (data: { name: string; email: string }) => Promise<void>;
    updateAgentProfile: (data: { bio?: string; skills?: string[]; location_base?: string; is_available?: boolean }) => Promise<void>;
    uploadAvatar: (file: File) => Promise<void>;
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
        set({ user, token, isAuthenticated: true });
    },
    clearAuth: () => {
        localStorage.removeItem('auth_token');
        delete axios.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false });
    },
    fetchUser: async () => {
        try {
            const response = await axios.get('/me');
            set({ user: response.data, isAuthenticated: true });
        } catch (error) {
            get().clearAuth();
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
}));
