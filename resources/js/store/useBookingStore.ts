import { create } from 'zustand';
import { Booking, BookingStatus } from '../types';
import axios from 'axios';

interface BookingState {
    bookings: Booking[];
    isLoading: boolean;
    error: string | null;
    fetchBookings: () => Promise<void>;
    createBooking: (bookingData: any) => Promise<Booking>;
    updateStatus: (id: number, status: BookingStatus) => Promise<void>;
    initializePayment: (bookingId: number) => Promise<any>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
    bookings: [],
    isLoading: false,
    error: null,

    fetchBookings: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get('/bookings');
            set({ bookings: response.data, isLoading: false });
        } catch (err: any) {
            set({ error: 'Failed to fetch bookings', isLoading: false });
        }
    },

    createBooking: async (bookingData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/bookings', bookingData);
            const newBooking = response.data;
            set((state) => ({
                bookings: [newBooking, ...state.bookings],
                isLoading: false
            }));
            return newBooking;
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to create booking', isLoading: false });
            throw err;
        }
    },

    updateStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.patch(`/bookings/${id}`, { status });
            const updatedBooking = response.data;
            set((state) => ({
                bookings: state.bookings.map(b => b.id === id ? updatedBooking : b),
                isLoading: false
            }));
        } catch (err: any) {
            set({ error: 'Failed to update booking status', isLoading: false });
            throw err;
        }
    },

    initializePayment: async (bookingId) => {
        const response = await axios.post('/payments/initialize', { booking_id: bookingId });
        return response.data;
    },
}));
