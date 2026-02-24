import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import CookieConsent from '../components/CookieConsent';
import CookieSettings from '../components/CookieSettings';
import { usePreferenceStore } from '../store/usePreferenceStore';

const MainLayout = () => {
    const { isCookieSettingsOpen, closeCookieSettings } = usePreferenceStore();

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-16 sm:pt-20">
                <Outlet />
            </main>
            <Footer />
            <CookieConsent />
            <CookieSettings isOpen={isCookieSettingsOpen} onClose={closeCookieSettings} />
        </div>
    );
};

export default MainLayout;
