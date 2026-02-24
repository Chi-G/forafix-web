import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, MapPinOff } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative">
            <Helmet>
                <title>404 Page Not Found | Forafix</title>
                <meta name="description" content="The page you are looking for does not exist on Forafix." />
            </Helmet>

            {/* Background Accents (Abuja-inspired organic shapes) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#14a800]/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-brand-500/20 rounded-full blur-[120px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10"
            >
                {/* Icon Container */}
                <div className="w-24 h-24 bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-center mx-auto mb-10 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-brand-500/10 dark:shadow-brand-500/5">
                    <MapPinOff className="w-12 h-12 text-[#14a800]" />
                </div>

                {/* Text Content */}
                <h1 className="text-[120px] sm:text-[180px] font-black leading-none text-neutral-900 dark:text-white tracking-tighter mb-4 opacity-5 pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 select-none">
                    404
                </h1>
                
                <h2 className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-white mb-6 tracking-tight">
                    Lost in Transit?
                </h2>
                
                <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-12 font-medium leading-relaxed">
                    The page you're looking for seems to have moved or taken a detour. Even our best Abuja-vetted agents couldn't find it!
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                        to="/" 
                        className="w-full sm:w-auto bg-[#14a800] text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-[#118b00] transition-all shadow-xl shadow-[#14a800]/20 active:scale-95 group"
                    >
                        <Home className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                        Back to Home
                    </Link>
                    
                    <button 
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Previous Page
                    </button>
                </div>
            </motion.div>

            {/* Footer Text */}
            <div className="absolute bottom-12 left-0 w-full text-center">
                <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em]">
                    Forafix Marketplace &copy; 2026
                </p>
            </div>
        </div>
    );
};

export default NotFoundPage;
