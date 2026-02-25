import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { usePreferenceStore } from '../store/usePreferenceStore';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();
    const { openCookieSettings } = usePreferenceStore();

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        const isHomePage = location.pathname === '/';

        // Show on any page if no choice made yet, OR always on home page
        if (!consent || isHomePage) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [location.pathname]);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-8 z-[120] md:max-w-md w-auto md:w-full"
                >
                    <div className="bg-neutral-900/90 dark:bg-neutral-900/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-black/40 ring-1 ring-white/5">
                        <div className="flex items-start gap-4 mb-5 sm:mb-6">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#14a800] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#14a800]/20">
                                <Cookie className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-lg sm:text-xl tracking-tight mb-0.5 sm:mb-1">Cookie Consent</h3>
                                <div className="flex items-center gap-1.5 text-[#14a800] text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                                    <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    <span>Privacy First</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-neutral-400 text-xs sm:text-sm font-medium leading-relaxed mb-6 sm:mb-8">
                            We use cookies to enhance your experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                        </p>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <button
                                onClick={handleAccept}
                                className="bg-[#14a800] text-white py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm hover:scale-[1.05] hover:shadow-2xl hover:shadow-[#14a800]/40 active:scale-[0.98] transition-all shadow-xl shadow-[#14a800]/20 ring-1 ring-[#14a800]/50"
                            >
                                Accept All
                            </button>
                            <button
                                onClick={handleDecline}
                                className="bg-white/5 text-white/40 py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm hover:bg-white/10 hover:text-white/60 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/10"
                            >
                                Decline
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                            <Link to="/privacy" className="text-[10px] text-neutral-500 hover:text-white font-bold uppercase tracking-widest transition-colors flex items-center gap-2 group">
                                Privacy Policy
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button 
                                onClick={openCookieSettings}
                                className="text-[10px] text-[#14a800] hover:opacity-80 font-bold uppercase tracking-widest transition-colors"
                            >
                                Manage Preferences
                            </button>
                        </div>

                        <button 
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-white/40" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
