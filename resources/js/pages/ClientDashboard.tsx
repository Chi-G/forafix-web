import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useBookingStore } from '../store/useBookingStore';
import { 
    Search, 
    MoreVertical,
    ChevronLeft as ChevronLeftIcon,
    Star, 
    ThumbsDown, 
    Heart, 
    MapPin, 
    Clock, 
    CheckCircle2, 
    ChevronRight,
    ArrowUpRight,
    Info,
    Filter,
    ArrowRight,
    Loader2,
    ShieldCheck,
    Briefcase,
    MessageCircle,
    HelpCircle,
    Settings as SettingsIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, formatNaira } from '../lib/utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import BookingModal from '../components/BookingModal';

const ClientDashboard = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('Best Matches');
    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;
    
    // Filter states
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');

    // ── Rating state ─────────────────────────────────────────────────────────
    const [ratings, setRatings] = useState<Record<number, number>>(() => {
        const saved = localStorage.getItem('agent_ratings');
        return saved ? JSON.parse(saved) : {};
    });
    const [ratingTarget, setRatingTarget] = useState<any | null>(null); // agent being rated

    const saveRating = (agentId: number, value: number) => {
        const next = { ...ratings, [agentId]: value };
        setRatings(next);
        localStorage.setItem('agent_ratings', JSON.stringify(next));
        setRatingTarget(null);
    };

    // Saved Pros State (in a real app this would be in a DB/Store)
    const [savedProIds, setSavedProIds] = useState<number[]>(() => {
        const saved = localStorage.getItem('saved_pros');
        return saved ? JSON.parse(saved) : [];
    });

    const toggleSavePro = (id: number) => {
        setSavedProIds(prev => {
            const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
            localStorage.setItem('saved_pros', JSON.stringify(next));
            return next;
        });
    };

    // ── Dynamic profile completion ────────────────────────────────────────
    const profileCompletion = useMemo(() => {
        const steps = [
            { label: 'Name set',          done: !!user?.name },
            { label: 'Email set',         done: !!user?.email },
            { label: 'UUID verified',     done: !!user?.uuid },
            { label: 'Avatar uploaded',   done: !!user?.avatar_url },
            { label: 'Identity verified', done: !!user?.is_vetted },
        ];
        const completed = steps.filter(s => s.done).length;
        return {
            percent: Math.round((completed / steps.length) * 100),
            steps,
            missing: steps.filter(s => !s.done),
        };
    }, [user]);



    const [selectedAgentForBooking, setSelectedAgentForBooking] = useState<any>(null);

    const abuiaDistricts = ['Maitama', 'Asokoro', 'Wuse 2', 'Garki 1', 'Garki 2', 'Jabi', 'Utako', 'Guzape', 'Lugbe', 'Kubwa', 'Gwarinpa', 'Apo'];

    const { data: agents, isLoading: isAgentsLoading } = useQuery({
        queryKey: ['dashboard-agents', category, location],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (location) params.append('location', location);
            
            const response = await axios.get(`/agents?${params.toString()}`);
            return response.data;
        }
    });

    const { data: services, isLoading: isServicesLoading } = useQuery({
        queryKey: ['dashboard-services'],
        queryFn: async () => {
            const response = await axios.get('/services');
            return response.data;
        }
    });



    const isLoading = isAgentsLoading || isServicesLoading;

    // Client-side search & tab filtering
    const filteredAgents = useMemo(() => agents?.filter((agent: any) => {
        const matchesQuery = agent.name.toLowerCase().includes(query.toLowerCase()) ||
            agent.agent_profile?.bio?.toLowerCase().includes(query.toLowerCase()) ||
            agent.services?.some((s: any) => s.name.toLowerCase().includes(query.toLowerCase()));

        if (!matchesQuery) return false;

        if (activeTab === 'Saved Pros') return savedProIds.includes(agent.id);
        if (activeTab === 'Featured') return agent.is_vetted;

        return true;
    }) ?? [], [agents, query, activeTab, savedProIds]);

    // Reset to page 1 whenever filters / tab / search change
    useEffect(() => { setCurrentPage(1); }, [activeTab, query, category, location]);

    const totalPages = Math.max(1, Math.ceil(filteredAgents.length / PAGE_SIZE));
    const pagedAgents = filteredAgents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Skeleton Component
    const SkeletonCard = () => (
        <div className="p-8 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                        <div className="space-y-2">
                            <div className="h-5 w-40 bg-neutral-100 dark:bg-neutral-800 rounded" />
                            <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded" />
                        </div>
                    </div>
                    <div className="h-4 w-3/4 bg-neutral-100 dark:bg-neutral-800 rounded mb-4" />
                    <div className="h-4 w-1/2 bg-neutral-100 dark:bg-neutral-800 rounded mb-6" />
                    <div className="flex gap-2">
                        <div className="h-6 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                        <div className="h-6 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );

    // ── Interactive Star Rating Component ────────────────────────────────────
    const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
        const [hover, setHover] = useState(0);
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                    <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => onChange(i)}
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
                    >
                        <Star
                            className="w-8 h-8 transition-colors"
                            style={{
                                fill: i <= (hover || value) ? '#df7606' : 'transparent',
                                color: i <= (hover || value) ? '#df7606' : '#d1d5db',
                            }}
                        />
                    </button>
                ))}
            </div>
        );
    };

    // ── Rating Modal ─────────────────────────────────────────────────────────
    const RatingModal = ({ agent, onClose }: { agent: any; onClose: () => void }) => {
        const [picked, setPicked] = useState<number>(ratings[agent.id] || 0);
        const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

        return (
            <div
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <div
                    className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 p-8 w-full max-w-sm m-4 flex flex-col items-center gap-5"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-[#14a800]/20 flex items-center justify-center text-2xl font-black text-[#14a800] border-2 border-[#14a800]/20">
                        {agent.name?.[0]}
                    </div>

                    <div className="text-center">
                        <h3 className="font-black text-xl text-neutral-900 dark:text-neutral-100">{agent.name}</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">How would you rate your experience?</p>
                    </div>

                    <StarRating value={picked} onChange={setPicked} />

                    {picked > 0 && (
                        <p className="text-sm font-black text-[#df7606] -mt-2 animate-in fade-in duration-150">
                            {labels[picked]}
                        </p>
                    )}

                    <div className="flex gap-3 w-full">
                        <button
                            disabled={picked === 0}
                            onClick={() => saveRating(agent.id, picked)}
                            className="flex-1 bg-[#14a800] disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-black py-2.5 rounded-xl text-sm hover:bg-[#118b00] transition-all active:scale-95"
                        >
                            Submit Rating
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-black text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Agent Card Component
    const AgentCard = ({ agent, onBook, onToggleSave, isSaved }: { agent: any, onBook: () => void, onToggleSave: () => void, isSaved: boolean }) => {
        const agentRating = ratings[agent.id] ?? Math.round((agent.rating || 4.5) * 10) / 10;
        const agentRatingCount = ratings[agent.id] ? 1 : (agent.reviews_count ?? '--');
        return (
        <div className="p-4 sm:p-8 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all group relative">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                <div className="flex-1 w-full">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-50 dark:bg-[#14a800]/20 rounded-full flex items-center justify-center text-lg sm:text-xl font-black text-[#14a800] border border-[#14a800]/10 shrink-0">
                            {agent.name?.[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                            {agent.uuid ? (
                                <Link to={`/service/${agent.uuid}`} className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#14a800] group-hover:underline block transition-colors truncate">
                                    {agent.name}
                                </Link>
                            ) : (
                                <span className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 block truncate">
                                    {agent.name}
                                </span>
                            )}
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="font-medium truncate">{agent.agent_profile?.location_base || 'Abuja, Nigeria'}</span>
                            </div>
                        </div>
                    </div>
 
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-4 sm:mb-6">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star
                                    key={i}
                                    className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                                    style={{
                                        fill: i <= Math.round(typeof agentRating === 'number' ? agentRating : 4.9)
                                            ? '#df7606' : 'transparent',
                                        color: i <= Math.round(typeof agentRating === 'number' ? agentRating : 4.9)
                                            ? '#df7606' : '#d1d5db',
                                    }}
                                />
                            ))}
                            <span className="ml-1 font-bold text-neutral-900 dark:text-neutral-100">
                                {typeof agentRating === 'number' ? agentRating.toFixed(1) : '4.9'}/5
                            </span>
                            <span className="text-neutral-400 dark:text-neutral-500 text-[10px] sm:text-xs">({agentRatingCount})</span>
                        </div>
                        <span className="text-neutral-300 dark:text-neutral-700">•</span>
                        <span className="font-bold text-neutral-700 dark:text-neutral-300">50+ Jobs</span>
                    </div>
                    
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 sm:mb-6 line-clamp-2 italic">
                        "{agent.agent_profile?.bio || "Professional service provider available for immediate booking across Abuja."}"
                    </p>
 
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
                        {agent.services?.map((svc: any) => (
                            <span key={svc.id} className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                {svc.name}
                            </span>
                        ))}
                        {agent.is_vetted && (
                            <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/20 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#14a800] border border-green-100 dark:border-green-900/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Vetted
                            </span>
                        )}
                    </div>
  
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                            <button
                                onClick={() => setRatingTarget(agent)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border border-[#df7606]/40 text-[#df7606] text-[11px] sm:text-xs font-black hover:bg-[#df7606]/5 transition-all active:scale-95 whitespace-nowrap"
                            >
                                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#df7606] text-[#df7606]" />
                                {ratings[agent.id] ? 'Update' : 'Rate'}
                            </button>
                            <button
                                onClick={onBook}
                                className="flex-1 sm:flex-none bg-[#14a800] text-white px-3 sm:px-8 py-2 rounded-full font-black text-[11px] sm:text-xs hover:bg-[#118b00] transition-all shadow-lg shadow-green-100 dark:shadow-green-900/20 active:scale-95 whitespace-nowrap"
                            >
                                Book Now
                            </button>
                        </div>
                </div>
 
                <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
                    <button
                        onClick={onToggleSave}
                        className={cn(
                            "w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center transition-colors shadow-sm bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm",
                            isSaved ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        )}
                    >
                        <Heart className={cn("w-4 h-4 sm:w-5 sm:h-5", isSaved ? "fill-red-500 text-red-500" : "text-neutral-400 dark:text-neutral-500")} />
                    </button>
                </div>
            </div>
        </div>
        );
    };

    return (
        <>
        {ratingTarget && <RatingModal agent={ratingTarget} onClose={() => setRatingTarget(null)} />}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pb-20 dark:bg-neutral-950">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Feed Column */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Search Section */}
                    <div className="relative">
                    <div className="relative">
                        <div className="flex bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#14a800]/20 focus-within:border-[#14a800] transition-all">
                            <div className="flex-1 flex items-center px-6 py-4 gap-3">
                                <Search className="w-5 h-5 text-neutral-400" />
                                <input 
                                    type="text" 
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search for agents or services (e.g. Musa, Cleaning)..." 
                                    className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl text-sm font-medium placeholder-neutral-400 outline-none focus:border-[#14a800]/40 focus:bg-white dark:focus:bg-neutral-800 transition-all text-neutral-900 dark:text-neutral-100"                                     
                                />
                            </div>
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "bg-[#14a800] text-white px-8 py-4 font-bold hover:bg-[#118b00] transition-all flex items-center gap-2",
                                    showFilters && "bg-[#118b00]"
                                )}
                            >
                                <Filter className="w-4 h-4" /> Filter
                            </button>
                        </div>

                        {/* Expandable Filter Panel */}
                        {showFilters && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-6 z-20 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">Service Category</label>
                                        <div className="flex flex-wrap gap-2">
                                            <button 
                                                onClick={() => setCategory('')}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-sm font-bold border transition-all",
                                                    category === '' 
                                                        ? "bg-[#14a800] border-[#14a800] text-white shadow-md shadow-green-200 dark:shadow-green-900/20" 
                                                        : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600"
                                                )}
                                            >
                                                All Categories
                                            </button>
                                            {services?.filter((svc: any) => [
                                                'Home Cleaning', 
                                                'AC Maintenance', 
                                                'Plumbing Works', 
                                                'Laundry & Ironing', 
                                                'Generator Repair', 
                                                'Gardening'
                                            ].includes(svc.name)).map((svc: any) => {
                                                const svcCategory = svc.slug?.toUpperCase() || '';
                                                return (
                                                    <button 
                                                        key={svc.id}
                                                        onClick={() => setCategory(svcCategory)}
                                                        className={cn(
                                                            "px-4 py-2 rounded-full text-sm font-bold border transition-all",
                                                            category !== '' && category === svcCategory
                                                                ? "bg-[#14a800] border-[#14a800] text-white shadow-md shadow-green-200 dark:shadow-green-900/20" 
                                                                : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600"
                                                        )}
                                                    >
                                                        {svc.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">Abuja District</label>
                                        <select 
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm font-bold text-neutral-700 dark:text-neutral-300 outline-none focus:ring-2 focus:ring-[#14a800]/20"
                                        >
                                            <option value="">All Locations</option>
                                            {abuiaDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3">
                                    <button 
                                        onClick={() => {setCategory(''); setLocation('');}}
                                        className="px-6 py-2 text-sm font-bold text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                                    >
                                        Reset Filters
                                    </button>
                                    <button 
                                        onClick={() => setShowFilters(false)}
                                        className="bg-[#14a800] text-white px-8 py-2 rounded-full text-sm font-bold shadow-md active:scale-95"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    </div>

                    {/* Feed Header */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                        <div className="px-8 pt-6 border-b border-neutral-100 dark:border-neutral-800 flex flex-col gap-6">
                            <div className="flex gap-8 overflow-x-auto no-scrollbar">
                                {['Best Matches', 'Featured', 'Saved Pros'].map(tab => (
                                    <button 
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            "pb-4 font-bold text-sm transition-all relative",
                                            activeTab === tab ? "text-[#14a800]" : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                                        )}
                                    >
                                        {tab}
                                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#14a800] rounded-full" />}
                                    </button>
                                ))}
                            </div>
                        </div> 
 
                        {/* Feed Items */}
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {isLoading ? (
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                                </div>
                            ) : filteredAgents.length === 0 ? (
                                <div className="p-20 text-center">
                                    <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-10 h-10 text-neutral-200 dark:text-neutral-700" />
                                    </div>
                                    <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">No pros found</h4>
                                    <p className="text-neutral-500 dark:text-neutral-400">Add your favorite services here.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {pagedAgents.map((agent: any) => (
                                        <AgentCard
                                            key={agent.id}
                                            agent={agent}
                                            onBook={() => setSelectedAgentForBooking(agent)}
                                            onToggleSave={() => toggleSavePro(agent.id)}
                                            isSaved={savedProIds.includes(agent.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
 
                        {/* ── Pagination bar ── */}
                        {!isLoading && filteredAgents.length > 0 && (
                            <div className="px-8 py-5 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4">
                                {/* Result count */}
                                <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                                    {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredAgents.length)} of {filteredAgents.length} pros
                                </p>
 
                                {/* Page buttons */}
                                <div className="flex items-center gap-1.5">
                                    {/* Prev */}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:border-[#14a800] hover:text-[#14a800] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    </button>
 
                                    {/* Page numbers */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                        .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                                            acc.push(p);
                                            return acc;
                                        }, [])
                                        .map((item, idx) =>
                                            item === '...' ? (
                                                <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-sm font-bold">…</span>
                                            ) : (
                                                <button
                                                    key={item}
                                                    onClick={() => setCurrentPage(item as number)}
                                                    className={cn(
                                                        'w-9 h-9 rounded-xl text-sm font-black transition-all border',
                                                        currentPage === item
                                                            ? 'bg-[#14a800] text-white border-[#14a800] shadow-md shadow-green-200 dark:shadow-green-900/20'
                                                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-[#14a800] hover:text-[#14a800]'
                                                    )}
                                                >
                                                    {item}
                                                </button>
                                            )
                                        )
                                    }
 
                                    {/* Next */}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:border-[#14a800] hover:text-[#14a800] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar Column */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Client Profile Summary */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-brand-50 dark:bg-[#14a800]/20 rounded-full flex items-center justify-center text-3xl font-black text-[#14a800] border-2 border-white dark:border-neutral-800 shadow-xl ring-4 ring-neutral-50 dark:ring-neutral-800">
                                {user?.name?.[0]}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight mb-1">{user?.name}</h4>
                                <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{user?.role === 'AGENT' ? 'Pro' : 'Client'}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest">
                                    <span className="text-[#14a800]">Profile Completion</span>
                                    <span className={cn(
                                        'font-black',
                                        profileCompletion.percent === 100 ? 'text-[#14a800]' :
                                        profileCompletion.percent >= 60  ? 'text-amber-600' : 'text-red-500'
                                    )}>{profileCompletion.percent}%</span>
                                </div>
                                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            'h-full rounded-full transition-all duration-700',
                                            profileCompletion.percent === 100 ? 'bg-[#14a800]' :
                                            profileCompletion.percent >= 60  ? 'bg-amber-500' : 'bg-red-400'
                                        )}
                                        style={{ width: `${profileCompletion.percent}%` }}
                                    />
                                </div>

                                {/* Completion checklist */}
                                {profileCompletion.percent < 100 && (
                                    <ul className="mt-3 space-y-1.5">
                                        {profileCompletion.steps.map(s => (
                                            <li key={s.label} className="flex items-center gap-2 text-xs font-medium">
                                                <span className={cn(
                                                    'w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] shrink-0',
                                                    s.done
                                                        ? 'bg-[#14a800] text-white'
                                                        : 'border border-neutral-300 dark:border-neutral-700 text-neutral-300 dark:text-neutral-600'
                                                )}>
                                                    {s.done ? '✓' : ''}
                                                </span>
                                                <span className={s.done ? 'text-neutral-400 dark:text-neutral-600 line-through' : 'text-neutral-600 dark:text-neutral-400'}>
                                                    {s.label}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <Link
                                to="/cl/settings"
                                className="w-full text-sm font-bold text-[#14a800] hover:underline flex items-center gap-2"
                            >
                                {profileCompletion.percent === 100 ? 'View your profile' : 'Complete your profile'}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* My Stats */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h4 className="font-black text-sm text-neutral-900 dark:text-neutral-100 uppercase tracking-widest">My Stats</h4>
                            <Link to="/cl/settings?tab=stats" className="text-[10px] font-black text-[#14a800] hover:underline uppercase tracking-widest">View all</Link>
                        </div>

                        {/* KPI tiles */}
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            {[
                                { label: 'Points', value: user?.loyalty_points || 0, icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                                { label: 'Spent',  value: '₦0',                      icon: '💳', color: 'text-blue-600',  bg: 'bg-blue-50 dark:bg-blue-900/10'  },
                                { label: 'Jobs',   value: 0,                          icon: '🔧', color: 'text-[#14a800]', bg: 'bg-green-50 dark:bg-green-900/10' },
                            ].map(s => (
                                <div key={s.label} className={cn('rounded-xl p-3 flex flex-col items-center gap-1', s.bg)}>
                                    <span className="text-lg leading-none">{s.icon}</span>
                                    <span className={cn('text-base font-black leading-none', s.color)}>{s.value}</span>
                                    <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{s.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Mini activity bar chart */}
                        <div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Activity · Last 7 days</p>
                            <div className="flex items-end gap-1 h-10">
                                {[2, 5, 3, 7, 4, 6, 1].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                                        <div
                                            className="w-full rounded-sm bg-[#14a800]/20 hover:bg-[#14a800]/50 transition-colors"
                                            style={{ height: `${(h / 7) * 100}%` }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-1">
                                {['M','T','W','T','F','S','S'].map((d, i) => (
                                    <span key={i} className="flex-1 text-center text-[9px] font-black text-neutral-300 dark:text-neutral-700">{d}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Explore */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                        <h4 className="font-black text-sm text-neutral-900 dark:text-neutral-100 uppercase tracking-widest mb-4">Explore</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { to: '/cl/bookings',       icon: Briefcase,    label: 'My Bookings',  color: 'text-[#14a800]', bg: 'bg-[#14a800]/8 dark:bg-[#14a800]/10' },
                                { to: '/cl/messages/rooms/', icon: MessageCircle, label: 'Messages',     color: 'text-blue-600',  bg: 'bg-blue-50 dark:bg-blue-900/10' },
                                { to: '/cl/settings',       icon: SettingsIcon, label: 'Settings',     color: 'text-purple-600',bg: 'bg-purple-50 dark:bg-purple-900/10' },
                                { to: '/cl/settings?tab=help',  icon: HelpCircle,   label: 'Help & Support',color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                            ].map(item => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all group"
                                >
                                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.bg)}>
                                        <item.icon className={cn('w-5 h-5', item.color)} />
                                    </div>
                                    <span className="text-xs font-black text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 text-center transition-colors">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <BookingModal 
                agent={selectedAgentForBooking} 
                isOpen={!!selectedAgentForBooking} 
                onClose={() => setSelectedAgentForBooking(null)} 
            />
        </div>
        </>
    );
};

export default ClientDashboard;
