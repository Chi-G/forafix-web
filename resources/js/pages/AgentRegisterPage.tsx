import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';
import { Loader2, AlertCircle, ChevronRight, Briefcase, MapPin, User as UserIcon } from 'lucide-react';

const AgentRegisterPage = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [step, setStep] = useState(1);
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                role: 'AGENT',
            });
            const { user, access_token } = response.data;
            setAuth(user, access_token);
            navigate('/agent/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
                <h2 className="text-4xl font-black text-brand-600 font-inter tracking-tight">Forafix</h2>
                <p className="mt-2 text-sm text-neutral-600 font-inter">Join as a Service Provider</p>
                
                {/* Progress Bar */}
                <div className="mt-6 flex items-center justify-center gap-2">
                    <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 1 ? 'bg-brand-600' : 'bg-neutral-200'}`} />
                    <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 2 ? 'bg-brand-600' : 'bg-neutral-200'}`} />
                </div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-4 shadow-xl shadow-neutral-200/50 sm:rounded-2xl sm:px-10 border border-neutral-100">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium font-inter">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 font-inter mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-neutral-400" />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full border border-neutral-200 rounded-xl shadow-sm py-3 pl-12 pr-4 focus:ring-brand-500 focus:border-brand-500 font-inter outline-none"
                                            placeholder="Chijioke Newman"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 font-inter mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full border border-neutral-200 rounded-xl shadow-sm py-3 px-4 focus:ring-brand-500 focus:border-brand-500 font-inter outline-none"
                                        placeholder="pro@forafix.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 font-inter mb-1.5">Primary Skill</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-neutral-400" />
                                        <select className="block w-full border border-neutral-200 rounded-xl shadow-sm py-3 pl-12 pr-4 focus:ring-brand-500 focus:border-brand-500 font-inter outline-none appearance-none">
                                            <option>Home Cleaning</option>
                                            <option>AC Maintenance</option>
                                            <option>Plumbing</option>
                                            <option>Generator Repair</option>
                                            <option>Gardening</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-600/20 text-sm font-black text-white bg-brand-600 hover:bg-brand-700 transition-all active:scale-95"
                                >
                                    Next: Security & Access <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 font-inter mb-1.5">Create Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full border border-neutral-200 rounded-xl shadow-sm py-3 px-4 focus:ring-brand-500 focus:border-brand-500 font-inter outline-none"
                                        placeholder="Min. 8 characters"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 font-inter mb-1.5">Confirm Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        className="block w-full border border-neutral-200 rounded-xl shadow-sm py-3 px-4 focus:ring-brand-500 focus:border-brand-500 font-inter outline-none"
                                        placeholder="Repeat password"
                                    />
                                </div>
                                
                                <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
                                    <p className="text-xs text-brand-700 font-medium font-inter leading-relaxed">
                                        Note: Your profile will be marked as "Unvetted" initially. You will need to upload identity documents in the dashboard to become a Verified Pro.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-4 px-4 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 font-inter transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-[2] flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-600/20 text-sm font-black text-white bg-brand-600 hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-70"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            'Sign Up'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgentRegisterPage;
