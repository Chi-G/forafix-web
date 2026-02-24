import React, { useState, useEffect } from 'react';
import { X, Cookie, ShieldCheck, Settings, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CookieSettings = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [preferences, setPreferences] = useState({
        essential: true, // Always true
        analytics: true,
        marketing: false,
        personalization: true
    });

    const toggle = (key: keyof typeof preferences) => {
        if (key === 'essential') return;
        setPreferences(p => ({ ...p, [key]: !p[key] }));
    };

    const handleSave = () => {
        localStorage.setItem('cookie_preferences', JSON.stringify(preferences));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md" 
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-[3rem] shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden"
                >
                    <div className="p-8 sm:p-12">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                                    <Cookie className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">Cookie Settings</h2>
                                    <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-0.5">Manage your preferences</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm">
                                <X className="w-6 h-6 text-neutral-400" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-10">
                            {[
                                { id: 'essential', title: 'Essential Cookies', desc: 'Required for basic site functionality and security.', icon: ShieldCheck, locked: true },
                                { id: 'analytics', title: 'Analytics Cookies', desc: 'Helps us understand how you use our site to improve it.', icon: Settings, locked: false },
                                { id: 'personalization', title: 'Personalization', desc: 'Saves your theme preference and local search settings.', icon: Cookie, locked: false },
                                { id: 'marketing', title: 'Marketing Cookies', desc: 'Used for specialized offers and relevant updates.', icon: ArrowRight, locked: false }
                            ].map((item) => (
                                <div key={item.id} className="group flex items-center justify-between p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20 hover:border-[#14a800]/30 transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-100 dark:border-neutral-800 group-hover:bg-[#14a800]/5 transition-colors">
                                            <item.icon className="w-5 h-5 text-neutral-400 group-hover:text-[#14a800] transition-colors" />
                                        </div>
                                        <div>
                                            <p className="font-black text-neutral-900 dark:text-neutral-100 text-sm">{item.title}</p>
                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-[280px]">{item.desc}</p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => toggle(item.id as keyof typeof preferences)}
                                        disabled={item.locked}
                                        className={cn(
                                            'w-12 h-6 rounded-full transition-all relative',
                                            preferences[item.id as keyof typeof preferences] ? 'bg-[#14a800]' : 'bg-neutral-200 dark:bg-neutral-800',
                                            item.locked && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        <div className={cn(
                                            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xl transition-transform',
                                            preferences[item.id as keyof typeof preferences] ? 'left-6' : 'left-0.5'
                                        )} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={handleSave}
                                className="flex-1 bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-950 py-4 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl dark:shadow-black/20"
                            >
                                Save Preferences
                            </button>
                            <button 
                                onClick={() => {
                                    setPreferences({ essential: true, analytics: true, marketing: true, personalization: true });
                                    handleSave();
                                }}
                                className="flex-1 bg-[#14a800] text-white py-4 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#14a800]/20"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CookieSettings;
