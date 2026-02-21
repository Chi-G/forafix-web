import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useHeaderStore } from '../store/useHeaderStore';
import ClientDashboard from './ClientDashboard';
import AgentDashboard from './AgentDashboard';
import { 
    LogOut, 
    User as UserIcon, 
    Bell, 
    Search, 
    MessageCircle, 
    HelpCircle, 
    ChevronDown,
    LayoutDashboard,
    Briefcase,
    Loader2
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../store/useNotifications';
import { cn } from '../lib/utils';

const Dashboard = () => {
    const { user, clearAuth, fetchUser, isAuthenticated } = useAuthStore();
    const location = useLocation();
    useNotifications();

    React.useEffect(() => {
        if (!user && isAuthenticated) {
            fetchUser();
        }
    }, [user, isAuthenticated, fetchUser]);

    const isClient = user?.role !== 'AGENT';
    const { setExtraActions } = useHeaderStore();

    React.useEffect(() => {
        // Inject search bar into header
        setExtraActions(
            <div className="hidden md:flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 py-2 border border-transparent focus-within:bg-white dark:focus-within:bg-neutral-900 focus-within:border-neutral-200 dark:focus-within:border-neutral-700 transition-all">
                <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 mr-2" />
                <input type="text" placeholder="Search" 
                className="bg-transparent border-none focus:outline-none text-sm w-32 focus:w-48 transition-all text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400"                 
                />                
            </div>
        );
        return () => setExtraActions(null);
    }, [setExtraActions]);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-inter transition-colors duration-300">
            {/* Content Area */}
            <main className="py-8">
                <div className="max-w-[1400px] mx-auto">
                    {!user ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-[#14a800]" />
                            <p className="text-neutral-500 font-bold italic">Gathering your workspace...</p>
                        </div>
                    ) : user.role === 'AGENT' ? (
                        <AgentDashboard />
                    ) : (
                        <ClientDashboard />
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
