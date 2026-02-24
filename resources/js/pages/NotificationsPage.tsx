import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
    Bell, 
    CheckCircle2, 
    Clock, 
    Trash2, 
    Inbox,
    ChevronRight,
    Loader2,
    Calendar,
    Filter
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    uuid: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read_at: string | null;
    created_at: string;
}

const NotificationsPage = () => {
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await axios.get('/users/notifications');
            return response.data;
        }
    });

    const notifications = data?.data || [];

    const markReadMutation = useMutation({
        mutationFn: (uuid: string) => axios.post(`/users/notifications/${uuid}/read`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => axios.post('/users/notifications/read-all'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const clearAllMutation = useMutation({
        mutationFn: () => axios.delete('/users/notifications'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400';
            case 'warning': return 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400';
            case 'error': return 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400';
            default: return 'bg-brand-100 text-[#14a800] dark:bg-[#14a800]/10 dark:text-[#1ed100]';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-[#14a800]" />
                <p className="text-neutral-400 font-black uppercase tracking-widest text-xs">Fetching your activity...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
            <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                                <Bell className="w-6 h-6 text-[#14a800]" />
                             </div>
                             <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Notifications</h1>
                        </div>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">Stay updated with your latest forafix activity and account status.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => markAllReadMutation.mutate()}
                            disabled={notifications.every((n: any) => n.read_at) || markAllReadMutation.isPending}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Mark all read
                        </button>
                        <button 
                            onClick={() => clearAllMutation.mutate()}
                            disabled={notifications.length === 0 || clearAllMutation.isPending}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" /> Clear
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <AnimatePresence mode="popLayout">
                        {notifications.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-24 flex flex-col items-center justify-center text-center px-6"
                            >
                                <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-3xl flex items-center justify-center mb-6">
                                    <Inbox className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
                                </div>
                                <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">All caught up!</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 max-w-xs font-medium">
                                    You don't have any notifications right now. Check back later for updates.
                                </p>
                            </motion.div>
                        ) : (
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {notifications.map((notif: Notification) => (
                                    <motion.div 
                                        key={notif.uuid}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className={cn(
                                            "group p-6 sm:p-8 flex gap-4 sm:gap-6 transition-all relative overflow-hidden",
                                            !notif.read_at ? "bg-brand-50/20 dark:bg-[#14a800]/5" : "hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50"
                                        )}
                                        onClick={() => !notif.read_at && markReadMutation.mutate(notif.uuid)}
                                    >
                                        {/* Status Dot */}
                                        {!notif.read_at && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#14a800]" />
                                        )}

                                        {/* Icon Container */}
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110",
                                            getTypeStyles(notif.type)
                                        )}>
                                            <Bell className="w-6 h-6" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                <h4 className={cn(
                                                    "text-base font-black tracking-tight dark:text-white",
                                                    !notif.read_at ? "text-neutral-900" : "text-neutral-600"
                                                )}>
                                                    {notif.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-none">
                                                {notif.message}
                                            </p>
                                        </div>

                                        {/* Mark Read indicator */}
                                        {!notif.read_at && (
                                            <div className="hidden sm:flex items-center self-center pl-4">
                                                <div className="w-8 h-8 rounded-full border-2 border-brand-200 dark:border-brand-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <CheckCircle2 className="w-4 h-4 text-[#14a800]" />
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Info */}
                <div className="mt-8 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300 dark:text-neutral-700">
                        <CheckCircle2 className="w-3 h-3" /> Encrypted
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300 dark:text-neutral-700">
                        <Calendar className="w-3 h-3" /> Updated Live
                    </div>
                </div>

            </main>
        </div>
    );
};

export default NotificationsPage;
