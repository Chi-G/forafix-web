import { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { useBookingStore } from './useBookingStore';
import { toast } from 'react-hot-toast';

export const useNotifications = () => {
    const { user } = useAuthStore();
    const { fetchBookings } = useBookingStore();

    useEffect(() => {
        if (!user) return;

        const channel = window.Echo.private(`App.Models.User.${user.id}`);

        channel.listen('.booking.created', (data: any) => {
            console.log('Booking Created Event:', data);
            toast.success(`New Job Invitation! ${data.booking.service.name}`, {
                duration: 5000,
                position: 'top-right',
            });
            fetchBookings();
        });

        channel.listen('.booking.status.changed', (data: any) => {
            console.log('Booking Status Changed Event:', data);
            const status = data.booking.status;
            toast.success(`Booking updated to ${status}`, {
                duration: 5000,
                position: 'top-right',
            });
            fetchBookings();
        });

        return () => {
            channel.stopListening('.booking.created');
            channel.stopListening('.booking.status.changed');
        };
    }, [user, fetchBookings]);
};
