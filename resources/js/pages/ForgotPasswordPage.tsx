import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Mail, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const response = await axios.post('/forgot-password', { email });
            setStatus('success');
            setMessage(response.data.message || 'If an account exists with that email, we have sent a password reset link.');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="max-w-md w-full mx-auto space-y-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 mb-6">
                        <KeyRound className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 font-inter tracking-tight">Forgot password?</h2>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 font-inter">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-800 py-10 px-6 shadow-xl shadow-neutral-200/50 dark:shadow-black/40 rounded-3xl border border-neutral-100 dark:border-neutral-700">
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm animate-in slide-in-from-top-2 ${
                            status === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                            {status === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                            <p className="font-medium font-inter">{message}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 font-inter mb-1.5">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="block w-full border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm py-3.5 pl-11 pr-4 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-neutral-800 font-inter transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-600/20 text-sm font-black text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 font-inter transition-all active:scale-95 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Reset password'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-bold text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to log in
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
