import './bootstrap';
import '../css/app.css';

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientRegisterPage from './pages/ClientRegisterPage';
import AgentRegisterPage from './pages/AgentRegisterPage';
import Dashboard from './pages/Dashboard';
import AuthCallbackPage from './pages/AuthCallbackPage';
import NotFoundPage from './pages/NotFoundPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import AgentDetailPage from './pages/AgentDetailPage';
import ClientBookingsPage from './pages/ClientBookingsPage';
import MessagesPage from './pages/MessagesPage';
import ClientProfileViewPage from './pages/ClientProfileViewPage';
import ClientSettingsPage from './pages/ClientSettingsPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import MainLayout from './layouts/MainLayout';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore, initThemeListener } from './store/useThemeStore';

const queryClient = new QueryClient();

const App = () => {
    const { fetchUser, isAuthenticated } = useAuthStore();
    const { setTheme, theme } = useThemeStore();

    useEffect(() => {
        // Re-apply stored theme on every load
        setTheme(theme);
        // Listen for OS dark/light mode changes
        const cleanup = initThemeListener();
        return cleanup;
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUser();
        }
    }, []);
    return (
        <React.StrictMode>
            <HelmetProvider>
                <QueryClientProvider client={queryClient}>
                    <Toaster />
                    <BrowserRouter>
                        <Routes>
                            <Route element={<MainLayout />}>
                                {/* Public-only Routes (Redirect to Dashboard if logged in) */}
                                <Route element={<PublicRoute />}>
                                    <Route path="/" element={<LandingPage />} />
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/register" element={<RegisterPage />} />
                                    <Route path="/register/client" element={<ClientRegisterPage />} />
                                    <Route path="/register/agent" element={<AgentRegisterPage />} />
                                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                                </Route>

                                {/* Public but accessible while logged in */}
                                <Route path="/services/:slug" element={<ServiceDetailPage />} />
                                <Route path="/terms" element={<TermsOfServicePage />} />
                                <Route path="/privacy" element={<PrivacyPolicyPage />} />

                                {/* Protected Routes */}
                                <Route element={<ProtectedRoute />}>
                                    <Route path="/cl/find-service" element={<Dashboard />} />
                                    <Route path="/service/:uuid" element={<AgentDetailPage />} />
                                    <Route path="/agent/dashboard" element={<Dashboard />} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                    <Route path="/cl/bookings" element={<ClientBookingsPage />} />
                                    <Route path="/cl/messages/rooms/" element={<MessagesPage />} />
                                    <Route path="/cl/messages/rooms/:agentUuid" element={<MessagesPage />} />
                                    <Route path="/cl/settings" element={<ClientSettingsPage />} />
                                    <Route path="/cl/:uuid" element={<ClientProfileViewPage />} />
                                    <Route path="/cl/notifications" element={<NotificationsPage />} />
                                    <Route path="/payment/callback" element={<PaymentSuccessPage />} />
                                </Route>
                            </Route>

                            {/* Fallback */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </BrowserRouter>
                </QueryClientProvider>
            </HelmetProvider>
        </React.StrictMode>
    );
};

const container = document.getElementById('app');
if (container) {
    console.log("React App: Mounting started...");
    const root = createRoot(container);
    root.render(<App />);
    console.log("React App: Mount call finished.");
} else {
    console.error("React App: Could not find #app container!");
}
