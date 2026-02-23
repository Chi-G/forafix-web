import { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { useBookingStore } from './useBookingStore';
import { useNotificationStore } from './useNotificationStore';
import { toast } from 'react-hot-toast';

export const useNotifications = () => {
    const { user } = useAuthStore();
    const { fetchBookings } = useBookingStore();
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        if (!user) return;

        const channel = window.Echo.private(`App.Models.User.${user.id}`);

        channel.listen('.booking.created', (data: any) => {
            console.log('Booking Created Event:', data);

            const title = 'New Job Invitation';
            const message = `You have a new booking for ${data.booking.service.name}`;

            addNotification({
                type: 'BOOKING_CREATED',
                title,
                message,
                data: { bookingId: data.booking.id }
            });

            toast.success(title, {
                duration: 5000,
                position: 'top-right',
            });
            fetchBookings();
        });

        channel.listen('.booking.status.changed', (data: any) => {
            console.log('Booking Status Changed Event:', data);

            const title = 'Booking Update';
            const message = `Your booking for ${data.booking.service.name} is now ${data.booking.status}`;

            addNotification({
                type: 'BOOKING_STATUS',
                title,
                message,
                data: { bookingId: data.booking.id, status: data.booking.status }
            });

            toast.success(message, {
                duration: 5000,
                position: 'top-right',
            });
            fetchBookings();
        });

        return () => {
            channel.stopListening('.booking.created');
            channel.stopListening('.booking.status.changed');
        };
    }, [user, fetchBookings, addNotification]);
};
