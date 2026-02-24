import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LogOut,
    User as UserIcon,
    Bell,
    MessageCircle,
    ChevronDown,
    Briefcase,
    Menu,
    X,
    Home,
    Search,
    Settings
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useHeaderStore } from '../store/useHeaderStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { cn } from '../lib/utils';

const Header = () => {
    const { user, clearAuth, isAuthenticated } = useAuthStore();
    const { extraActions } = useHeaderStore();
    const location = useLocation();

    const isClient = user?.role !== 'AGENT';

    // Mobile drawer
    const [mobileOpen, setMobileOpen] = useState(false);

    // Desktop profile dropdown (click-based so it works on all devices)
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Notification dropdown
    const { notifications, markAllAsRead, clearNotifications, unreadCount } = useNotificationStore();
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const count = unreadCount();

    // Close profile dropdown on outside click
    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
        setProfileOpen(false);
    }, [location.pathname]);

    const navLinks = isAuthenticated
        ? [
            {
                to: isClient ? '/cl/find-service' : '/agent/dashboard',
                label: isClient ? 'Find Services' : 'Dashboard',
                icon: Search,
                active: location.pathname.includes('find-service') || location.pathname.includes('dashboard'),
            },
            {
                to: isClient ? '/cl/bookings' : '/bookings',
                label: isClient ? 'My Bookings' : 'My Jobs',
                icon: Briefcase,
                active: location.pathname === '/cl/bookings' || location.pathname === '/bookings',
            },
            {
                to: '/cl/messages/rooms/',
                label: 'Messages',
                icon: MessageCircle,
                active: location.pathname.includes('messages'),
            },
        ]
        : [
            { to: '/cl/find-service', label: 'Find Services', icon: Search, active: false },
            { to: '/register/agent', label: 'Become an Agent', icon: Home, active: false },
        ];

    return (
        <>
            <header className="fixed top-0 w-full z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 h-16 sm:h-20">
                <div className="px-4 sm:px-8 lg:px-12 h-full flex items-center justify-between">

                    {/* Left: Logo + Desktop Nav */}
                    <div className="flex items-center gap-10">
                        <Link to="/" className="hover:opacity-80 transition-opacity flex items-center">
                            <div className="bg-neutral-800 dark:bg-transparent p-2 sm:p-2.5 rounded-2xl shadow-sm border border-neutral-700 dark:border-transparent transition-colors">
                                <img src="/logo.png" alt="Forafix Logo" className="h-10 sm:h-12 w-auto object-contain" />
                            </div>
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden lg:flex items-center gap-8">
                            {navLinks.map(link => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={cn(
                                        'text-sm font-bold transition-colors',
                                        link.active ? 'text-[#14a800]' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Page-specific slot (desktop) */}
                        <div className="hidden md:flex items-center gap-4">
                            {extraActions}
                        </div>

                        {isAuthenticated ? (
                            <>
                                {/* Bell */}
                                <div className="hidden sm:block relative" ref={notifRef}>
                                    <button 
                                        onClick={() => {
                                            setNotifOpen(o => !o);
                                            if (!notifOpen) markAllAsRead();
                                        }}
                                        className="flex text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors relative p-1"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {count > 0 && (
                                            <div className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-neutral-900 px-1 animation-pulse">
                                                {count > 9 ? '9+' : count}
                                            </div>
                                        )}
                                    </button>

                                    {notifOpen && (
                                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-700 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-1">
                                            <div className="px-5 py-4 border-b border-neutral-50 dark:border-neutral-700 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
                                                <h3 className="font-black text-sm text-neutral-900 dark:text-neutral-100 uppercase tracking-widest">Notifications</h3>
                                                <button onClick={clearNotifications} className="text-[10px] font-black text-neutral-400 hover:text-red-500 uppercase tracking-widest transition-colors">Clear all</button>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="px-5 py-10 text-center">
                                                        <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                            <Bell className="w-5 h-5 text-neutral-400" />
                                                        </div>
                                                        <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">All caught up!</p>
                                                        <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-black">No new notifications</p>
                                                    </div>
                                                ) : (
                                                    notifications.map((n) => (
                                                        <div key={n.id} className={cn(
                                                            "px-5 py-4 border-b border-neutral-50 dark:border-neutral-700 transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50",
                                                            !n.read && "bg-brand-50/30 dark:bg-[#14a800]/5"
                                                        )}>
                                                            <div className="flex gap-3">
                                                                <div className={cn(
                                                                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                                                    !n.read ? "bg-[#14a800]" : "bg-neutral-200 dark:bg-neutral-700"
                                                                )} />
                                                                <div>
                                                                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-snug">{n.title}</p>
                                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">{n.message}</p>
                                                                    <p className="text-[9px] font-black text-neutral-300 dark:text-neutral-500 uppercase tracking-widest mt-2">
                                                                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            {notifications.length > 0 && (
                                                <Link to="/cl/notifications" className="block py-3 text-center text-xs font-black text-[#14a800] uppercase tracking-widest border-t border-neutral-50 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                                    View All Activity
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Avatar + dropdown — desktop only, click-based */}
                                <div className="hidden lg:block relative" ref={profileRef}>
                                    <button
                                        onClick={() => setProfileOpen(o => !o)}
                                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                    >
                                        <div className="w-9 h-9 bg-brand-50 dark:bg-[#14a800]/20 rounded-full flex items-center justify-center font-black text-[#14a800] text-sm border-2 border-white dark:border-neutral-800 shadow-sm">
                                            {user?.name?.[0]}
                                        </div>
                                        <ChevronDown className={cn('w-4 h-4 text-neutral-400 dark:text-neutral-500 transition-transform', profileOpen && 'rotate-180')} />
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-700 py-3 z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                                            <div className="px-5 py-3 border-b border-neutral-50 dark:border-neutral-700 mb-2">
                                                <div className="font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">{user?.name}</div>
                                                <div className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-0.5">{user?.role}</div>
                                            </div>
                                            <Link to={`/cl/${user?.uuid}`} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                                <UserIcon className="w-4 h-4" /> My Profile
                                            </Link>
                                            <Link to={isClient ? '/cl/bookings' : '/bookings'} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                                <Briefcase className="w-4 h-4" /> {isClient ? 'My Bookings' : 'My Jobs'}
                                            </Link>
                                            <Link to="/cl/settings" className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                                <Settings className="w-4 h-4" /> Settings
                                            </Link>
                                            <button
                                                onClick={clearAuth}
                                                className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-neutral-50 dark:border-neutral-700 mt-2"
                                            >
                                                <LogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Hamburger — visible below lg */}
                                <button
                                    onClick={() => setMobileOpen(o => !o)}
                                    className="lg:hidden w-10 h-10 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                                    aria-label="Toggle menu"
                                >
                                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3 sm:gap-5">
                                <Link to="/login" className="text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Log in</Link>
                                <Link to="/register" className="bg-[#14a800] text-white px-5 sm:px-8 py-2.5 rounded-full text-sm font-bold hover:bg-[#118b00] transition-all shadow-md active:scale-95">Sign up</Link>
                                {/* Hamburger for logged-out mobile */}
                                <button
                                    onClick={() => setMobileOpen(o => !o)}
                                    className="lg:hidden w-10 h-10 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                                >
                                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Mobile Drawer ──────────────────────────────────────────── */}
            {/* Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <div className={cn(
                'fixed top-0 right-0 h-full w-[300px] max-w-[85vw] z-50 bg-white dark:bg-neutral-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden',
                mobileOpen ? 'translate-x-0' : 'translate-x-full'
            )}>
                {/* Drawer header */}
                <div className="flex items-center justify-between px-6 h-16 sm:h-20 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                    <div className="bg-neutral-800 dark:bg-transparent p-1.5 rounded-xl transition-colors">
                        <img src="/logo.png" alt="Forafix Logo" className="h-8 w-auto object-contain" />
                    </div>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    {/* Nav links */}
                    <div className="px-4 mb-4">
                        <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-2 mb-2">Navigation</p>
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-3.5 rounded-xl font-bold text-sm transition-all mb-1',
                                    link.active
                                        ? 'bg-[#14a800]/10 text-[#14a800]'
                                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                )}
                            >
                                <link.icon className="w-4 h-4 shrink-0" />
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            to="/cl/notifications"
                            className={cn(
                                'flex items-center justify-between px-3 py-3.5 rounded-xl font-bold text-sm transition-all mb-1',
                                location.pathname === '/cl/notifications'
                                    ? 'bg-[#14a800]/10 text-[#14a800]'
                                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Bell className="w-4 h-4 shrink-0" />
                                Notifications
                            </div>
                            {count > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black min-w-[18px] text-center">
                                    {count}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Profile section */}
                    {isAuthenticated && (
                        <>
                            <div className="mx-4 border-t border-neutral-100 dark:border-neutral-800 pt-4 mb-2">
                                <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-2 mb-2">Account</p>

                                {/* User identity */}
                                <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                                    <div className="w-10 h-10 bg-brand-50 dark:bg-[#14a800]/20 rounded-full flex items-center justify-center font-black text-[#14a800] text-sm border-2 border-white dark:border-neutral-700 shadow-sm shrink-0">
                                        {user?.name?.[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm truncate">{user?.name}</p>
                                        <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{user?.role}</p>
                                    </div>
                                </div>

                                <Link
                                    to={`/cl/${user?.uuid}`}
                                    className="flex items-center gap-3 px-3 py-3.5 rounded-xl font-bold text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all mb-1"
                                >
                                    <UserIcon className="w-4 h-4 shrink-0" /> My Profile
                                </Link>

                                <Link
                                    to="/cl/settings"
                                    className="flex items-center gap-3 px-3 py-3.5 rounded-xl font-bold text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all mb-1"
                                >
                                    <Settings className="w-4 h-4 shrink-0" /> Settings
                                </Link>

                                <button
                                    onClick={() => { clearAuth(); setMobileOpen(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                >
                                    <LogOut className="w-4 h-4 shrink-0" /> Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Header;
