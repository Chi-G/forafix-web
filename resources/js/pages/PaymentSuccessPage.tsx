import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, MapPin, ArrowRight, MessageSquare, Download } from 'lucide-react';
import { cn } from '../lib/utils';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const reference = searchParams.get('reference');

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
            <div className="max-w-2xl w-full">
                {/* Success Card */}
                <div className="bg-white dark:bg-neutral-900 rounded-[3rem] shadow-2xl shadow-neutral-200/50 dark:shadow-black/50 overflow-hidden border border-neutral-100 dark:border-neutral-800 animate-in fade-in zoom-in duration-500">
                    <div className="p-12 text-center space-y-8">
                        {/* Animated Checkmark */}
                        <div className="flex justify-center">
                            <div className="w-24 h-24 bg-[#14a800]/10 dark:bg-[#14a800]/20 rounded-full flex items-center justify-center animate-bounce">
                                <CheckCircle2 className="w-12 h-12 text-[#14a800]" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
                                Payment Successful!
                            </h1>
                            <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                                Your booking has been confirmed. We've sent a confirmation email to your inbox.
                            </p>
                        </div>

                        {/* Transaction Details */}
                        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl p-6 text-left border border-neutral-100 dark:border-neutral-700/50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Transaction ID</span>
                                <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">{reference || 'N/A'}</span>
                            </div>
                            <div className="h-px bg-neutral-200 dark:bg-neutral-700/50 my-4" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Next Step</p>
                                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Check Messages</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Status</p>
                                    <p className="text-sm font-bold text-[#14a800]">Confirmed</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link 
                                to="/cl/bookings"
                                className="flex items-center justify-center gap-2 bg-[#14a800] text-white px-8 py-5 rounded-2xl font-black transition-all hover:bg-[#128a00] hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#14a800]/20"
                            >
                                My Bookings <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link 
                                to="/cl/messages/rooms"
                                className="flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-2 border-neutral-100 dark:border-neutral-700 px-8 py-5 rounded-2xl font-black transition-all hover:border-neutral-200 dark:hover:border-neutral-600 hover:scale-[1.02] active:scale-95"
                            >
                                <MessageSquare className="w-5 h-5" /> Messages
                            </Link>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-neutral-100 dark:bg-neutral-800/80 px-12 py-6 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                            Powered by Paystack
                        </span>
                        <button className="text-[10px] font-black uppercase tracking-widest text-[#14a800] hover:underline flex items-center gap-1">
                            <Download className="w-3 h-3" /> Get Receipt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
