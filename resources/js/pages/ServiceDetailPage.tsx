import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Star, ShieldCheck, Clock, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { formatNaira } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';
import BookingModal from '../components/BookingModal';
import ReviewCard from '../components/ReviewCard';
import RatingSummary from '../components/RatingSummary';

const ServiceDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    
    const { data: service, isLoading, error } = useQuery({
        queryKey: ['service', slug],
        queryFn: async () => {
            const response = await axios.get(`/services/${slug}`);
            return response.data;
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto mb-4" />
                    <p className="text-neutral-500 font-inter">Loading service details...</p>
                </div>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="text-center bg-white p-12 rounded-3xl border border-neutral-200 shadow-sm max-w-md">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2 font-inter">Service Not Found</h2>
                    <p className="text-neutral-500 mb-8 font-inter">The service you're looking for might have been moved or deleted.</p>
                    <Link to="/" className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all inline-block">
                        Return to Browse
                    </Link>
                </div>
            </div>
        );
    }

    const handleBookNow = () => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            setIsBookingOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            <Helmet>
                <title>{service.name} in Abuja | Forafix</title>
                <meta name="description" content={`Book professional ${service.name} in Abuja. ${service.description.substring(0, 150)}...`} />
            </Helmet>
            <header className="bg-white border-b sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between font-inter">
                    <Link to="/" className="flex items-center gap-2 text-neutral-600 hover:text-brand-600 font-medium text-sm">
                        <ChevronLeft className="w-4 h-4" /> Back to Search
                    </Link>
                    <div className="text-xl font-bold text-brand-600">Forafix</div>
                    <div className="w-24" /> {/* Spacer */}
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h1 className="text-4xl font-black text-neutral-900 mb-4 font-inter tracking-tight">{service.name}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-600">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-100 rounded-full">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold text-neutral-900">4.8</span>
                                    <span className="text-neutral-400">(128)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                                    <span className="font-bold">Verified Professional</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm">
                            <h2 className="text-xl font-black text-neutral-900 mb-6 font-inter tracking-tight">About this service</h2>
                            <p className="text-neutral-500 leading-relaxed mb-8 font-inter text-lg">
                                {service.description}
                            </p>

                            <h3 className="font-bold text-neutral-900 mb-4 font-inter uppercase text-xs tracking-widest">What's included in the base price:</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['Verified Background Check', 'Professional Equipment', 'Satisfaction Guarantee', 'Secure Escrow Payment'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-neutral-600 font-inter">
                                        <div className="w-6 h-6 bg-brand-50 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-brand-600" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Reviews Section */}
                        <div className="space-y-8">
                            <h2 className="text-xl font-bold text-neutral-900 font-inter flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-brand-600" /> Client Reviews
                            </h2>
                            
                            <RatingSummary 
                                averageRating={4.8} 
                                totalReviews={128} 
                                distribution={{ 5: 110, 4: 12, 3: 4, 2: 1, 1: 1 }} 
                            />

                            <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 px-8">
                                {[
                                    { id: 1, user_name: 'Funke A.', rating: 5, comment: 'Absolutely professional! The cleaner arrived on time and did an incredible job with the kitchen deep cleaning. Highly recommend Forafix.', date: '3 days ago', is_verified_purchase: true },
                                    { id: 2, user_name: 'Emeka U.', rating: 4, comment: 'Great service. The plumber was very knowledgeable. Only minor delay in getting the spare parts, but overall very happy.', date: '1 week ago', is_verified_purchase: true },
                                    { id: 3, user_name: 'Sarah O.', rating: 5, comment: 'The market run service is a lifesaver. Saved me hours of traffic in Abuja today. Fresh groceries delivered right to my door!', date: 'Oct 12, 2025', is_verified_purchase: true },
                                ].map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                                <button className="w-full py-4 text-brand-600 font-bold hover:bg-neutral-50 transition-colors font-inter text-sm">
                                    Show more reviews
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-xl shadow-neutral-200/50 sticky top-24">
                            <div className="mb-8">
                                <span className="text-xs font-black text-neutral-400 font-inter uppercase tracking-widest mb-1 block">Starting from</span>
                                <div className="text-4xl font-black text-brand-600 font-inter tracking-tight">
                                    {formatNaira(service.base_price)}
                                </div>
                            </div>

                            <button 
                                onClick={handleBookNow}
                                className="w-full bg-brand-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-95 mb-6"
                            >
                                Book Now
                            </button>

                            <p className="text-xs text-center text-neutral-400 font-inter leading-relaxed px-4">
                                You won't be charged yet. Professionals in Abuja will quote based on your specific requirements.
                            </p>

                            <div className="mt-8 pt-8 border-t border-neutral-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-sm">
                                    <div className="font-black text-neutral-900 font-inter">Secure Escrow</div>
                                    <div className="text-neutral-500 font-inter leading-tight">Funds are held safely until you're satisfied with the work.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <BookingModal 
                isOpen={isBookingOpen} 
                onClose={() => setIsBookingOpen(false)} 
                agent={service?.agents?.[0]} 
            />
        </div>
    );
};

export default ServiceDetailPage;
