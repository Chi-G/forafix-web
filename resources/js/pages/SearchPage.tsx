import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Filter, SlidersHorizontal, Star, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { cn, formatNaira } from '../lib/utils';
import ServiceCard from '../components/ServiceCard';

const ABUJA_AREAS = ['Maitama', 'Asokoro', 'Wuse 2', 'Garki', 'Gwarinpa', 'Jabi', 'Central Area'];

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [location, setLocation] = useState(searchParams.get('loc') || 'Abuja');
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const { data: services, isLoading } = useQuery({
        queryKey: ['services', query],
        queryFn: async () => {
            const response = await axios.get('/services');
            // Basic frontend filtering for now, real filtering should be on backend
            const data = response.data;
            if (!query) return data;
            return data.filter((s: any) => 
                s.name.toLowerCase().includes(query.toLowerCase()) || 
                s.description.toLowerCase().includes(query.toLowerCase())
            );
        }
    });

    const toggleArea = (area: string) => {
        setSelectedAreas(prev => 
            prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20 transition-colors duration-300">
            <Helmet>
                <title>{query ? `${query} Pros in Abuja` : 'Find Home Service Professionals in Abuja'} | Forafix</title>
                <meta name="description" content={`Find verified professionals for ${query || 'home services'} in Abuja. Review profiles, check ratings, and book instantly.`} />
            </Helmet>
            {/* Search Header */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
                <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
                    <Link to="/" className="text-2xl font-black text-brand-600 hidden md:block font-inter tracking-tighter">Forafix</Link>
                    
                    <div className="flex-1 flex bg-neutral-100 dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700 p-1 max-w-2xl">
                        <div className="hidden sm:flex items-center px-4 gap-2 border-r border-neutral-200 dark:border-neutral-700">
                            <Search className="w-4 h-4 text-neutral-400" />
                            <input 
                                type="text" 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Service needed?" 
                                className="bg-transparent focus:outline-none text-sm font-bold font-inter w-32 dark:text-neutral-100" 
                            />
                        </div>
                        <div className="flex-1 flex items-center px-4 gap-2">
                            <MapPin className="w-4 h-4 text-neutral-400" />
                            <input 
                                type="text" 
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Where in Abuja?" 
                                className="bg-transparent focus:outline-none text-sm font-bold font-inter w-full dark:text-neutral-100" 
                            />
                        </div>
                        <button className="bg-brand-600 text-white p-2 px-6 rounded-full hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-95">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Login</Link>
                        <Link to="/register" className="bg-brand-600 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-brand-600/20 active:scale-95">Sign Up</Link>
                    </div>
                </header>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-64 space-y-8 flex-shrink-0">
                        <div className="hidden lg:block space-y-8 animate-in fade-in slide-in-from-left-2 duration-500">
                            {/* Abuja Districts */}
                            <div>
                                <h3 className="font-black text-neutral-900 mb-5 font-inter text-xs uppercase tracking-[0.15em]">Abuja Districts</h3>
                                <div className="space-y-4">
                                    {ABUJA_AREAS.map(area => (
                                        <label key={area} className="flex items-center justify-between group cursor-pointer" onClick={() => toggleArea(area)}>
                                            <span className={cn(
                                                "text-sm font-bold transition-colors",
                                                selectedAreas.includes(area) ? "text-brand-600" : "text-neutral-500 group-hover:text-neutral-900"
                                            )}>{area}</span>
                                            <div className={cn(
                                                "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                                                selectedAreas.includes(area) ? "bg-brand-600 border-brand-600 shadow-md shadow-brand-600/20" : "border-neutral-200 dark:border-neutral-700 group-hover:border-neutral-300 dark:group-hover:border-neutral-500"
                                            )}>
                                                {selectedAreas.includes(area) && <Check className="w-3 h-3 text-white stroke-[4]" />}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Trust Signals */}
                            <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="w-12 h-6 bg-neutral-200 dark:bg-neutral-800 rounded-full relative transition-colors group-hover:bg-neutral-300 dark:group-hover:bg-neutral-700">
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-neutral-400 rounded-full shadow-lg" />
                                    </div>
                                    <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 font-inter">Verified Pros Only</span>
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Results Area */}
                    <div className="flex-1 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-black text-neutral-900 font-inter tracking-tight">
                                    {query ? `Results for "${query}"` : 'Home Services in Abuja'}
                                </h1>
                                <p className="text-sm text-neutral-500 font-inter mt-1">{services?.length || 0} professionals available near you</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                                    className="lg:hidden flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-4 py-2 rounded-xl shadow-sm"
                                >
                                    <SlidersHorizontal className="w-4 h-4" /> Filters
                                </button>
                                <div className="hidden md:flex items-center gap-3 text-sm text-neutral-500 font-inter">
                                    <span className="font-medium">Sort:</span>
                                    <button className="font-bold text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                                        Top Rated <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {showMobileFilters && (
                            <div className="lg:hidden bg-white p-6 rounded-2xl border border-neutral-200 mb-8 animate-in slide-in-from-top duration-300">
                                <h3 className="font-black text-neutral-900 mb-5 font-inter text-xs uppercase tracking-[0.15em]">Abuja Districts</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {ABUJA_AREAS.map(area => (
                                        <label key={area} className="flex items-center justify-between group cursor-pointer" onClick={() => toggleArea(area)}>
                                            <span className={cn(
                                                "text-xs font-bold transition-colors",
                                                selectedAreas.includes(area) ? "text-brand-600" : "text-neutral-500"
                                            )}>{area}</span>
                                            <div className={cn(
                                                "w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all",
                                                selectedAreas.includes(area) ? "bg-brand-600 border-brand-600" : "border-neutral-200"
                                            )}>
                                                {selectedAreas.includes(area) && <Check className="w-2 h-2 text-white stroke-[4]" />}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white border border-neutral-100 rounded-2xl h-64 animate-pulse shadow-sm" />
                                ))}
                            </div>
                        ) : services?.length === 0 ? (
                            <div className="py-20 text-center bg-white rounded-3xl border border-neutral-100 shadow-sm">
                                <Search className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-neutral-900 font-inter">No services found</h3>
                                <p className="text-neutral-500 font-inter max-w-xs mx-auto mt-2">Try searching for something else like "Cleaning" or "Plumbing".</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in duration-500">
                                {services?.map((service: any) => (
                                    <ServiceCard 
                                        key={service.id} 
                                        category={{
                                            id: service.id,
                                            name: service.name,
                                            slug: service.name.toLowerCase().replace(/\s+/g, '-'),
                                            icon: service.icon,
                                            description: service.description,
                                            starting_price: service.base_price
                                        }} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SearchPage;
