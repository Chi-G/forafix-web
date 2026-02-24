import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Scale, FileText, CheckCircle2, AlertTriangle, ShieldAlert, Gavel, UserCheck, CreditCard, Ban, HelpCircle } from 'lucide-react';

const TermsOfServicePage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 pt-12 pb-24 selection:bg-[#14a800]/10 selection:text-[#14a800]">
            <Helmet>
                <title>Terms of Service | Forafix</title>
                <meta name="description" content="Read Forafix's terms of service to understand the rules and guidelines for using our platform." />
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#14a800]/10 text-[#14a800] mb-6">
                        <Scale className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black text-neutral-900 dark:text-neutral-50 mb-4 tracking-tight">Terms of Service</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium italic uppercase tracking-widest text-xs">Last Updated: February 24, 2026</p>
                </div>

                {/* Warning Alert */}
                <div className="mb-12 p-8 rounded-[2.5rem] bg-neutral-900 text-white border border-neutral-800 flex gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#14a800]/10 rounded-bl-full" />
                    <AlertTriangle className="w-8 h-8 text-[#14a800] shrink-0 mt-1 relative z-10" />
                    <div className="relative z-10">
                        <p className="font-black text-xl mb-2">Fundamental Agreement</p>
                        <p className="text-neutral-400 font-medium leading-relaxed">
                            By creating an account or using the Forafix marketplace, you enter into a legally binding contract. Please read these terms carefully. If you do not agree, you must cease all use of our services immediately.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 mb-6 flex items-center gap-4 italic">
                            <span className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm not-italic font-black text-[#14a800] ring-1 ring-neutral-200 dark:ring-neutral-700">01</span>
                            The Forafix Marketplace
                        </h2>
                        <div className="space-y-4 text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                            <p>
                                Forafix Global Inc. provides a digital marketplace platform connecting Clients with autonomous service providers ("Pros"). 
                                <span className="text-neutral-900 dark:text-neutral-100 font-bold ml-1">Exclusion of Employment:</span> 
                                Pros are NOT employees, agents, or representatives of Forafix. They are independent contractors who set their own schedules and use their own tools.
                            </p>
                            <p>
                                Forafix does not supervise, direct, control, or monitor a Pro's work and is not responsible for the performance or outcome of services.
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 mb-6 flex items-center gap-4 italic">
                            <span className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm not-italic font-black text-[#14a800] ring-1 ring-neutral-200 dark:ring-neutral-700">02</span>
                            User Accounts & Verification
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                            <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-[#14a800]/30 transition-colors">
                                <UserCheck className="w-10 h-10 text-[#14a800] mb-4" />
                                <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100 mb-2">Eligibility</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                                    You must be at least 18 years old and capable of forming a binding contract to use Forafix.
                                </p>
                            </div>
                            <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-[#14a800]/30 transition-colors">
                                <ShieldAlert className="w-10 h-10 text-[#14a800] mb-4" />
                                <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100 mb-2">Accuracy</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                                    You agree to provide accurate, current, and complete information during registration and keep your account details updated.
                                </p>
                            </div>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                            Forafix reserves the right to suspend accounts that contain misleading information. While we may vet Pros, we do not guarantee the identity or safety of any user.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 mb-6 flex items-center gap-4 italic">
                            <span className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm not-italic font-black text-[#14a800] ring-1 ring-neutral-200 dark:ring-neutral-700">03</span>
                            Payments, Fees & Escrow
                        </h2>
                        <div className="p-8 rounded-[2.5rem] bg-neutral-50 dark:bg-neutral-900/50 border-2 border-dashed border-neutral-200 dark:border-neutral-800 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <CreditCard className="w-6 h-6 text-[#14a800]" />
                                <h3 className="text-xl font-black">Transaction Flow</h3>
                            </div>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#14a800] text-white flex items-center justify-center font-black shrink-0 text-sm">1</div>
                                    <p className="font-medium text-neutral-600 dark:text-neutral-400">
                                        Clients pay the full project amount into the Forafix Secure Escrow upon hiring a Pro.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#14a800] text-white flex items-center justify-center font-black shrink-0 text-sm">2</div>
                                    <p className="font-medium text-neutral-600 dark:text-neutral-400">
                                        Forafix holds the funds securely until the service is marked as complete by both parties.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#14a800] text-white flex items-center justify-center font-black shrink-0 text-sm">3</div>
                                    <p className="font-medium text-neutral-600 dark:text-neutral-400">
                                        Service fees (10-15%) are deducted, and the remaining balance is transferred to the Pro's wallet.
                                    </p>
                                </li>
                            </ul>
                        </div>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm font-bold bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20">
                            OFF-PLATFORM PAYMENTS: Attempting to circumvent Forafix fees by paying Pros directly is a material breach of these Terms and will result in permanent account deactivation.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 mb-6 flex items-center gap-4 italic">
                            <span className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm not-italic font-black text-[#14a800] ring-1 ring-neutral-200 dark:ring-neutral-700">04</span>
                            Cancellations & Refunds
                        </h2>
                        <div className="space-y-6 text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                            <div className="flex items-start gap-4">
                                <div className="w-2 h-2 rounded-full bg-[#14a800] mt-2.5 shrink-0" />
                                <p><span className="text-neutral-900 dark:text-neutral-100 font-black">Client Cancellation:</span> If a Client cancels more than 24 hours before the scheduled time, a full refund (minus processing fees) is issued. Within 24 hours, a 20% cancellation fee may apply.</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-2 h-2 rounded-full bg-[#14a800] mt-2.5 shrink-0" />
                                <p><span className="text-neutral-900 dark:text-neutral-100 font-black">Pro Cancellation:</span> If a Pro cancels, the Client receives a 100% refund, or Forafix will assist in finding a replacement Pro immediately.</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-2 h-2 rounded-full bg-[#14a800] mt-2.5 shrink-0" />
                                <p><span className="text-neutral-900 dark:text-neutral-100 font-black">Disputes:</span> In cases of unsatisfactory service, Forafix Support will mediate. Refunds are at the sole discretion of our Dispute Resolution team.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="p-12 rounded-[3.5rem] bg-neutral-950 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#14a800]/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <h2 className="text-3xl font-black mb-8 italic flex items-center gap-4">
                            <Gavel className="w-8 h-8 text-[#14a800]" />
                            Limitation of Liability
                        </h2>
                        <p className="text-neutral-400 font-medium leading-[2] text-lg mb-8">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, FORAFIX GLOBAL INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING FROM DISPUTES BETWEEN USERS OR DAMAGE TO PROPERTY DURING THE PROVISION OF SERVICES.
                        </p>
                        <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                            <HelpCircle className="w-10 h-10 text-[#14a800] shrink-0" />
                            <p className="text-sm font-bold text-neutral-400">
                                Need clarification? Our legal team is available at <span className="text-[#14a800] font-black cursor-pointer hover:underline">legal@forafix.com</span>
                            </p>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 mb-6 flex items-center gap-4 italic">
                            <span className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm not-italic font-black text-[#14a800] ring-1 ring-neutral-200 dark:ring-neutral-700">05</span>
                            Intellectual Property
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                            All content, features, and functionality (including logo, text, software, and design) are owned by Forafix Global Inc. and are protected by international copyright, trademark, and other intellectual property laws.
                        </p>
                    </section>
                </div>
                
            </div>
        </div>
    );
};

export default TermsOfServicePage;
