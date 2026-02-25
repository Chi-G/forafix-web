import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (token) {
                try {
                    // Set token temporarily to fetch user info
                    localStorage.setItem('auth_token', token);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    const response = await axios.get('/api/me');
                    const user = response.data;
                    
                    setAuth(user, token);
                    
                    // Always redirect to profile page for both CLIENT and AGENT after Google login
                    // as it acts as a "Welcome/Overview" and confirms account details.
                    if (user.uuid) {
                        navigate(`/cl/${user.uuid}`);
                    } else {
                        // Fallback in case UUID is somehow missing
                        navigate(user.role === 'AGENT' ? '/agent/dashboard' : '/cl/find-service');
                    }
                } catch (error) {
                    console.error('Auth callback failed:', error);
                    navigate('/login?error=oauth_callback_failed');
                }
            } else {
                navigate('/login');
            }
        };

        handleCallback();
    }, [location, navigate, setAuth]);

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-[#14a800] animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-widest">
                    Authenticating...
                </h2>
                <p className="text-neutral-500 mt-2 font-medium">Please wait while we complete your secure login.</p>
            </div>
        </div>
    );
};

export default AuthCallbackPage;
