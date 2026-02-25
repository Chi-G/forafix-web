import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

const VerifyEmailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [message, setMessage] = useState('');

    const handleResend = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            await axios.post('/email/resend', { email });
            setMessage('Verification link resent! Please check your inbox.');
            setStatus('success');
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Failed to resend link. Please try again.');
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="max-w-md w-full mx-auto space-y-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 mb-6">
                        <Mail className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 font-inter tracking-tight">Verify your email</h2>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 font-inter">
                        We've sent a verification link to <span className="font-bold text-neutral-900 dark:text-neutral-200">{email || 'your email'}</span>
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

                    <div className="space-y-6">
                        <div className="text-center space-y-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-inter leading-relaxed">
                                Please click the link in the email to verify your account. If you don't see it, check your spam folder.
                            </p>
                            
                            <button
                                onClick={handleResend}
                                disabled={isLoading}
                                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                Resend verification email
                            </button>
                        </div>

                        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-sm font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-all active:scale-95"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
