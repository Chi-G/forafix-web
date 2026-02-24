import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    CheckCircle2, 
    AlertCircle, 
    RotateCcw,
    ExternalLink,
    Loader2,
    ShieldCheck,
    MessageSquare,
    ChevronRight,
    Search
} from 'lucide-react';
import { formatNaira, cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

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

const ClientBookingsPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const { data: bookings, isLoading, refetch } = useQuery({
        queryKey: ['client-bookings'],
        queryFn: async () => {
            const response = await axios.get('/bookings');
            return response.data;
        }
    });

    const filteredBookings = useMemo(() => {
        if (!bookings) return [];
        return bookings.filter((booking: any) => {
            const matchesSearch = 
                booking.agent?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.address?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [bookings, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-[#14a800]" />
                <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Fetching your appointments...</p>
            </div>
        );
    }

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
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-12">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 mb-2 tracking-tight">My Bookings</h1>
                    <p className="text-neutral-500 font-medium">Manage and track your home service appointments across Abuja.</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input 
                            type="text"
                            placeholder="Search by pro or service..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl focus:border-[#14a800]/50 outline-none font-bold text-sm transition-all shadow-sm"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                                <ChevronRight className="w-3 h-3 rotate-180" />
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-6 py-3.5 bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl font-bold text-sm outline-none focus:border-[#14a800]/50 transition-all shadow-sm cursor-pointer appearance-none"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border-2 border-neutral-100 p-20 text-center shadow-sm">
                    <div className="w-24 h-24 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Calendar className="w-12 h-12 text-neutral-200" />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 mb-2">No bookings found yet</h2>
                    <p className="text-neutral-500 mb-10 font-bold max-w-sm mx-auto">Ready to get things fixed? Browse our top experts in Abuja and schedule your first service.</p>
                    <Link to="/cl/find-service" className="inline-flex items-center gap-2 bg-[#14a800] text-white px-10 py-5 rounded-full font-black text-sm hover:bg-[#118b00] transition-all shadow-xl shadow-green-100 dark:shadow-green-900/20 active:scale-95">
                        Find an Expert <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {paginatedBookings.map((booking: any) => (
                        <div key={booking.id} className="bg-white rounded-[2.5rem] border-2 border-neutral-100 hover:border-[#14a800]/30 transition-all p-4 sm:p-8 flex flex-col lg:flex-row gap-8 shadow-sm hover:shadow-xl hover:shadow-green-50/50 group">
                            {/* Pro Info Section */}
                            <div className="lg:w-1/3 flex items-start gap-6 border-b lg:border-b-0 lg:border-r border-neutral-100 pb-6 lg:pb-0 lg:pr-8">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-brand-50 rounded-[1.5rem] flex items-center justify-center text-3xl font-black text-[#14a800] border-2 border-white shadow-lg shadow-green-100">
                                        {booking.agent?.name?.[0]}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-neutral-100 shadow-sm">
                                        <ShieldCheck className="w-4 h-4 text-[#14a800]" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-neutral-900 mb-1 group-hover:text-[#14a800] transition-colors">{booking.agent?.name}</h3>
                                    <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Certified Expert</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Link to={`/cl/messages/rooms/${booking.agent?.uuid}`} className="p-2 text-neutral-400 hover:text-[#14a800] hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all border border-neutral-100 dark:border-neutral-800">
                                            <MessageSquare className="w-5 h-5" />
                                        </Link>
                                        <Link to={`/service/${booking.agent?.uuid}`} className="p-2 text-neutral-400 hover:text-[#14a800] hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all border border-neutral-100 dark:border-neutral-800">
                                            <ExternalLink className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details Section */}
                            <div className="flex-1 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border mb-4",
                                            getStatusColor(booking.status)
                                        )}>
                                            {booking.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                            {booking.status === 'ACCEPTED' && <Calendar className="w-3 h-3" />}
                                            {booking.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                                            {booking.status === 'CANCELLED' && <AlertCircle className="w-3 h-3" />}
                                            {booking.status}
                                        </div>
                                        <h4 className="text-2xl font-black text-neutral-900 tracking-tight">{booking.service?.name}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Total Amount</p>
                                        <p className="text-2xl font-black text-neutral-900">{formatNaira(booking.total_price)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="flex items-center gap-3 text-neutral-600">
                                        <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100">
                                            <Calendar className="w-5 h-5 text-neutral-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Date</p>
                                            <p className="text-sm font-bold text-neutral-900">{formatDate(booking.scheduled_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-neutral-600">
                                        <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100">
                                            <Clock className="w-5 h-5 text-neutral-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Arrival Window</p>
                                            <p className="text-sm font-bold text-neutral-900">{formatTime(booking.scheduled_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-neutral-600 col-span-1 md:col-span-2 lg:col-span-1">
                                        <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100">
                                            <MapPin className="w-5 h-5 text-neutral-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Work Address</p>
                                            <p className="text-sm font-bold text-neutral-900 truncate max-w-[200px]">{booking.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
                                    <p className="text-xs font-bold text-neutral-400 italic">Booked on {formatDate(booking.created_at)}</p>
                                    <div className="flex gap-4">
                                        {booking.status === 'PENDING' && (
                                            <button className="px-6 py-2.5 bg-neutral-100 text-neutral-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95">
                                                Cancel Request
                                            </button>
                                        )}
                                        {booking.status === 'COMPLETED' && (
                                            <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-50 text-[#14a800] rounded-full text-xs font-black uppercase tracking-widest hover:bg-brand-100 transition-all active:scale-95 border border-[#14a800]/10">
                                                <RotateCcw className="w-3 h-3" /> Re-book Expert
                                            </button>
                                        )}
                                        <button onClick={() => navigate(`/service/${booking.agent?.uuid}`)} className="px-8 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-12 pb-8">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border-2 border-neutral-100 rounded-xl font-bold text-sm text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 transition-all active:scale-90"
                            >
                                Previous
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            "w-10 h-10 rounded-xl font-black text-sm transition-all active:scale-90",
                                            currentPage === i + 1 
                                                ? "bg-[#14a800] text-white shadow-lg shadow-green-100" 
                                                : "text-neutral-400 hover:bg-neutral-50"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border-2 border-neutral-100 rounded-xl font-bold text-sm text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 transition-all active:scale-90"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientBookingsPage;
