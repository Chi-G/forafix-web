import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';
import { ShieldCheck, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

const TwoFactorChallengePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const email = location.state?.email;

    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('/two-factor/challenge', {
                email,
                code,
            });
            const { user, access_token } = response.data;
            setAuth(user, access_token);
            
            if (user.role === 'AGENT') {
                navigate('/agent/dashboard');
            } else {
                navigate('/cl/find-service');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid verification code.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="max-w-md w-full mx-auto space-y-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 mb-6">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 font-inter tracking-tight">Two-factor Authentication</h2>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 font-inter">
                        Please enter the 6-digit code from your authenticator app.
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-800 py-10 px-6 shadow-xl shadow-neutral-200/50 dark:shadow-black/40 rounded-3xl border border-neutral-100 dark:border-neutral-700">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium font-inter">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 font-inter mb-1.5">Authentication Code</label>
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                className="block w-full border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm py-4 px-4 text-center text-2xl font-black tracking-[0.5em] focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-neutral-800 font-inter transition-all outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || code.length < 6}
                            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-600/20 text-sm font-black text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 font-inter transition-all active:scale-95 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Verify Code'
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

export default TwoFactorChallengePage;
