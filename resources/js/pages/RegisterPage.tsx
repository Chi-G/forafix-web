import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const RegisterPage = () => {
    const [role, setRole] = useState<'CLIENT' | 'AGENT' | null>(null);
    const navigate = useNavigate();

    const handleContinue = () => {
        if (role === 'CLIENT') {
            navigate('/register/client');
        } else if (role === 'AGENT') {
            navigate('/register/agent');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-neutral-900 font-inter">
                        Join as a client or service provider
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client Option */}
                    <div 
                        onClick={() => setRole('CLIENT')}
                        className={cn(
                            "relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 bg-white dark:bg-neutral-800 hover:border-brand-500",
                            role === 'CLIENT' ? "border-brand-600 ring-1 ring-brand-600" : "border-neutral-200"
                        )}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <User className={cn("w-8 h-8", role === 'CLIENT' ? "text-brand-600" : "text-neutral-400")} />
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                role === 'CLIENT' ? "border-brand-600 bg-brand-600" : "border-neutral-300"
                            )}>
                                {role === 'CLIENT' && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 font-inter">I'm a client, booking for a service</h3>
                    </div>

                    {/* Agent Option */}
                    <div 
                        onClick={() => setRole('AGENT')}
                        className={cn(
                            "relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 bg-white dark:bg-neutral-800 hover:border-brand-500",
                            role === 'AGENT' ? "border-brand-600 ring-1 ring-brand-600" : "border-neutral-200"
                        )}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <Briefcase className={cn("w-8 h-8", role === 'AGENT' ? "text-brand-600" : "text-neutral-400")} />
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                role === 'AGENT' ? "border-brand-600 bg-brand-600" : "border-neutral-300"
                            )}>
                                {role === 'AGENT' && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 font-inter">I'm a provider, looking for work</h3>
                    </div>
                </div>

                <div className="flex flex-col items-center space-y-4 pt-4">
                    <button
                        onClick={handleContinue}
                        disabled={!role}
                        className={cn(
                            "w-full sm:w-64 py-3 px-6 rounded-full font-semibold transition-all flex items-center justify-center gap-2",
                            role 
                                ? "bg-brand-600 text-white hover:bg-brand-700 shadow-md" 
                                : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                        )}
                    >
                        {role === 'AGENT' ? 'Apply as a Provider' : 'Join as a Client'}
                        {role && <ChevronRight className="w-4 h-4" />}
                    </button>
                    
                    <p className="text-neutral-600 font-inter text-sm">
                        Already have an account? <button onClick={() => navigate('/login')} className="text-brand-600 hover:underline">Log In</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
