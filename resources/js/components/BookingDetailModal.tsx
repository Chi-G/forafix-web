import React, { useState } from 'react';
import { 
    X, 
    Calendar as CalendarIcon, 
    Clock, 
    MapPin, 
    ShieldCheck, 
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    FileText,
    ExternalLink,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { cn, formatNaira } from '../lib/utils';
import { useBookingStore } from '../store/useBookingStore';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';

interface BookingDetailModalProps {
    booking: any;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate?: () => void;
    initialConfirmCancel?: boolean;
}

const BookingDetailModal = ({ booking, isOpen, onClose, onStatusUpdate, initialConfirmCancel = false }: BookingDetailModalProps) => {
    const { updateStatus, isLoading } = useBookingStore();
    const [isConfirmingCancel, setIsConfirmingCancel] = useState(initialConfirmCancel);

    // Reset or set confirmation state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setIsConfirmingCancel(initialConfirmCancel);
        }
    }, [isOpen, initialConfirmCancel]);

    if (!isOpen || !booking) return null;

    const handleCancel = async () => {
        try {
            await updateStatus(booking.id, 'CANCELLED');
            toast.success('Booking cancelled successfully');
            setIsConfirmingCancel(false);
            if (onStatusUpdate) onStatusUpdate();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(dateString));
    };

    const formatTime = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(new Date(dateString));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'ACCEPTED': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-100';
            case 'CANCELLED': 
            case 'DECLINED': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-neutral-50 text-neutral-600 border-neutral-100';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="absolute inset-0" onClick={onClose} />
            
            <div className="bg-white dark:bg-neutral-900 w-full lg:w-1/2 h-full shadow-[-20px_0_50px_rgba(0,0,0,0.2)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.5)] relative z-[110] flex flex-col animate-in slide-in-from-right duration-700">
                {/* Header */}
                <div className="px-12 py-10 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900 sticky top-0 z-20">
                    <div className="flex items-center gap-6">
                        <Avatar 
                            src={booking.agent?.avatar_url || booking.agent?.avatar} 
                            name={booking.agent?.name} 
                            sizeClassName="w-16 h-16"
                            className="border-2 border-white dark:border-neutral-800 shadow-xl ring-4 ring-neutral-50/50 dark:ring-neutral-800/50"
                        />
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14a800] mb-1 block">Booking Details</span>
                            <h3 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">{booking.service?.name}</h3>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-12 h-12 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl transition-all text-neutral-400 dark:text-neutral-500 hover:rotate-90 duration-300"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-10">
                    {/* Status Banner */}
                    <div className={cn(
                        "p-6 rounded-[2rem] border-2 flex items-center justify-between shadow-sm",
                        getStatusColor(booking.status)
                    )}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center">
                                {booking.status === 'PENDING' && <Clock className="w-6 h-6" />}
                                {booking.status === 'ACCEPTED' && <CalendarIcon className="w-6 h-6" />}
                                {booking.status === 'COMPLETED' && <CheckCircle2 className="w-6 h-6" />}
                                {(booking.status === 'CANCELLED' || booking.status === 'DECLINED') && <AlertCircle className="w-6 h-6" />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Current Status</p>
                                <p className="text-lg font-black">{booking.status}</p>
                            </div>
                        </div>
                        <p className="text-sm font-bold opacity-70 italic">Booked on {formatDate(booking.created_at)}</p>
                    </div>

                    {/* Pro & Quick Actions */}
                    <section className="space-y-6">
                        <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Service Professional</h4>
                        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl p-6 border border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar 
                                    src={booking.agent?.avatar_url || booking.agent?.avatar} 
                                    name={booking.agent?.name} 
                                    sizeClassName="w-12 h-12"
                                />
                                <div>
                                    <p className="font-black text-neutral-900 dark:text-neutral-100">{booking.agent?.name}</p>
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-tighter">Verified Professional</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link to={`/cl/messages/rooms/${booking.agent?.uuid}`} className="p-3 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl text-neutral-400 hover:text-[#14a800] transition-colors shadow-sm">
                                    <MessageSquare className="w-5 h-5" />
                                </Link>
                                <Link to={`/service/${booking.agent?.uuid}`} className="p-3 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl text-neutral-400 hover:text-[#14a800] transition-colors shadow-sm">
                                    <ExternalLink className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Job Details */}
                    <section className="space-y-6">
                        <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Appointment Summary</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-neutral-700 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                    <CalendarIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Scheduled Date</p>
                                    <p className="font-bold text-neutral-900 dark:text-neutral-100">{formatDate(booking.scheduled_at)}</p>
                                </div>
                            </div>
                            <div className="p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-neutral-700 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Arrival Window</p>
                                    <p className="font-bold text-neutral-900 dark:text-neutral-100">{formatTime(booking.scheduled_at)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-neutral-700 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Service Location</p>
                                <p className="font-bold text-neutral-900 dark:text-neutral-100">{booking.address}</p>
                            </div>
                        </div>
                    </section>

                    {/* Description & Notes */}
                    {(booking.notes) && (
                        <section className="space-y-6">
                            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Job Notes
                            </h4>
                            <div className="p-8 bg-neutral-50 dark:bg-neutral-800/30 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-medium italic leading-relaxed whitespace-pre-wrap shadow-inner">
                                {booking.notes}
                            </div>
                        </section>
                    )}

                    {/* Pricing Breakdown */}
                    <section className="bg-neutral-900 text-white rounded-[3rem] p-10 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-6">
                            <span className="text-neutral-400 font-bold">Standard Labor Fee</span>
                            <span className="font-black">{formatNaira(booking.total_price)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex flex-col">
                                <span className="text-neutral-400 text-xs font-black uppercase tracking-widest mb-1">Total Paid</span>
                                <span className="text-3xl font-black text-[#14a800] tracking-tight">{formatNaira(booking.total_price)}</span>
                            </div>
                            <div className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#14a800]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#14a800]">Payment Secured</span>
                            </div>
                        </div>
                    </section>

                    {/* Cancellation Confirmation */}
                    {isConfirmingCancel && (
                        <div className="p-8 bg-red-50 border-2 border-red-100 rounded-[2.5rem] space-y-6 animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-4 text-red-700">
                                <AlertTriangle className="w-8 h-8" />
                                <div>
                                    <h5 className="font-black text-lg">Cancel this request?</h5>
                                    <p className="text-sm font-medium opacity-80">This action cannot be undone. Funds will be refunded to your balance.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Cancel Request'}
                                </button>
                                <button 
                                    onClick={() => setIsConfirmingCancel(false)}
                                    className="flex-1 py-4 bg-white text-neutral-500 border border-neutral-200 rounded-2xl font-black text-sm hover:bg-neutral-50 transition-all"
                                >
                                    No, Keep It
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Footer */}
                <div className="px-12 py-10 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between sticky bottom-0 z-20">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3.5 text-neutral-400 font-bold hover:text-neutral-900 transition-all"
                    >
                        Close Details
                    </button>
                    
                    {booking.status === 'PENDING' && !isConfirmingCancel && (
                        <button 
                            onClick={() => setIsConfirmingCancel(true)}
                            className="px-10 py-3.5 bg-neutral-100 text-neutral-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 border border-transparent hover:border-red-100"
                        >
                            Cancel Request
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetailModal;
