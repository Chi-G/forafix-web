import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, Eye, FileText, ChevronRight, User, Server, Globe, Bell, Fingerprint } from 'lucide-react';

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 pt-12 pb-24 selection:bg-[#14a800]/10 selection:text-[#14a800]">
            <Helmet>
                <title>Privacy Policy | Forafix</title>
                <meta name="description" content="Read Forafix's privacy policy to understand how we collect, use, and protect your personal information." />
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#14a800]/10 text-[#14a800] mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black text-neutral-900 dark:text-neutral-50 mb-4 tracking-tight">Privacy Policy</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium italic uppercase tracking-widest text-xs">Last Updated: February 24, 2026</p>
                </div>

                {/* Privacy Pledge */}
                <div className="mb-12 p-8 rounded-[2.5rem] bg-[#14a800] text-white relative overflow-hidden shadow-2xl shadow-[#14a800]/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px]" />
                    <h2 className="text-2xl font-black mb-4 relative z-10">Our Privacy Pledge</h2>
                    <p className="text-white/90 font-medium leading-relaxed relative z-10 text-lg">
                        We don't sell your data. We don't hide our practices in legalese. We build our platform on trust, starting with how we handle your information.
                    </p>
                </div>

                {/* Content */}
                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 mb-8 flex items-center gap-4 italic font-serif">
                            <span className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm not-italic font-black text-[#14a800] ring-1 ring-neutral-200 dark:ring-neutral-700">01</span>
                            Data Collection
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                            <div className="space-y-6">
                                <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center mb-6 shadow-sm">
                                        <User className="w-6 h-6 text-[#14a800]" />
                                    </div>
                                    <h3 className="font-black text-neutral-900 dark:text-neutral-100 text-xl mb-3">Direct Info</h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-[1.8] font-medium">
                                        We collect info you provide when creating an account: name, email, phone, and professional credentials (for Pros).
                                    </p>
                                </div>
                                <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center mb-6 shadow-sm">
                                        <Lock className="w-6 h-6 text-[#14a800]" />
                                    </div>
                                    <h3 className="font-black text-neutral-900 dark:text-neutral-100 text-xl mb-3">Billing Info</h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-[1.8] font-medium">
                                        Payments are handled via secure third-party processors (PCI-DSS compliant). We do not store full bank or card details.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center mb-6 shadow-sm">
                                        <Globe className="w-6 h-6 text-[#14a800]" />
                                    </div>
                                    <h3 className="font-black text-neutral-900 dark:text-neutral-100 text-xl mb-3">Automated Data</h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-[1.8] font-medium">
                                        Upon visiting, we automatically log your IP address, browser type, and interaction patterns via cookies.
                                    </p>
                                </div>
                                <div className="p-8 rounded-3xl border-2 border-[#14a800]/20 bg-[#14a800]/5">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center mb-6 shadow-sm">
                                        <Fingerprint className="w-6 h-6 text-[#14a800]" />
                                    </div>
                                    <h3 className="font-black text-neutral-900 dark:text-neutral-100 text-xl mb-3">ID Verification</h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-[1.8] font-medium">
                                        For security, Pros submit government-issued IDs for verification. These are encrypted and shared only with our vetting partner.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 mb-8 flex items-center gap-4 italic font-serif">
                            <span className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm not-italic font-black text-[#14a800] ring-1 ring-neutral-200 dark:ring-neutral-700">02</span>
                            Purpose of Processing
                        </h2>
                        <div className="p-10 rounded-[3rem] bg-neutral-900 border border-neutral-800">
                            <ul className="space-y-8">
                                {[
                                    { icon: Server, title: 'Service Provision', text: 'To facilitate bookings, messaging, and account management.' },
                                    { icon: Bell, title: 'Communication', text: 'To send transactional updates, security alerts, and relevant newsletters.' },
                                    { icon: Shield, title: 'T & S', text: 'To maintain Trust & Safety, prevent fraud, and enforce our Terms.' }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-6 group">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#14a800]/20 group-hover:border-[#14a800]/30 transition-all">
                                            <item.icon className="w-6 h-6 text-[#14a800]" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-black text-lg mb-1">{item.title}</h4>
                                            <p className="text-neutral-400 font-medium leading-relaxed">{item.text}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 mb-8 flex items-center gap-4 italic font-serif">
                            <span className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm not-italic font-black text-[#14a800] ring-1 ring-neutral-200 dark:ring-neutral-700">03</span>
                            Data Retention & Your Rights
                        </h2>
                        <div className="space-y-8 text-neutral-600 dark:text-neutral-400 font-medium leading-[2]">
                            <p>
                                <span className="text-neutral-900 dark:text-neutral-50 font-black mr-2">Retention:</span> 
                                We store your data for as long as your account is active or needed to provide you services. Financial records are kept for 7 years to comply with tax laws.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {['Access', 'Rectification', 'Erasure', 'Portability', 'Withdraw Consent'].map((right) => (
                                    <div key={right} className="px-6 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-black text-sm hover:scale-[1.05] transition-transform cursor-default">
                                        Right to {right}
                                    </div>
                                ))}
                            </div>
                            <p className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 border-l-4 border-l-[#14a800]">
                                You can exercise these rights at any time by contacting our DPO at <span className="text-[#14a800] font-black cursor-pointer hover:underline">dpo@forafix.com</span>.
                            </p>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="bg-neutral-50 dark:bg-neutral-900 p-12 rounded-[4rem] text-center border border-neutral-100 dark:border-neutral-800">
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 mb-4">Contact Privacy</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium mb-10 max-w-xl mx-auto leading-relaxed">
                            Questions about how we handle your data? We're here to help. Reach out to our dedicated privacy office.
                        </p>
                        <div className="inline-block px-10 py-5 rounded-[2rem] bg-neutral-900 text-white font-black text-lg hover:bg-[#14a800] transition-colors cursor-pointer">
                            privacy@forafix.com
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
