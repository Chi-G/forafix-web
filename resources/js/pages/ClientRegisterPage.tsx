import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';
import { Loader2, AlertCircle } from 'lucide-react';

const ClientRegisterPage = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
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
                role: 'CLIENT',
            });
            const { user, access_token } = response.data;
            setAuth(user, access_token);
            navigate('/cl/find-service');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <h2 className="text-4xl font-black text-brand-600 font-inter tracking-tight">Forafix</h2>
                <p className="mt-2 text-sm text-neutral-600 font-inter">Join as a Client</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-4 shadow-xl shadow-neutral-200/50 sm:rounded-2xl sm:px-10 border border-neutral-100">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium font-inter">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 font-inter mb-1.5">Full Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full border border-neutral-200 rounded-xl shadow-sm py-3 px-4 focus:ring-brand-500 focus:border-brand-500 font-inter outline-none transition-all"
                                placeholder="e.g. Chijioke Newman"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-neutral-700 font-inter mb-1.5">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full border border-neutral-200 rounded-xl shadow-sm py-3 px-4 focus:ring-brand-500 focus:border-brand-500 font-inter outline-none transition-all"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-neutral-700 font-inter mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full border border-neutral-200 rounded-xl shadow-sm py-3 px-4 focus:ring-brand-500 focus:border-brand-500 font-inter outline-none transition-all"
                                placeholder="Minimum 8 characters"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-neutral-700 font-inter mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="block w-full border border-neutral-200 rounded-xl shadow-sm py-3 px-4 focus:ring-brand-500 focus:border-brand-500 font-inter outline-none transition-all"
                                placeholder="Repeat your password"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="terms"
                                type="checkbox"
                                required
                                className="h-5 w-5 text-brand-600 focus:ring-brand-500 border-neutral-300 rounded-md transition-all cursor-pointer"
                            />
                            <label htmlFor="terms" className="ml-3 block text-sm text-neutral-600 font-inter">
                                I agree to the <span className="text-brand-600 font-bold hover:underline cursor-pointer">Terms of Service</span> and <span className="text-brand-600 font-bold hover:underline cursor-pointer">Privacy Policy</span>.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-600/20 text-sm font-black text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 font-inter transition-all active:scale-95 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Join as a Client'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-neutral-500 font-inter">
                            Already have an account?{' '}
                            <button onClick={() => navigate('/login')} className="font-bold text-brand-600 hover:text-brand-700 transition-colors">
                                Log in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientRegisterPage;
