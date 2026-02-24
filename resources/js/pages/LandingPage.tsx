import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
    Search, 
    MapPin, 
    Star, 
    ShieldCheck, 
    Clock, 
    CheckCircle2, 
    ChevronRight, 
    ArrowUpRight,
    Users, 
    Sparkles, 
    Wrench,
    Zap,
    LifeBuoy,
    Shield,
    ThumbsUp,
    PlayCircle,
    ShoppingBasket,
    LayoutDashboard
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { cn, formatNaira } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';

const LandingPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoc, setSearchLoc] = useState('');
    const { isAuthenticated, user } = useAuthStore();

    const { data: services, isLoading } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const response = await axios.get('/services');
            return response.data;
        }
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/cl/find-service`); // Consolidated feed handles filtering
    };

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 font-inter selection:bg-brand-100 selection:text-brand-900 transition-colors duration-300">
            <Helmet>
                <title>Forafix | Abuja's #1 Home Service Marketplace</title>
                <meta name="description" content="Find the best house cleaners, plumbers, electricians, and market runners in Abuja. Vetted professionals, secure payments, guaranteed satisfaction." />
            </Helmet>

            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-white dark:bg-neutral-950 py-12 sm:py-20 lg:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                            <div className="max-w-2xl text-left order-2 lg:order-1 animate-in slide-in-from-left duration-700">
                                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-neutral-900 dark:text-neutral-50 mb-6 leading-[1.05] tracking-tight">
                                    How Abuja <br className="hidden sm:block" />
                                    <span className="text-[#14a800]">gets things done.</span>
                                </h1>
                                <p className="text-lg sm:text-xl text-neutral-500 mb-10 leading-relaxed font-medium">
                                    Forget the stress of finding reliable help. From deep cleaning to complex repairs, access top-rated, vetted professionals in Abuja instantly.
                                </p>

                                <div className="space-y-6">
                                    <form onSubmit={handleSearch} className="relative group max-w-xl">
                                        <div className="flex flex-col sm:flex-row bg-white dark:bg-neutral-800 rounded-2xl sm:rounded-full border border-neutral-200 dark:border-neutral-700 shadow-xl dark:shadow-black/40 overflow-hidden focus-within:ring-2 focus-within:ring-[#14a800]/20 focus-within:border-[#14a800] transition-all">
                                            <div className="flex-1 flex items-center px-6 py-4 gap-3 border-b sm:border-b-0 sm:border-r border-neutral-100 dark:border-neutral-700">
                                                <Search className="w-5 h-5 text-neutral-400" />
                                                <input 
                                                    type="text" 
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search for any service..." 
                                                    className="w-full focus:outline-none text-neutral-800 dark:text-neutral-100 font-semibold placeholder:text-neutral-400 bg-transparent !bg-transparent" 
                                                />
                                            </div>
                                            <button type="submit" className="bg-[#14a800] text-white px-8 py-4 font-bold hover:bg-[#118b00] transition-all flex items-center justify-center gap-2">
                                                Search <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </form>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Popular:</span>
                                        {['Cleaning', 'AC Repair', 'Plumbing'].map(tag => (
                                            <button 
                                                key={tag}
                                                onClick={() => navigate(`/cl/find-service`)}
                                                className="px-4 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-all"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="relative order-1 lg:order-2 animate-in fade-in zoom-in duration-1000">
                                <div className="aspect-[4/5] sm:aspect-square relative rounded-[3rem] overflow-hidden shadow-2xl rotate-2">
                                    <img src="/images/hero.png" alt="Professional services" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                                </div>
                                {/* Floating Badges */}
                                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-700 animate-bounce-subtle hidden sm:block">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-[#14a800]">
                                            <Star className="w-6 h-6 fill-current" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-black text-neutral-900 dark:text-neutral-100">4.9/5</div>
                                            <div className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Top Rated Agents</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-10 -right-6 bg-blue-600 p-4 rounded-2xl shadow-2xl text-white animate-float hidden lg:block">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5" />
                                        <span className="text-sm font-bold">100% Vetted</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories Grid */}
                <section className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 tracking-tight">Browse services by category</h2>
                                <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed italic">
                                    "The quickest way to get things fixed in Abuja."
                                </p>
                            </div>
                            <Link to="/cl/find-service" className="group flex items-center gap-2 text-[#14a800] font-bold text-lg hover:underline transition-all">
                                See all categories <div className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center group-hover:bg-[#14a800] group-hover:text-white group-hover:border-transparent transition-all"><ArrowUpRight className="w-5 h-5" /></div>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { name: 'House Cleaning', img: '/images/cleaning.png', icon: Sparkles, count: '120+ Agents', color: 'bg-orange-50' },
                                { name: 'AC & Repairs', img: '/images/ac_repair.png', icon: Wrench, count: '85+ Agents', color: 'bg-blue-50' },
                                { name: 'Plumbing', img: '/images/plumbing.png', icon: LifeBuoy, count: '64+ Agents', color: 'bg-cyan-50' },
                                { name: 'Market Runs', img: '/images/market_runs.png', icon: ShoppingBasket, count: '42+ Agents', color: 'bg-green-50' }
                            ].map((cat, i) => (
                                <Link 
                                    key={i} 
                                    to={`/cl/find-service`}
                                    className="group bg-white dark:bg-neutral-800 rounded-[2rem] border border-neutral-100 dark:border-neutral-700 p-4 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                                >
                                    <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 relative">
                                        <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-4 left-4">
                                            <div className={cn("p-3 rounded-xl shadow-lg text-neutral-900 flex items-center justify-center", cat.color)}>
                                                <cat.icon className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-2 pb-2">
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1 group-hover:text-[#14a800] transition-colors">{cat.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">{cat.count}</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-[#14a800] fill-current" />
                                                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">4.9</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works Section with Media Styling */}
                <section className="py-24 bg-white dark:bg-neutral-950 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-[#14a800] rounded-[3rem] overflow-hidden flex flex-col lg:flex-row relative">
                            <div className="lg:w-1/2 p-12 lg:p-20 text-white z-10">
                                <h2 className="text-4xl sm:text-5xl font-bold mb-8 tracking-tight">Post a job and hire an Agent</h2>
                                <div className="space-y-10">
                                    {[
                                        { title: 'Post a job for free', desc: 'Tell us about your home service needs. We will match you with top-rated professionals in Abuja.' },
                                        { title: 'Choose the best agent', desc: 'Review profiles, ratings, and quotes. Chat with agents before you hire.' },
                                        { title: 'Secure payment', desc: 'Pay safely through Forafix. We hold funds in escrow until you are 100% satisfied.' }
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl group-hover:bg-white group-hover:text-[#14a800] transition-all duration-300">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                                <p className="text-white/80 font-medium leading-relaxed">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="mt-12 bg-white text-[#14a800] px-10 py-4 rounded-full font-bold hover:bg-neutral-100 transition-all shadow-xl active:scale-95">
                                    Get Started
                                </button>
                            </div>
                            <div className="lg:w-1/2 relative bg-neutral-900 flex items-center justify-center p-8 sm:p-12">
                                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
                                    <img src="/images/hero.png" alt="Video cover" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <PlayCircle className="w-20 h-20 text-white fill-white/10 group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                            <p className="text-white text-sm font-bold flex items-center gap-2">
                                                <Users className="w-4 h-4" /> Watch how Obioma found a cleaner in 2 mins
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Real results / Testimonials */}
                <section className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 tracking-tight">Trusted by thousands of Abujans</h2>
                            <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium">Real results from our satisfied clients</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { name: 'Sarah A.', loc: 'Asokoro', text: 'Forafix saved my weekend! Found an electrician within 30 minutes for a fuse box emergency.', stars: 5 },
                                { name: 'Musa D.', loc: 'Maitama', text: 'The market run service is a game changer for busy professionals. Everything was fresh and on time.', stars: 5 },
                                { name: 'Chioma E.', loc: 'Gwarinpa', text: 'Vetted professionals you can actually trust. The escrow payment gives me total peace of mind.', stars: 5 }
                            ].map((rev, i) => (
                                <div key={i} className="bg-white dark:bg-neutral-800 p-10 rounded-[2.5rem] shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-xl dark:hover:shadow-black/40 transition-shadow relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 dark:bg-brand-900/10 rounded-bl-[100px] -mr-10 -mt-10 group-hover:bg-[#14a800]/10 transition-colors" />
                                    <div className="flex gap-1 mb-6 text-[#14a800]">
                                        {[...Array(rev.stars)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                                    </div>
                                    <p className="text-neutral-800 font-bold text-lg mb-8 leading-relaxed italic">
                                        "{rev.text}"
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center font-black text-brand-600 dark:text-brand-400">
                                            {rev.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-neutral-900 dark:text-neutral-100">{rev.name}</div>
                                            <div className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{rev.loc}, Abuja</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer Banner */}
                <section className="py-24 px-4">
                    <div className="max-w-7xl mx-auto bg-neutral-900 rounded-[3rem] p-12 sm:p-24 text-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#14a800]/20 to-transparent" />
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-4xl sm:text-6xl font-bold mb-8 tracking-tight">Ready to get your <br /> home fixed?</h2>
                            <p className="text-xl text-neutral-400 mb-12 font-medium">Join over 10,000 users in Abuja who trust Forafix for their home services.</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link to="/register" className="w-full sm:w-auto bg-[#14a800] text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-[#118b00] transition-all shadow-2xl active:scale-95">
                                    Join Forafix Now
                                </Link>
                                <Link to="/register/agent" className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition-all active:scale-95">
                                    Become an Agent
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;
