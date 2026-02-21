import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useBookingStore } from '../store/useBookingStore';
import { 
    ChevronRight, 
    Clock, 
    CheckCircle2, 
    MapPin,
    XCircle,
    TrendingUp,
    Users,
    Briefcase,
    Zap,
    Bell,
    Loader2
} from 'lucide-react';
import { formatNaira, cn } from '../lib/utils';

const AgentDashboard = () => {
    const { user } = useAuthStore();
    const { bookings, fetchBookings, updateStatus, isLoading } = useBookingStore();

    useEffect(() => {
        fetchBookings();
    }, []);

    const invitations = bookings.filter(b => b.status === 'PENDING');
    const activeJobs = bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS');

    const handleAccept = async (id: number) => {
        await updateStatus(id, 'ACCEPTED');
    };

    const handleDecline = async (id: number) => {
        await updateStatus(id, 'DECLINED');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Earnings */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-inter">Agent Dashboard</h1>
                    <p className="text-neutral-500 font-inter">You are currently <span className="text-brand-600 font-bold">Online</span> and ready for jobs.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm font-medium text-neutral-500 font-inter font-bold">Wallet Balance</div>
                        <div className="text-2xl font-black text-neutral-900 dark:text-white font-inter">{formatNaira(user?.balance || 0)}</div>
                    </div>
                    <button className="bg-neutral-900 dark:bg-neutral-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-all text-sm shadow-lg shadow-neutral-900/10 active:scale-95">
                        Withdraw
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Completion Rate', value: '98%', icon: TrendingUp, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-900/20' },
                    { label: 'Rating', value: '4.9', icon: CheckCircle2, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Jobs Completed', value: '124', icon: Briefcase, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { label: 'Client Referrals', value: '12', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 font-inter uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-inter">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Invitations & Tasks */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Invitations Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-neutral-900 font-inter flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" /> New Job Invitations
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isLoading && bookings.length === 0 ? (
                                <div className="col-span-2 py-10 flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                                    <p className="text-sm text-neutral-500 font-inter">Loading invitations...</p>
                                </div>
                            ) : invitations.length === 0 ? (
                                <div className="col-span-2 p-12 bg-neutral-50 rounded-2xl border border-dashed text-center text-neutral-400 font-inter">
                                    No new job invitations.
                                </div>
                            ) : (
                                invitations.map((inv: any) => (
                                    <div key={inv.id} className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 font-inter truncate">{inv.service?.name}</h4>
                                                <div className="text-xs text-brand-600 dark:text-brand-400 font-black font-inter uppercase tracking-tighter">Est. {formatNaira(inv.total_price)}</div>
                                            </div>
                                            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2 py-1 rounded-full uppercase">New</div>
                                        </div>
                                        <div className="space-y-2 mb-6 text-sm text-neutral-500 font-inter">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-neutral-400" /> {inv.client?.name}
                                            </div>
                                            <div className="flex items-center gap-2 font-bold text-neutral-700">
                                                <MapPin className="w-4 h-4 text-neutral-400" /> {inv.address}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-neutral-400" /> {new Date(inv.scheduled_at).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleAccept(inv.id)}
                                                className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-black text-sm hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-600/20 dark:shadow-brand-950/40"
                                            >
                                                Accept Job
                                            </button>
                                            <button 
                                                onClick={() => handleDecline(inv.id)}
                                                className="px-4 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 py-3 rounded-xl font-bold text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all active:scale-95"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Active Jobs Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-neutral-900 font-inter">Active Jobs</h2>
                        <div className="bg-white border border-neutral-200 rounded-2xl divide-y overflow-hidden shadow-sm min-h-[100px] flex flex-col justify-center">
                            {isLoading && bookings.length === 0 ? (
                                <div className="py-10 flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                                </div>
                            ) : activeJobs.length === 0 ? (
                                <div className="p-12 text-center text-neutral-400 font-inter">No jobs currently in progress.</div>
                            ) : (
                                activeJobs.map((job: any) => (
                                    <div key={job.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center font-black text-brand-600 dark:text-brand-400 text-lg">
                                                #{job.id}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-neutral-900 font-inter">{job.service?.name}</h4>
                                                <p className="text-sm text-neutral-500 font-inter flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" /> {job.address}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => updateStatus(job.id, 'COMPLETED')}
                                                className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-black text-xs hover:bg-green-700 transition-all shadow-lg shadow-green-600/10 active:scale-95"
                                            >
                                                Complete Job
                                            </button>
                                            <button className="p-2 hover:bg-neutral-200 rounded-xl transition-colors">
                                                <ChevronRight className="w-5 h-5 text-neutral-300" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Activity Feed */}
                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                        <h3 className="font-bold text-neutral-900 mb-6 font-inter flex items-center gap-2">
                            <Bell className="w-5 h-5 text-brand-600" /> Recent Activity
                        </h3>
                        <div className="space-y-6">
                            {[
                                { title: 'Payment Released', time: '2h ago', desc: '₦12,500 from Clean Job' },
                                { title: 'New Review', time: 'Yesterday', desc: '5 stars from Funke A.' },
                                { title: 'Profile Updated', time: '2d ago', desc: 'Verified status confirmed' }
                            ].map((activity, i) => (
                                <div key={i} className="flex gap-4 relative">
                                    {i !== 2 && <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-neutral-100" />}
                                    <div className="w-4 h-4 rounded-full bg-brand-500 mt-1 z-10" />
                                    <div>
                                        <div className="text-sm font-bold text-neutral-800 font-inter">{activity.title}</div>
                                        <div className="text-xs text-neutral-500 font-inter">{activity.desc}</div>
                                        <div className="text-[10px] text-neutral-400 mt-1 uppercase tracking-tight">{activity.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vetting Status Card */}
                    <div className="bg-brand-50 dark:bg-brand-950/30 p-6 rounded-2xl border border-brand-100 dark:border-brand-900/50">
                        <h3 className="font-bold text-brand-900 dark:text-brand-100 mb-4 font-inter text-sm">Professional Status</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'ID Verification', ok: true },
                                { label: 'Background Check', ok: true },
                                { label: 'Skills Assessment', ok: false },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-600 font-inter">{item.label}</span>
                                    {item.ok ? (
                                        <CheckCircle2 className="w-4 h-4 text-brand-600" />
                                    ) : (
                                        <span className="text-amber-500 font-bold uppercase tracking-tighter">Pending</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
