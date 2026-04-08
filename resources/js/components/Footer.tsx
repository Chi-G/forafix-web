import { Link } from 'react-router-dom';
import { baseAsset } from "@/lib/assetHelper";
import { Facebook, Twitter, Instagram } from 'lucide-react';
import React from 'react';
import { usePreferenceStore } from '../store/usePreferenceStore';

const Footer = () => {
    const { openCookieSettings } = usePreferenceStore();

    return (
        <footer className="bg-neutral-900 text-neutral-400 py-20 border-t border-white/5 uppercase select-none relative z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                    <div className="col-span-2 lg:col-span-1">
                        <div className="bg-neutral-800 dark:bg-transparent p-2 sm:p-2.5 rounded-2xl shadow-sm border border-neutral-700 dark:border-transparent transition-colors mb-6 w-fit">
                            <img src={baseAsset("logo.png")} alt="Forafix Logo" className="h-10 sm:h-12 w-auto object-contain block dark:hidden" />
                            <img src={baseAsset("logo-no-char.png")} alt="Forafix Logo" className="h-10 sm:h-12 w-auto object-contain hidden dark:block" />
                        </div>
                        <p className="text-sm leading-relaxed mb-6 font-medium">Abuja's #1 marketplace for local household services and skilled agents.</p>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#14a800] transition-colors cursor-pointer flex items-center justify-center">
                                <Twitter className="w-4 h-4 text-white" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#14a800] transition-colors cursor-pointer flex items-center justify-center">
                                <Facebook className="w-4 h-4 text-white" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#14a800] transition-colors cursor-pointer flex items-center justify-center">
                                <Instagram className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">For Clients</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link to="/cl/find-service" className="hover:text-white transition-colors">Find a Service</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">How to Hire</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Secure Payments</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Forafix Plus</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">For Agents</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link to="/register/agent" className="hover:text-white transition-colors">Become an Agent</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">How to Earn</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Trust & Safety</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Abuja Markets</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Resource</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Community</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Safety Tips</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Success Stories</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Company</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link to="#" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Partnerships</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold uppercase tracking-widest">
                    <div className="flex flex-wrap justify-center gap-8">
                        <span>&copy; 2026 Forafix.</span>
                        <Link to="/terms" className="hover:text-white">Terms of Service</Link>
                        <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
                        <button onClick={openCookieSettings} className="hover:text-white uppercase font-bold">Cookie Settings</button>
                    </div>
                    <p className="text-neutral-500 text-sm">
                        © {new Date().getFullYear()} Forafix. A product of <a href="https://forahia.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-500 font-medium transition-colors">Forahia</a>.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
