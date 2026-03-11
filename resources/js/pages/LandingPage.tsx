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
    LayoutDashboard,
    ArrowRight,
    StarHalf,
    Award,
    Briefcase,
    Settings,
    Headphones,
    CreditCard,
    ArrowDown,
    Shirt,
    Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

            <main className="relative">
                {/* Hero Section */}
                <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-32 overflow-hidden">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-100/30 dark:bg-brand-900/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[120px]" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                            <div className="lg:col-span-7 space-y-8">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950 border border-brand-100 dark:border-brand-900 text-brand-700 dark:text-brand-400 text-sm font-bold"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Abuja's Most Trusted Service Marketplace</span>
                                </motion.div>

                                <motion.h1 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className="text-5xl sm:text-7xl lg:text-8xl font-black text-neutral-900 dark:text-neutral-50 leading-[0.95] tracking-tighter"
                                >
                                    Your home, <br />
                                    <span className="text-brand-600 dark:text-brand-500">perfectly fixed.</span>
                                </motion.h1>

                                <motion.p 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="text-xl text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed font-medium"
                                >
                                    Connect with verified professionals for cleaning, repairs, and more. Instant booking, transparent pricing, and Abuja's best service quality.
                                </motion.p>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className="flex flex-col sm:flex-row gap-4 pt-4"
                                >
                                    <form onSubmit={handleSearch} className="flex-1 max-w-md group">
                                        <div className="relative flex items-center bg-white dark:!bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg group-focus-within:ring-4 group-focus-within:ring-brand-500/10 group-focus-within:border-brand-500 transition-all duration-300">
                                            <div className="pl-5">
                                                <Search className="w-5 h-5 text-neutral-400 group-focus-within:text-brand-500 transition-colors" />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="What do you need help with?" 
                                                className="w-full h-16 bg-transparent dark:!bg-transparent px-4 focus:outline-none text-neutral-900 dark:text-white font-bold placeholder:text-neutral-400 dark:placeholder:text-neutral-500" 
                                            />
                                            <div className="pr-2">
                                                <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white h-12 px-6 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-brand-500/20">
                                                    Find <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                    
                                    <div className="flex -space-x-3 items-center px-2">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-950 bg-neutral-200 dark:bg-neutral-800 overflow-hidden shadow-sm">
                                                <img src={`/images/avatar_${i}.png`} alt="user" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                        <div className="pl-6">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                <span className="font-bold text-neutral-900 dark:text-neutral-100">4.9/5</span>
                                            </div>
                                            <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Happy Clients</div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1, delay: 0.8 }}
                                    className="flex flex-wrap items-center gap-4 pt-2"
                                >
                                    <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Popular:</span>
                                    {['Home Cleaning', 'AC Maintenance', 'Plumbing', 'Market Runs'].map(tag => (
                                        <button 
                                            key={tag}
                                            onClick={() => navigate(`/cl/find-service`)}
                                            className="px-4 py-2 rounded-xl bg-neutral-100/50 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-bold border border-neutral-200/50 dark:border-neutral-800/50 hover:border-brand-500 transition-all shadow-sm"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </motion.div>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="lg:col-span-5 relative"
                            >
                                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border-8 border-white dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-800">
                                    <img src="/images/section_branding_nigerian.png" alt="Professional worker" className="w-full h-full object-cover object-right" />
                                    
                                    {/* Floating Stats UI */}
                                    <motion.div 
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute -top-4 -left-8 bg-white dark:bg-neutral-800 p-3.5 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-700 flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-base font-black text-neutral-900 dark:text-neutral-100 italic">100% Vetted</div>
                                            <div className="text-[10px] font-bold text-neutral-400">Secure Services</div>
                                        </div>
                                    </motion.div>

                                    <motion.div 
                                        animate={{ y: [0, 10, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        className="absolute bottom-10 -right-8 bg-white dark:bg-neutral-800 p-3.5 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-700 flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-brand-600">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-base font-black text-neutral-900 dark:text-neutral-100 italic">Fast Booking</div>
                                            <div className="text-[10px] font-bold text-neutral-400">Within 30 Mins</div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Trust Bar */}
                <section className="py-12 border-y border-neutral-100 dark:border-neutral-900 bg-white dark:bg-neutral-950">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap justify-center lg:justify-between items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {['Trusted by 10k+ Houses', 'Verified Professionals', 'Secure Payments', '24/7 Support'].map((text, i) => (
                                <div key={i} className="flex items-center gap-2 font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Categories Grid */}
                <section className="py-24 sm:py-32 bg-neutral-50/50 dark:bg-neutral-900/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                            <div className="max-w-2xl space-y-4">
                                <motion.h2 
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight"
                                >
                                    Services for <br />
                                    <span className="text-brand-600">every need.</span>
                                </motion.h2>
                                <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium max-w-md">
                                    Choose from our wide range of professional services, all vetted and guaranteed for quality.
                                </p>
                            </div>
                            <Link to="/cl/find-service" className="group inline-flex items-center gap-3 bg-white dark:bg-neutral-900 px-6 py-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 font-bold text-neutral-900 dark:text-neutral-100 hover:border-brand-500 transition-all shadow-sm">
                                View All Categories 
                                <span className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { name: 'Home Cleaning', img: '/images/cleaning_nigerian.png', icon: Sparkles, count: '120+', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                { name: 'AC Maintenance', img: '/images/ac_repair_nigerian.png', icon: Wrench, count: '85+', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { name: 'Plumbing Works', img: '/images/plumbing_nigerian.png', icon: Droplets, count: '64+', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                                { name: 'Laundry & Ironing', img: '/images/laundry_nigerian.png', icon: Shirt, count: '42+', color: 'text-green-500', bg: 'bg-green-500/10' }
                            ].map((cat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Link 
                                        to={`/cl/find-service`}
                                        className="group block relative bg-white dark:bg-neutral-900 rounded-[2.5rem] p-4 border border-neutral-100 dark:border-neutral-800 hover:border-brand-500/50 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden"
                                    >
                                        <div className="aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 relative">
                                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            
                                            <div className="absolute top-4 left-4">
                                                <div className={cn("w-12 h-12 rounded-2xl backdrop-blur-md flex items-center justify-center shadow-lg", cat.bg, cat.color)}>
                                                    <cat.icon className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="px-3 pb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100 group-hover:text-brand-600 transition-colors">{cat.name}</h3>
                                                <div className="flex items-center gap-1.5 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded-lg">
                                                    <Star className="w-3 h-3 text-brand-600 fill-brand-600" />
                                                    <span className="text-[10px] font-black text-brand-700 dark:text-brand-400">4.9</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-neutral-400">{cat.count} Agents</span>
                                                <span className="text-xs font-black text-brand-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all flex items-center gap-1">
                                                    BOOK NOW <ChevronRight className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works / Process Section */}
                <section className="py-24 sm:py-32 bg-white dark:bg-neutral-950 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-neutral-900 dark:bg-neutral-900/50 rounded-[4rem] overflow-hidden flex flex-col lg:flex-row relative">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-600/10 pointer-events-none" />
                            
                            <div className="lg:w-1/2 p-12 lg:p-24 text-white z-10">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-4xl sm:text-6xl font-black mb-10 tracking-tighter leading-none">
                                        Hire an Agent <br />
                                        <span className="text-brand-500 italic">in minutes.</span>
                                    </h2>
                                    
                                    <div className="space-y-12">
                                        {[
                                            { title: 'Describe your task', desc: 'Tell us what you need. We will find the perfect agent for your home.', icon: Briefcase },
                                            { title: 'Pick your Agent', desc: 'Compare profiles, reviews, and quotes. Hire the one you like best.', icon: Users },
                                            { title: 'Pay with peace', desc: 'Secure escrow payments. Your money stays safe until the job is done.', icon: ShieldCheck }
                                        ].map((step, i) => (
                                            <div key={i} className="flex gap-8 group">
                                                <div className="flex-shrink-0 w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-brand-600 group-hover:border-brand-600 transition-all duration-500">
                                                    <step.icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black mb-3 text-white">{step.title}</h3>
                                                    <p className="text-neutral-400 font-medium leading-relaxed max-w-sm">{step.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="pt-8">
                                        <button className="bg-brand-600 hover:bg-brand-700 text-white px-12 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-brand-600/30 active:scale-95 flex items-center gap-3">
                                            Get Started Now <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                            
                            <div className="lg:w-1/2 relative min-h-[500px] flex items-center justify-center p-12 lg:p-24">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="relative w-full aspect-square max-w-md"
                                >
                                    <div className="absolute inset-0 bg-brand-600 rounded-full blur-[100px] opacity-20 animate-pulse" />
                                    <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10 group cursor-pointer aspect-video sm:aspect-square bg-neutral-100 dark:bg-neutral-800">
                                        <img src="/images/section_branding_nigerian.png" alt="Process demonstration" className="w-full h-full object-cover object-right opacity-80 group-hover:scale-105 transition-all duration-1000" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-brand-600 shadow-2xl group-hover:scale-110 transition-transform">
                                                <PlayCircle className="w-12 h-12 fill-current" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Abstract UI elements */}
                                    <div className="absolute -top-6 -right-6 bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-700 flex items-center gap-3 animate-bounce-subtle">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-black text-neutral-900 dark:text-neutral-100">Task Completed!</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Real results / Testimonials */}
                <section className="py-24 sm:py-32 bg-neutral-50/50 dark:bg-neutral-900/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                            <div className="max-w-2xl space-y-4">
                                <motion.h2 
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight"
                                >
                                    Trusted by <br />
                                    <span className="text-brand-600">thousands.</span>
                                </motion.h2>
                                <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium">Real results from our satisfied clients across Abuja.</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
                                <div className="flex -space-x-3">
                                    {[1,2,3,4].map(i => (
                                        <img key={i} src={`/images/avatar_${i}.png`} className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-800" alt="user" />
                                    ))}
                                </div>
                                <div className="text-sm">
                                    <div className="flex items-center gap-1 text-amber-500">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                    </div>
                                    <div className="font-black text-neutral-900 dark:text-neutral-100">4.9/5 Average Rating</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { name: 'Sarah A.', loc: 'Asokoro', text: 'Forafix saved my weekend! Found an electrician within 30 minutes for a fuse box emergency.', stars: 5 },
                                { name: 'Musa D.', loc: 'Maitama', text: 'The market run service is a game changer for busy professionals. Everything was fresh and on time.', stars: 5 },
                                { name: 'Chioma E.', loc: 'Gwarinpa', text: 'Vetted professionals you can actually trust. The escrow payment gives me total peace of mind.', stars: 5 }
                            ].map((rev, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-white dark:bg-neutral-900 p-10 rounded-[2.5rem] shadow-sm border border-neutral-100 dark:border-neutral-800 hover:shadow-2xl transition-all relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 dark:bg-brand-900/10 rounded-bl-[100px] -mr-10 -mt-10 group-hover:bg-brand-600/10 transition-colors" />
                                    <div className="flex gap-1 mb-8 text-brand-600">
                                        {[...Array(rev.stars)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                                    </div>
                                    <p className="text-neutral-800 dark:text-neutral-100 font-bold text-xl mb-12 leading-relaxed">
                                        "{rev.text}"
                                    </p>
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center font-black text-2xl text-brand-600 dark:text-brand-400">
                                            {rev.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-black text-xl text-neutral-900 dark:text-neutral-100 leading-none mb-1">{rev.name}</div>
                                            <div className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{rev.loc}, Abuja</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer Banner CTA */}
                <section className="py-24 px-4 overflow-hidden relative">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-brand-600 rounded-[4rem] px-8 py-20 lg:py-32 text-center text-white relative overflow-hidden shadow-2xl shadow-brand-600/20"
                        >
                            {/* Abstract Shapes */}
                            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-[120px]" />
                                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-black/10 rounded-full blur-[120px]" />
                            </div>

                            <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                                <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                                    Ready to get <br />
                                    <span className="text-brand-950/40">things done?</span>
                                </h2>
                                <p className="text-xl lg:text-2xl text-white/80 font-medium max-w-xl mx-auto">Join over 10,000 users in Abuja who trust Forafix for their home services.</p>
                                
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                                    <Link to="/register" className="w-full sm:w-auto bg-white text-brand-600 px-14 py-6 rounded-2xl font-black text-xl hover:bg-neutral-100 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3">
                                        Join Forafix Now <ArrowRight className="w-6 h-6" />
                                    </Link>
                                    <Link to="/register/agent" className="w-full sm:w-auto bg-brand-700/50 backdrop-blur-md border border-white/20 text-white px-14 py-6 rounded-2xl font-black text-xl hover:bg-brand-700 transition-all active:scale-95">
                                        Become an Agent
                                    </Link>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-8 pt-10 opacity-60">
                                    {['Vetted Pros', 'Secure Payments', '24/7 Support'].map(text => (
                                        <div key={text} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">
                                            <CheckCircle2 className="w-4 h-4" />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;
