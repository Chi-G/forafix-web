import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ChevronLeft, 
    Star, 
    ShieldCheck, 
    MapPin, 
    CheckCircle2, 
    MessageSquare, 
    Loader2,
    Award,
    Heart,
    Share2,
    Verified,
    Activity,
    ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { formatNaira, cn } from '../lib/utils';
import BookingModal from '../components/BookingModal';
import { toast } from 'react-hot-toast';

const AgentDetailPage = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    
    const { data: agent, isLoading, isError } = useQuery({
        queryKey: ['agent', uuid],
        queryFn: async () => {
            const response = await axios.get(`/agents/${uuid}`);
            return response.data;
        },
        enabled: !!uuid && uuid !== 'null',
        retry: false
    });

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    if (isLoading && uuid !== 'null') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 transition-colors">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[#14a800]" />
                    <p className="text-neutral-400 font-black uppercase tracking-widest text-xs">Loading Expert Profile...</p>
                </div>
            </div>
        );
    }

    if (!agent || uuid === 'null' || isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
                <div className="text-center px-4">
                    <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <ShieldCheck className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
                    </div>
                    <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-100 mb-3 tracking-tight">Professional not found</h2>
                    <p className="text-neutral-500 mb-10 font-bold max-w-xs mx-auto">This profile might have been moved or removed from our directory.</p>
                    <Link to="/cl/find-service" className="inline-flex items-center gap-2 bg-neutral-900 dark:bg-neutral-800 text-white px-10 py-5 rounded-full font-black text-sm hover:bg-black dark:hover:bg-neutral-700 transition-all shadow-xl active:scale-95">
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors">
            {/* Premium Header */}
            <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link to="/cl/find-service" className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white font-black transition-colors uppercase tracking-widest text-[10px]">
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleShare}
                            className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <Share2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        </button>
                        <button 
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className={cn(
                                "w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center transition-all",
                                isWishlisted ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-500" : "hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-400"
                            )}
                        >
                            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                        </button>
                    </div>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* Left: Professional Visuals & Info */}
                    <div className="lg:col-span-7 space-y-16">
                        <div className="relative">
                            <div className="flex items-end gap-8 mb-12">
                                <div className="relative group">
                                    <div className="w-32 h-32 bg-brand-50 dark:bg-brand-900/20 rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-[#14a800] border-4 border-white dark:border-neutral-800 shadow-2xl relative z-10 transition-transform group-hover:scale-105 duration-500">
                                        {agent.name?.[0]}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-neutral-900 dark:bg-neutral-700 text-white p-2 rounded-xl shadow-xl z-20 border-2 border-white dark:border-neutral-800">
                                        <ShieldCheck className="w-5 h-5 text-[#14a800]" />
                                    </div>
                                    <div className="absolute inset-0 bg-[#14a800]/20 rounded-[2.5rem] blur-2xl -z-10 group-hover:bg-[#14a800]/30 transition-colors" />
                                </div>
                                <div className="pb-2">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">{agent.name}</h1>
                                        {agent.is_vetted && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#14a800]/10 text-[#14a800] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#14a800]/20 dark:border-[#14a800]/40">
                                                <Verified className="w-3.5 h-3.5" /> Forafix Vetted
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-6 text-sm font-bold text-neutral-500">
                                        <div className="flex items-center gap-1.5 grayscale opacity-70">
                                            <MapPin className="w-4 h-4 text-[#14a800]" />
                                            {agent.agent_profile?.location_base || 'Abuja, Nigeria'}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Activity className="w-4 h-4 text-[#14a800] animate-pulse" />
                                            <span className="text-[#14a800]">Online Now</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                                {[
                                    { label: 'Rating', value: '4.9/5', sub: '50+ Reviews', icon: Star },
                                    { label: 'Jobs', value: '120+', sub: 'Completed', icon: CheckCircle2 },
                                    { label: 'Experience', value: '5 Years', sub: 'Expert Level', icon: Award },
                                    { label: 'Response', value: '< 1hr', sub: 'Super Fast', icon: MessageSquare },
                                ].map((stat, i) => (
                                    <div key={i} className="p-6 bg-neutral-50/50 dark:bg-neutral-800/50 rounded-3xl border border-neutral-100 dark:border-neutral-700 hover:border-neutral-200 dark:hover:border-neutral-600 transition-colors group">
                                        <stat.icon className="w-5 h-5 text-[#14a800] mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1">{stat.label}</p>
                                        <p className="text-xl font-black text-neutral-900 dark:text-neutral-100">{stat.value}</p>
                                        <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{stat.sub}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-8">
                                <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 underline decoration-[#14a800] decoration-4 underline-offset-8">Professional Bio</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 text-xl leading-relaxed font-medium italic">
                                    "{agent.agent_profile?.bio || 'Passionate professional dedicated to delivering excellence across all service areas in the heart of Abuja.'}"
                                </p>
                                
                                <div className="flex flex-wrap gap-2">
                                    {((Array.isArray(agent.agent_profile?.skills) 
                                        ? agent.agent_profile.skills 
                                        : agent.agent_profile?.skills?.split(',')) || []).map((skill: string, i: number) => (
                                        <span key={i} className="px-5 py-2.5 bg-neutral-900 dark:bg-neutral-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-neutral-100 dark:shadow-black/40">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">Expertise & Services</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {agent.services?.map((svc: any) => (
                                    <div key={svc.id} className="p-8 rounded-[2.5rem] border-2 border-neutral-100 dark:border-neutral-700 hover:border-[#14a800] dark:hover:border-[#14a800] transition-all bg-white dark:bg-neutral-800 group relative overflow-hidden">
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#14a800]/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                                        <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100 mb-2 relative z-10">{svc.name}</h3>
                                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 line-clamp-2 relative z-10">{svc.description}</p>
                                        <div className="flex items-center justify-between relative z-10 mt-auto">
                                            <p className="text-[#14a800] font-black">{formatNaira(svc.base_price)} <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase">(Starting)</span></p>
                                            <button 
                                                onClick={() => setIsBookingOpen(true)}
                                                className="w-10 h-10 bg-neutral-900 dark:bg-neutral-700 text-white rounded-xl flex items-center justify-center hover:bg-[#14a800] transition-colors"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Sticky Booking Panel */}
                    <div className="lg:col-span-5 sticky top-32">
                        <div className="bg-neutral-900 rounded-[3.5rem] p-12 text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#14a800]/10 rounded-full -ml-16 -mb-16" />
                            
                            <div className="relative z-10">
                                <div className="mb-12">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4 block">Standard Service Rate</p>
                                    <div className="flex items-end gap-3 mb-2">
                                        <span className="text-6xl font-black text-[#14a800]">{formatNaira(agent.services?.[0]?.base_price || 0)}</span>
                                        <span className="text-neutral-500 font-bold mb-2">/ Job</span>
                                    </div>
                                    <p className="text-sm text-neutral-500 font-bold italic opacity-60">Inclusive of transportation in central Abuja</p>
                                </div>

                                <div className="space-y-4 mb-12">
                                    {[
                                        'Official Forafix Invoice Provided',
                                        'Verified Equipment & Skills',
                                        'Secure Payment via Escrow',
                                        'Free Cancellation within 2 Hours'
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-4 text-sm font-bold">
                                            <div className="w-6 h-6 bg-[#14a800]/20 rounded-full flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-[#14a800]" />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => setIsBookingOpen(true)}
                                    className="w-full bg-[#14a800] text-white py-7 rounded-[2.5rem] font-black text-xl hover:bg-[#118b00] transition-all shadow-2xl shadow-green-900/50 active:scale-[0.98]"
                                >
                                    Book This Service
                                </button>
                                
                                <div className="mt-10 pt-10 border-t border-white/5 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-4">Secure & Encrypted</p>
                                    <div className="flex justify-center gap-6 opacity-30">
                                        <ShieldCheck className="w-8 h-8" />
                                        <Award className="w-8 h-8" />
                                        <Star className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <BookingModal 
                agent={agent}
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
            />
        </div>
    );
};

export default AgentDetailPage;
