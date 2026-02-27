import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import toast from 'react-hot-toast';
import {
    User, CreditCard, FileText, ShieldCheck, Lock, Bell,
    BarChart2, Star, HelpCircle, Flag, ChevronRight, X,
    Plus, Pencil, Trash2, Upload, Check, AlertCircle,
    Sun, Moon, Eye, EyeOff,
    TrendingUp, ArrowRight, Zap, CheckCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { detectCardBrand, validateCardNumber, validateExpiry, formatCardNumber, formatExpiry, validateCardName } from '../lib/cardUtils';

// ── Types ────────────────────────────────────────────────────────────────────
interface Card { id: number; last4: string; brand: string; expiry: string; is_default: boolean; }
interface Transaction {
    id: number;
    amount: string | number;
    type: 'credit' | 'debit';
    source: string;
    description: string;
    reference: string;
    status: 'pending' | 'success' | 'failed';
    created_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const Section = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
    <div>
        <div className="pb-6 mb-6 border-b border-neutral-100 dark:border-neutral-700">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{title}</h2>
            {subtitle && <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">{subtitle}</p>}
        </div>
        {children}
    </div>
);

const Field = ({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) => (
    <div>
        <label className="block text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1.5">{label}</label>
        {React.Children.map(children, child => {
            if (React.isValidElement(child) && typeof child.type !== 'string') {
                return React.cloneElement(child as React.ReactElement<any>, { error: !!error });
            }
            return child;
        })}
        {error && <p className="text-xs text-red-500 font-bold mt-1.5 animate-in slide-in-from-top-1 duration-200">{error}</p>}
    </div>
);

const Input = ({ className, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) => (
    <input 
        {...props} 
        className={cn(
            "w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all disabled:text-neutral-400",
            "bg-white dark:bg-neutral-800 disabled:bg-neutral-50 dark:disabled:bg-neutral-900",
            error 
                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" 
                : "border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-[#14a800]/50 focus:ring-2 focus:ring-[#14a800]/10",
            className
        )} 
    />
);

const Select = ({ error, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) => (
    <select 
        {...props} 
        className={cn(
            "w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all",
            "bg-white dark:bg-neutral-800",
            error 
                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" 
                : "border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-[#14a800]/50 focus:ring-2 focus:ring-[#14a800]/10",
            props.className
        )} 
    />
);

const Btn = ({ children, variant = 'primary', className = '', ...props }: { children: React.ReactNode; variant?: 'primary' | 'outline' | 'ghost' | 'danger'; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} className={cn('px-5 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100',
        variant === 'primary' && 'bg-[#14a800] text-white hover:bg-[#118b00] shadow-sm',
        variant === 'outline' && 'border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800',
        variant === 'ghost' && 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
        variant === 'danger' && 'border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
        className)}>
        {children}
    </button>
);

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', variant = 'danger' }: { isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmText?: string; variant?: 'danger' | 'primary' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onCancel}>
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-2", variant === 'danger' ? "bg-red-50 dark:bg-red-900/20" : "bg-[#14a800]/10")}>
                        {variant === 'danger' ? <Trash2 className="w-8 h-8 text-red-500" /> : <CheckCircle className="w-8 h-8 text-[#14a800]" />}
                    </div>
                    <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">{title}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">{message}</p>
                    <div className="flex gap-3 mt-6 w-full">
                        <Btn variant={variant} className="flex-1 justify-center py-3" onClick={onConfirm}>{confirmText}</Btn>
                        <Btn variant="outline" className="flex-1 justify-center py-3" onClick={onCancel}>Cancel</Btn>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── 1. Account Info ──────────────────────────────────────────────────────────
const AccountInfo = ({ user }: { user: any }) => {
    const { fetchUser, logout, updateProfile } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [form, setForm] = useState({
        address: user?.address || '',
        city: user?.city || '',
        postal_code: user?.postal_code || '',
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    useEffect(() => {
        if (user) {
            setForm({
                address: user.address || '',
                city: user.city || '',
                postal_code: user.postal_code || '',
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsLoading(true);
        setErrors({});
        
        // Clean form: convert empty strings to null for nullable backend fields
        const cleanedForm = Object.fromEntries(
            Object.entries(form).map(([key, value]) => [key, value === '' ? null : value])
        );

        try {
            await updateProfile(cleanedForm as any);
            toast.success('Profile updated successfully!');
        } catch (err: any) {
            if (err.response?.status === 422) {
                console.log('Validation failed (handled):', err.response.data.errors);
                setErrors(err.response.data.errors);
                toast.error('Please check the form for errors.');
            } else {
                toast.error(err.response?.data?.message || 'Failed to update profile.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const [showCloseModal, setShowCloseModal] = useState(false);

    const handleCloseAccount = async () => {
        setIsLoading(true);
        try {
            await axios.delete('/user');
            toast.success('Account closed. We are sorry to see you go.');
            await logout();
            window.location.href = '/';
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to close account.');
        } finally {
            setIsLoading(false);
            setShowCloseModal(false);
        }
    };

    return (
        <Section title="Account Info">
            <ConfirmModal 
                isOpen={showCloseModal}
                title="Close Account"
                message="Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone."
                confirmText="Close account"
                onConfirm={handleCloseAccount}
                onCancel={() => setShowCloseModal(false)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name" error={errors.name?.[0]}>
                    <Input 
                        value={form.name} 
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                        placeholder="John Doe" 
                    />
                </Field>
                <Field label="Email Address" error={errors.email?.[0]}>
                    <Input 
                        value={form.email} 
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                        placeholder="john@example.com" 
                        disabled
                    />
                </Field>
                <Field label="Phone Number" error={errors.phone?.[0]}>
                    <Input 
                        value={form.phone} 
                        onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setForm(f => ({ ...f, phone: val }));
                        }} 
                        placeholder="080 1234 5678" 
                    />
                </Field>
                <div className="md:col-span-2">
                    <Field label="Address" error={errors.address?.[0]}>
                        <Input 
                            value={form.address} 
                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} 
                            placeholder="Street address, Apartment, Suite" 
                        />
                    </Field>
                </div>
                <Field label="City" error={errors.city?.[0]}>
                    <Input 
                        value={form.city} 
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))} 
                        placeholder="Lagos" 
                    />
                </Field>
                <Field label="Postal Code" error={errors.postal_code?.[0]}>
                    <Input 
                        value={form.postal_code} 
                        onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                            setForm(f => ({ ...f, postal_code: val }));
                        }} 
                        placeholder="100001" 
                        maxLength={6}
                    />
                </Field>
            </div>
            <div className="flex items-center gap-3 mt-6">
                <Btn onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save changes'}
                </Btn>
                <Btn variant="outline" onClick={() => setForm({
                    address: user?.address || '',
                    city: user?.city || '',
                    postal_code: user?.postal_code || '',
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                })}>Cancel</Btn>
            </div>
            <div className="mt-10 p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <h3 className="font-black text-red-700 dark:text-red-500 mb-1">Danger Zone</h3>
                <p className="text-sm text-red-500 dark:text-red-400 mb-4">Permanently close your account. This cannot be undone.</p>
                <Btn variant="danger" onClick={() => setShowCloseModal(true)} disabled={isLoading}>Close my account</Btn>
            </div>
        </Section>
    );
};

const WalletPayments = () => {
    const [searchParams] = useSearchParams();
    const { user, fetchUser } = useAuthStore();
    const [cards, setCards] = useState<Card[]>([]);
    const [history, setHistory] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showFundModal, setShowFundModal] = useState(false);
    const [fundAmount, setFundAmount] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; cardId: number | null }>({ isOpen: false, cardId: null });
    const [form, setForm] = useState({ number: '', expiry: '', cvv: '', email: user?.email || '', saveForFuture: true });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const fetchCards = async () => {
        try {
            const { data } = await axios.get('/payment-methods');
            setCards(data);
        } catch (err) {
            toast.error('Failed to fetch payment methods.');
        }
    };

    const fetchHistory = async () => {
        setIsHistoryLoading(true);
        try {
            const { data } = await axios.get('/wallet/transactions');
            setHistory(data.data);
        } catch (err) {
            console.error('Failed to fetch transaction history');
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const verifyFunding = async (ref: string) => {
        setIsSaving(true);
        const t = toast.loading('Verifying funding...');
        try {
            await axios.post('/wallet/fund/verify', { reference: ref });
            toast.success('Wallet funded successfully!', { id: t });
            await fetchUser();
            fetchHistory();
        } catch (err) {
            toast.error('Funding verification failed.', { id: t });
        } finally {
            setIsSaving(false);
            // Clear URL params
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await Promise.all([fetchCards(), fetchHistory()]);
            setIsLoading(false);
            
            const ref = searchParams.get('reference') || searchParams.get('trxref');
            if (ref && !isSaving) {
                verifyFunding(ref);
            }
        };
        init();
    }, []);

    const handleFundInitialize = async () => {
        const amount = parseFloat(fundAmount);
        if (isNaN(amount) || amount < 100) return toast.error('Minimum funding amount is ₦100');
        
        setIsSaving(true);
        try {
            const { data: response } = await axios.post('/wallet/fund/initialize', { amount });
            if (response.status && response.data.authorization_url) {
                window.location.href = response.data.authorization_url;
            } else {
                toast.error('Failed to initialize Paystack.');
                setIsSaving(false);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to initialize funding.');
            setIsSaving(false);
        }
    };

    const openAdd = () => { 
        setForm({ number: '', expiry: '', cvv: '', email: user?.email || '', saveForFuture: true }); 
        setShowModal(true); 
    };

    const removeCard = async (id: number) => {
        setConfirmDelete({ isOpen: true, cardId: id });
    };

    const handleConfirmRemove = async () => {
        const id = confirmDelete.cardId;
        if (!id) return;
        try {
            await axios.delete(`/payment-methods/${id}`);
            setCards(p => p.filter(c => c.id !== id));
            toast.success('Card removed.');
        } catch (err) {
            toast.error('Failed to remove card.');
        } finally {
            setConfirmDelete({ isOpen: false, cardId: null });
        }
    };

    const setDefault = async (id: number) => {
        try {
            await axios.patch(`/payment-methods/${id}/default`);
            setCards(p => p.map(c => ({ ...c, is_default: c.id === id })));
            toast.success('Default payment method updated.');
        } catch (err) {
            toast.error('Failed to update default card.');
        }
    };

    const saveCard = async () => {
        const errors: Record<string, string> = {};
        if (!validateCardNumber(form.number)) errors.number = 'Invalid card number';
        if (!validateExpiry(form.expiry) && detectCardBrand(form.number) !== 'Verve') errors.expiry = 'Invalid expiry (MM/YY)';
        if (form.cvv.length < 3) errors.cvv = 'Invalid CVV';
        if (!form.email || !form.email.includes('@')) errors.email = 'Valid email is required';

        if (Object.keys(errors).length > 0) { setFormErrors(errors); return toast.error('Please fix validation errors.'); }

        setIsSaving(true);
        try {
            const { data: response } = await axios.post('/payment-methods/initialize', { email: form.email });
            if (!response.status) throw new Error(response.message || 'Initialization failed');
            if (!(window as any).PaystackPop) throw new Error('Paystack SDK not loaded. Please refresh the page.');

            const publicKey = (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY;
            const [expiryMonth, expiryYearRaw] = form.expiry.split('/');
            const expiryYear = expiryYearRaw.length === 2 ? `20${expiryYearRaw}` : expiryYearRaw;

            const handler = (window as any).PaystackPop.setup({
                key: publicKey,
                email: response.data.email || user?.email,
                amount: 5000, 
                access_code: response.data.access_code,
                card: { number: form.number.replace(/\s/g, ''), cvv: form.cvv, expiry_month: expiryMonth, expiry_year: expiryYear },
                onClose: () => setIsSaving(false),
                callback: (res: any) => handlePaymentCallback(res.reference),
                onSuccess: (res: any) => handlePaymentCallback(res.reference)
            });
            handler.openIframe();
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Failed to initialize Paystack.');
            setIsSaving(false);
        }
    };

    const handlePaymentCallback = async (reference: string) => {
        try {
            const { data: finalData } = await axios.post('/payment-methods', { reference });
            setCards(p => [...p, finalData]);
            toast.success('Card added successfully!');
            setShowModal(false);
        } catch (err) {
            toast.error('Failed to save verified card.');
        } finally {
            setIsSaving(false);
        }
    };

    const brandIcon = (b: string) => {
        if (b === 'Visa') return 'Visa';
        if (b === 'Mastercard') return 'MC';
        if (b === 'Verve') return 'Verve';
        return 'Card';
    };

    return (
        <Section title="Wallet & Payments" subtitle="Manage your funds and payment methods">
            {/* 1. Wallet Balance Card */}
            <div className="mb-10">
                <div className="relative overflow-hidden bg-neutral-900 dark:bg-neutral-800 rounded-3xl p-8 text-white shadow-xl group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#14a800]/20 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24 transition-transform group-hover:scale-110 duration-700" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <p className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-1">Available Balance</p>
                            <h3 className="text-4xl sm:text-5xl font-black tracking-tight">
                                <span className="text-[#14a800] mr-2">₦</span>
                                {Number(user?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h3>
                            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-neutral-400">
                                <ShieldCheck className="w-4 h-4 text-[#14a800]" />
                                Secured wallet system powered by Paystack
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Btn onClick={() => setShowFundModal(true)} className="bg-white text-neutral-900 border-0 hover:bg-neutral-100 px-8 py-3.5 h-auto">
                                <Plus className="w-5 h-5 inline mr-2" /> Top Up Wallet
                            </Btn>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Payment Methods */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-100 tracking-tight">Saved Cards</h3>
                    <button onClick={openAdd} className="text-xs font-black text-[#14a800] uppercase tracking-widest hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add New
                    </button>
                </div>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(2).fill(0).map((_, i) => (
                            <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
                        ))
                    ) : cards.length > 0 ? (
                        cards.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 hover:border-[#14a800]/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-8 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center justify-center font-black text-[10px] text-neutral-600 dark:text-neutral-400">{brandIcon(c.brand)}</div>
                                    <div>
                                        <p className="font-black text-neutral-900 dark:text-neutral-100 text-sm">{c.brand} •••• {c.last4}</p>
                                        <p className="text-xs text-neutral-400 font-medium">Expires {c.expiry}</p>
                                    </div>
                                    {c.is_default && <span className="text-[10px] font-black bg-[#14a800]/10 text-[#14a800] px-2 py-1 rounded-full uppercase tracking-widest">Default</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    {!c.is_default && <Btn variant="ghost" className="text-xs" onClick={() => setDefault(c.id)}>Set default</Btn>}
                                    <button onClick={() => removeCard(c.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/20">
                            <CreditCard className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
                            <p className="text-sm text-neutral-500 font-bold">No cards saved</p>
                            <p className="text-xs text-neutral-400 mt-1">Add a card for seamless payments and wallet top-ups</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Transaction History */}
            <div>
                <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-100 tracking-tight mb-4 flex items-center gap-2">
                    Recent Transactions
                    {isHistoryLoading && <div className="w-4 h-4 border-2 border-[#14a800] border-t-transparent rounded-full animate-spin" />}
                </h3>
                <div className="space-y-3">
                    {isHistoryLoading && history.length === 0 ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-16 w-full animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
                        ))
                    ) : history.length > 0 ? (
                        history.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-800/20">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                        tx.type === 'credit' ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-red-50 dark:bg-red-900/20 text-red-600"
                                    )}>
                                        {tx.type === 'credit' ? <Plus className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 rotate-90" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">{tx.description}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">#{tx.reference.slice(-8)}</p>
                                            <span className="text-[8px] text-neutral-300">•</span>
                                            <p className="text-[10px] text-neutral-400 font-medium">{new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={cn(
                                        "font-black text-sm",
                                        tx.type === 'credit' ? "text-green-600" : "text-neutral-900 dark:text-neutral-100"
                                    )}>
                                        {tx.type === 'credit' ? '+' : '-'} ₦{parseFloat(tx.amount as any).toLocaleString()}
                                    </p>
                                    <p className={cn(
                                        "text-[9px] font-black uppercase tracking-widest mt-0.5",
                                        tx.status === 'success' ? "text-[#14a800]" : tx.status === 'failed' ? "text-red-500" : "text-amber-500"
                                    )}>{tx.status}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-neutral-500 font-medium">No transactions found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Fund Wallet Modal */}
            {showFundModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShowFundModal(false)}>
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 w-full max-w-sm m-4 border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">Fund Wallet</h3>
                            <button onClick={() => setShowFundModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><X className="w-5 h-5 text-neutral-400" /></button>
                        </div>
                        <div className="space-y-6">
                            <Field label="Amount to Top Up (₦)">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-neutral-400">₦</span>
                                    <Input 
                                        type="number" 
                                        placeholder="5,000" 
                                        className="pl-8 text-lg py-4 h-14"
                                        value={fundAmount} 
                                        onChange={e => setFundAmount(e.target.value)}
                                        disabled={isSaving}
                                    />
                                </div>
                            </Field>
                            <div className="grid grid-cols-3 gap-2">
                                {[2000, 5000, 10000].map(amt => (
                                    <button 
                                        key={amt}
                                        onClick={() => setFundAmount(amt.toString())}
                                        className="py-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs font-black text-neutral-600 dark:text-neutral-400 hover:border-[#14a800] hover:text-[#14a800] transition-all"
                                    >
                                        + ₦{amt.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex gap-3">
                                <TrendingUp className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
                                    Funds will be instantly added to your wallet upon successful payment. You can use these funds for any booking on Forafix.
                                </p>
                            </div>
                            <Btn onClick={handleFundInitialize} className="w-full h-14 text-white bg-[#14a800] hover:bg-[#118b00] border-0 text-md shadow-xl" disabled={isSaving || !fundAmount}>
                                {isSaving ? 'Connecting Paystack...' : 'Proceed to Payment'}
                            </Btn>
                        </div>
                    </div>
                </div>
            )}
            <Btn onClick={openAdd}><Plus className="w-4 h-4 inline mr-1.5" />Add payment method</Btn>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 w-full max-w-md m-4 border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">Add payment method</h3>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><X className="w-5 h-5 text-neutral-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <Field label="Card number" error={formErrors.number}>
                                <div className="relative">
                                    <Input 
                                        placeholder="0000 0000 0000 0000" 
                                        value={form.number} 
                                        error={!!formErrors.number}
                                        onChange={e => {
                                            const formatted = formatCardNumber(e.target.value);
                                            setForm(f => ({ ...f, number: formatted }));
                                            if (formErrors.number) setFormErrors(prev => ({ ...prev, number: '' }));
                                        }} 
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs text-neutral-400 uppercase tracking-widest">
                                        {detectCardBrand(form.number) !== 'Unknown' && detectCardBrand(form.number)}
                                    </div>
                                </div>
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Expiry (MM/YY)" error={formErrors.expiry}>
                                    <Input 
                                        placeholder="MM/YY" 
                                        value={form.expiry} 
                                        error={!!formErrors.expiry}
                                        onChange={e => {
                                            const formatted = formatExpiry(e.target.value);
                                            setForm(f => ({ ...f, expiry: formatted }));
                                            if (formErrors.expiry) setFormErrors(prev => ({ ...prev, expiry: '' }));
                                        }} 
                                    />
                                </Field>
                                <Field label="CVV" error={formErrors.cvv}>
                                    <Input 
                                        type="password"
                                        placeholder="•••" 
                                        value={form.cvv} 
                                        error={!!formErrors.cvv}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            setForm(f => ({ ...f, cvv: val }));
                                            if (formErrors.cvv) setFormErrors(prev => ({ ...prev, cvv: '' }));
                                        }} 
                                    />
                                </Field>
                            </div>
                            <Field label="Verification email" error={formErrors.email}>
                                <Input 
                                    type="email"
                                    placeholder="email@example.com" 
                                    value={form.email} 
                                    error={!!formErrors.email}
                                    onChange={e => {
                                        setForm(f => ({ ...f, email: e.target.value }));
                                        if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                                    }} 
                                />
                                <p className="text-[10px] text-neutral-400 mt-1 italic">Email associated with the cardholder (if different from yours)</p>
                            </Field>
                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="saveForFuture"
                                    checked={form.saveForFuture}
                                    onChange={e => setForm(f => ({ ...f, saveForFuture: e.target.checked }))}
                                    className="w-4 h-4 rounded border-neutral-300 text-[#14a800] focus:ring-[#14a800]"
                                />
                                <label htmlFor="saveForFuture" className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Save for future bookings</label>
                            </div>
                        </div>

                        <div className="mt-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700 flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-[#14a800] mt-0.5 shrink-0" />
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                                To link your card, Paystack will apply a <span className="text-neutral-900 dark:text-neutral-100 font-black">₦50.00</span> verification charge. This amount is refundable and used to confirm card validity with your bank.
                            </p>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <Btn onClick={saveCard} className="flex-1 justify-center h-12" disabled={isSaving}>
                                {isSaving ? 'Verifying...' : 'Verify and Add Card'}
                            </Btn>
                            <Btn variant="outline" className="h-12" onClick={() => setShowModal(false)} disabled={isSaving}>Cancel</Btn>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={confirmDelete.isOpen} 
                title="Remove Payment Method" 
                message="Are you sure you want to remove this card? This action cannot be undone."
                onConfirm={handleConfirmRemove}
                onCancel={() => setConfirmDelete({ isOpen: false, cardId: null })}
                confirmText="Remove card"
                variant="danger"
            />
        </Section>
    );
};

// ── 3. Tax Information ───────────────────────────────────────────────────────
const TaxInfo = () => {
    const [noVat, setNoVat] = useState(false);
    return (
        <Section title="Tax Information" subtitle="Required for compliance and invoicing">
            <div className="space-y-8">
                <div>
                    <h3 className="font-black text-neutral-800 dark:text-neutral-200 mb-4">Tax Form & Residence</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Tax Form Type">
                            <Select>
                                <option>W-9 (US Person)</option><option>W-8BEN (Non-US Person)</option><option>W-8BEN-E (Non-US Entity)</option>
                            </Select>
                        </Field>
                        <Field label="Country of Residence">
                            <Select><option>Nigeria</option><option>United States</option><option>United Kingdom</option><option>Ghana</option></Select>
                        </Field>
                        <Field label="City"><Input placeholder="City" /></Field>
                        <Field label="Postal Code"><Input placeholder="Postal code" /></Field>
                        <div className="md:col-span-2"><Field label="Address"><Input placeholder="Street address" /></Field></div>
                    </div>
                </div>

                <div>
                    <h3 className="font-black text-neutral-800 dark:text-neutral-200 mb-4">Taxpayer Identification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Legal Name"><Input placeholder="As on government ID" /></Field>
                        <Field label="Country of Citizenship">
                            <Select><option>Nigeria</option><option>United States</option><option>United Kingdom</option></Select>
                        </Field>
                        <Field label="Federal Tax Classification">
                            <Select><option>Individual / Sole proprietor</option><option>C Corporation</option><option>S Corporation</option><option>Partnership</option><option>LLC</option></Select>
                        </Field>
                        <Field label="Date of Birth"><Input type="date" /></Field>
                    </div>
                </div>

                <div>
                    <h3 className="font-black text-neutral-800 dark:text-neutral-200 mb-4">Tax Identification Number</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Effective Date"><Input type="date" /></Field>
                        <Field label="Tax ID Number"><Input placeholder="SSN / EIN / TIN" /></Field>
                    </div>
                </div>

                <div>
                    <h3 className="font-black text-neutral-800 dark:text-neutral-200 mb-3">Additional Tax Information</h3>
                    <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="font-black text-sm text-neutral-900 dark:text-neutral-100 font-inter">Value-Added Tax (VAT)</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-inter mt-0.5">Enter your VAT ID if you are VAT registered</p>
                            </div>
                        </div>
                        {!noVat && <Field label="VAT ID Number"><Input placeholder="e.g. GB123456789" /></Field>}
                        <button onClick={() => setNoVat(v => !v)} className="mt-3 text-sm font-black text-[#14a800] hover:underline">{noVat ? 'I have a VAT ID' : "I don't have a VAT ID"}</button>
                    </div>
                </div>

                <Btn onClick={() => toast.success('Tax information saved!')}>Save tax information</Btn>
            </div>
        </Section>
    );
};

// ── 4. Identity Verification ─────────────────────────────────────────────────
const IdentityVerification = () => {
    const [step, setStep] = useState<'idle' | 'id' | 'selfie' | 'done'>('idle');
    const [idFile, setIdFile] = useState<string | null>(null);
    const [selfieFile, setSelfieFile] = useState<string | null>(null);

    const handleFile = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        const r = new FileReader(); r.onload = ev => setter(ev.target?.result as string); r.readAsDataURL(f);
    };

    if (step === 'done') return (
        <Section title="Identity Verification">
            <div className="flex flex-col items-center py-16 gap-4">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-[#14a800]" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">Verification submitted!</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-xs font-medium">Your documents have been submitted for review. We'll notify you within 1–2 business days.</p>
                <div className="mt-2 px-5 py-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 rounded-xl text-xs font-black text-amber-700 dark:text-amber-500 tracking-widest uppercase">⏳ Under Review</div>
            </div>
        </Section>
    );

    return (
        <Section title="Identity Verification" subtitle="Verify your identity to unlock all platform features">
            {step === 'idle' && (
                <div className="space-y-5">
                    <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-black text-amber-800 dark:text-amber-500 text-sm">Identity not verified</p>
                            <p className="text-xs text-amber-600 dark:text-amber-500/70 mt-0.5 font-medium">Complete verification to access all bookings and payment features.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { icon: FileText, title: 'Government ID', desc: 'Passport, Driver\'s license, or National ID card' },
                            { icon: User, title: 'Selfie', desc: 'A clear photo of your face matching your ID' },
                            { icon: ShieldCheck, title: 'Review', desc: 'We review your documents within 1–2 business days' },
                        ].map((s, i) => (
                            <div key={i} className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mb-3">
                                    <s.icon className="w-5 h-5 text-[#14a800]" />
                                </div>
                                <p className="font-black text-sm text-neutral-900 dark:text-neutral-100 mb-1">Step {i + 1}: {s.title}</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-inter">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                    <Btn onClick={() => setStep('id')}>Start verification <ArrowRight className="w-4 h-4 inline ml-1" /></Btn>
                </div>
            )}

            {step === 'id' && (
                <div className="max-w-md space-y-5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-[#14a800] text-white flex items-center justify-center font-black text-sm">1</div>
                        <div className="flex-1 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full"><div className="w-1/2 h-full bg-[#14a800] rounded-full" /></div>
                        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 flex items-center justify-center font-black text-sm">2</div>
                    </div>
                    <h3 className="font-black text-neutral-900 dark:text-neutral-100 tracking-tight">Upload Government ID</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Upload a clear photo or scan of your government-issued ID. Make sure all text is legible.</p>
                    <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-[2rem] p-12 flex flex-col items-center gap-4 hover:border-[#14a800]/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer" onClick={() => document.getElementById('id-upload')?.click()}>
                        <Upload className="w-10 h-10 text-neutral-400" />
                        {idFile ? <img src={idFile} className="max-h-48 rounded-2xl shadow-xl object-cover" alt="ID" /> : <><p className="font-black text-sm text-neutral-600 dark:text-neutral-300">Click to choose ID file</p><p className="text-xs text-neutral-400 font-inter">JPG, PNG or PDF — Max 10MB</p></>}
                    </div>
                    <input id="id-upload" type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile(setIdFile)} />
                    <div className="flex gap-3">
                        <Btn onClick={() => { if (idFile) setStep('selfie'); else toast.error('Please upload your ID first.'); }}>Continue</Btn>
                        <Btn variant="outline" onClick={() => setStep('idle')}>Back</Btn>
                    </div>
                </div>
            )}

            {step === 'selfie' && (
                <div className="max-w-md space-y-5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-[#14a800] text-white flex items-center justify-center font-black text-sm"><Check className="w-4 h-4" /></div>
                        <div className="flex-1 h-1 bg-[#14a800] rounded-full" />
                        <div className="w-8 h-8 rounded-full bg-[#14a800] text-white flex items-center justify-center font-black text-sm">2</div>
                    </div>
                    <h3 className="font-black text-neutral-900 dark:text-neutral-100 tracking-tight">Take a Selfie</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Hold your ID next to your face. Ensure your face and all ID text are clearly visible in good lighting.</p>
                    <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-[2rem] p-12 flex flex-col items-center gap-4 hover:border-[#14a800]/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer" onClick={() => document.getElementById('selfie-upload')?.click()}>
                        <User className="w-10 h-10 text-neutral-400" />
                        {selfieFile ? <img src={selfieFile} className="max-h-48 rounded-2xl shadow-xl object-cover" alt="Selfie" /> : <><p className="font-black text-sm text-neutral-600 dark:text-neutral-300">Upload selfie with ID</p><p className="text-xs text-neutral-400 font-inter">JPG or PNG — Max 10MB</p></>}
                    </div>
                    <input id="selfie-upload" type="file" accept="image/*" className="hidden" onChange={handleFile(setSelfieFile)} />
                    <div className="flex gap-3">
                        <Btn onClick={() => { if (selfieFile) { toast.success('Documents submitted for review!'); setStep('done'); } else toast.error('Please upload a selfie.'); }}>Submit verification</Btn>
                        <Btn variant="outline" onClick={() => setStep('id')}>Back</Btn>
                    </div>
                </div>
            )}
        </Section>
    );
};

// ── 5. Password & Security ───────────────────────────────────────────────────
const PasswordSecurity = () => {
    const { user, fetchUser } = useAuthStore();
    const [show, setShow] = useState({ cur: false, new: false, confirm: false });
    const [isLoading, setIsLoading] = useState(false);
    const [passForm, setPassForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    
    const [twoFAModal, setTwoFAModal] = useState(false);
    const [twoFAStep, setTwoFAStep] = useState<'qr' | 'confirm' | 'recovery'>('qr');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [confirmationCode, setConfirmationCode] = useState('');
    const [disablePassword, setDisablePassword] = useState('');
    const [showDisableModal, setShowDisableModal] = useState(false);

    const [sessions, setSessions] = useState<any[]>([]);
    const [isSessionsLoading, setIsSessionsLoading] = useState(true);

    const toggle = (k: keyof typeof show) => setShow(s => ({ ...s, [k]: !s[k] }));

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setIsSessionsLoading(true);
        try {
            const response = await axios.get('/sessions');
            setSessions(response.data);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        } finally {
            setIsSessionsLoading(false);
        }
    };

    const handleRevokeSession = async (sessionId: string) => {
        try {
            await axios.delete(`/sessions/${sessionId}`);
            toast.success('Session revoked successfully.');
            setSessions(prev => prev.filter(s => s.id !== sessionId));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to revoke session.');
        }
    };

    const handleRevokeAll = async () => {
        setIsSessionsLoading(true);
        try {
            await axios.post('/sessions/revoke-others');
            toast.success('All other sessions revoked.');
            setSessions(prev => prev.filter(s => s.is_current));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to revoke other sessions.');
        } finally {
            setIsSessionsLoading(false);
            fetchSessions();
            setShowRevokeModal(false);
        }
    };

    const [showRevokeModal, setShowRevokeModal] = useState(false);

    const handleUpdatePassword = async () => {
        if (!passForm.current_password || !passForm.password || !passForm.password_confirmation) {
            toast.error('Please fill in all password fields.');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('/password/update', passForm);
            toast.success('Password updated successfully!');
            setPassForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update password.');
            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0] as string[];
                toast.error(firstError[0]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnable2FA = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('/two-factor/enable');
            setQrCode(response.data.qr_code);
            setSecret(response.data.secret);
            setTwoFAStep('qr');
            setTwoFAModal(true);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to initiate 2FA setup.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm2FA = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('/two-factor/confirm', { code: confirmationCode });
            toast.success('Two-factor authentication enabled!');
            setRecoveryCodes(response.data.recovery_codes || []);
            setTwoFAStep('recovery');
            fetchUser();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        setIsLoading(true);
        try {
            await axios.post('/two-factor/disable', { password: disablePassword });
            toast.success('Two-factor authentication disabled.');
            setShowDisableModal(false);
            setDisablePassword('');
            fetchUser();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Incorrect password.');
        } finally {
            setIsLoading(false);
        }
    };

    const is2FAEnabled = !!user?.two_factor_confirmed_at;

    return (
        <Section title="Password & Security" subtitle="Keep your account safe">
            <ConfirmModal 
                isOpen={showRevokeModal}
                title="Revoke Sessions"
                message="Are you sure you want to revoke all other sessions? This will log you out from all other devices."
                confirmText="Revoke all"
                onConfirm={handleRevokeAll}
                onCancel={() => setShowRevokeModal(false)}
            />
            <div className="max-w-md space-y-6">
                <div className="space-y-4">
                    <h3 className="font-black text-neutral-800 dark:text-neutral-200">Change Password</h3>
                    <Field label="Current password">
                        <div className="relative">
                            <Input 
                                type={show.cur ? 'text' : 'password'} 
                                placeholder="••••••••" 
                                value={passForm.current_password}
                                onChange={e => setPassForm(p => ({ ...p, current_password: e.target.value }))}
                            />
                            <button type="button" onClick={() => toggle('cur')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                {show.cur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </Field>
                    <Field label="New password">
                        <div className="relative">
                            <Input 
                                type={show.new ? 'text' : 'password'} 
                                placeholder="••••••••" 
                                value={passForm.password}
                                onChange={e => setPassForm(p => ({ ...p, password: e.target.value }))}
                            />
                            <button type="button" onClick={() => toggle('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </Field>
                    <Field label="Confirm new password">
                        <div className="relative">
                            <Input 
                                type={show.confirm ? 'text' : 'password'} 
                                placeholder="••••••••" 
                                value={passForm.password_confirmation}
                                onChange={e => setPassForm(p => ({ ...p, password_confirmation: e.target.value }))}
                            />
                            <button type="button" onClick={() => toggle('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </Field>
                    <Btn onClick={handleUpdatePassword} disabled={isLoading}>Update password</Btn>
                </div>

                <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <h3 className="font-black text-neutral-800 dark:text-neutral-200 mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                        <div>
                            <p className="font-black text-sm text-neutral-900 dark:text-neutral-100 font-inter">Authenticator app (2FA)</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-inter mt-0.5">{is2FAEnabled ? 'Currently enabled' : 'Adds an extra layer of security'}</p>
                        </div>
                        <button 
                            onClick={() => is2FAEnabled ? setShowDisableModal(true) : handleEnable2FA()}
                            disabled={isLoading}
                            className={cn('w-12 h-6 rounded-full transition-colors relative', is2FAEnabled ? 'bg-[#14a800]' : 'bg-neutral-300 dark:bg-neutral-700')}
                        >
                            <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', is2FAEnabled ? 'left-6' : 'left-0.5')} />
                        </button>
                    </div>
                </div>

                {/* 2FA Enable Modal */}
                {twoFAModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setTwoFAModal(false)}>
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 w-full max-md m-4 border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">Security Setup</h3>
                                <button onClick={() => setTwoFAModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><X className="w-5 h-5 text-neutral-400" /></button>
                            </div>

                            {twoFAStep === 'qr' ? (
                                <div className="space-y-6 text-center">
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Scan this QR code with your authenticator app (like Google Authenticator or Authy).</p>
                                    <div className="bg-white p-4 rounded-2xl inline-block border border-neutral-100 mx-auto" dangerouslySetInnerHTML={{ __html: qrCode }} />
                                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
                                        <p className="text-[10px] uppercase font-black text-neutral-400 tracking-widest mb-1">Secret Key</p>
                                        <code className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 break-all">{secret}</code>
                                    </div>
                                    <Btn className="w-full" onClick={() => setTwoFAStep('confirm')}>I've scanned it</Btn>
                                </div>
                            ) : twoFAStep === 'confirm' ? (
                                <div className="space-y-6">
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium text-center">Enter the 6-digit code from your app to confirm.</p>
                                    <Input 
                                        placeholder="000 000" 
                                        className="text-center text-2xl tracking-[0.3em] font-black"
                                        maxLength={6}
                                        value={confirmationCode}
                                        onChange={e => setConfirmationCode(e.target.value)}
                                    />
                                    <div className="flex gap-3">
                                        <Btn className="flex-1" onClick={handleConfirm2FA} disabled={confirmationCode.length < 6 || isLoading}>Verify & Enable</Btn>
                                        <Btn variant="outline" onClick={() => setTwoFAStep('qr')}>Back</Btn>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center gap-4 py-4">
                                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                            <ShieldCheck className="w-8 h-8 text-[#14a800]" />
                                        </div>
                                        <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-100">2FA Enabled!</h3>
                                    </div>
                                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 mt-4">
                                        <p className="text-xs font-black text-neutral-400 tracking-widest uppercase mb-3">Recovery Codes</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {recoveryCodes.map((code, idx) => (
                                                <div key={idx} className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-700 p-2 rounded-lg text-center">{code}</div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-neutral-400 font-medium mt-3 text-center leading-relaxed">Save these codes in a safe place. You can use them to log in if you lose access to your authenticator app.</p>
                                    </div>
                                    <Btn className="w-full" onClick={() => setTwoFAModal(false)}>Finish</Btn>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2FA Disable Modal */}
                {showDisableModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDisableModal(false)}>
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 w-full max-w-sm m-4 border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                            <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight mb-4 text-center">Disable Security?</h3>
                            <p className="text-sm text-red-500 font-medium text-center mb-6">You're removing an essential layer of security. Please enter your password to continue.</p>
                            <Input 
                                type="password" 
                                placeholder="Account Password" 
                                value={disablePassword}
                                onChange={e => setDisablePassword(e.target.value)}
                            />
                            <div className="flex gap-3 mt-6">
                                <Btn variant="danger" className="flex-1" onClick={handleDisable2FA} disabled={!disablePassword || isLoading}>Disable 2FA</Btn>
                                <Btn variant="outline" className="flex-1" onClick={() => setShowDisableModal(false)}>Keep it on</Btn>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-neutral-800 dark:text-neutral-200">Active Sessions</h3>
                        {sessions.length > 1 && (
                            <button 
                                onClick={() => setShowRevokeModal(true)}
                                className="text-[10px] uppercase font-black tracking-widest text-red-500 hover:text-red-600 transition-colors"
                            >
                                Revoke all others
                            </button>
                        )}
                    </div>
                    {isSessionsLoading ? (
                        <div className="py-8 flex justify-center">
                            <div className="w-6 h-6 border-2 border-[#14a800] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-sm text-neutral-500 text-center py-4">No other active sessions found.</p>
                    ) : (
                        sessions.map((s, i) => (
                            <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 mb-2">
                                <div>
                                    <p className="text-sm font-black text-neutral-900 dark:text-neutral-100">
                                        {s.device || 'Unknown Device'} 
                                        {s.is_current && <span className="text-[10px] bg-[#14a800]/10 text-[#14a800] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest ml-1">Current</span>}
                                    </p>
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-inter mt-0.5">{s.location} · {s.time}</p>
                                </div>
                                {!s.is_current && (
                                    <Btn 
                                        variant="danger" 
                                        className="text-xs px-3 py-1.5" 
                                        onClick={() => handleRevokeSession(s.id)}
                                    >
                                        Revoke
                                    </Btn>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Section>
    );
};

// ── 6. Notification Settings ─────────────────────────────────────────────────
const NotificationSettings = () => {
    const { user, fetchUser } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const groups = [
        { label: 'Booking Updates', items: ['New booking confirmed', 'Booking cancelled', 'Agent assigned'] },
        { label: 'Messages', items: ['New message received', 'Unread message reminder'] },
        { label: 'Payments', items: ['Payment processed', 'Payment failed', 'Refund issued'] },
        { label: 'Promotions', items: ['Special offers', 'New agents in your area', 'Weekly digest'] },
    ];
    const channels = ['Email', 'Push', 'SMS'];
    const [prefs, setPrefs] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (user?.notification_preferences) {
            setPrefs(user.notification_preferences);
        }
    }, [user]);

    const toggle = (keyString: string) => {
        const isCurrentlyOn = prefs[keyString] !== false;
        const nextValue = !isCurrentlyOn;
        
        setPrefs(p => ({ ...p, [keyString]: nextValue }));

        const parts = keyString.split(':');
        const label = parts[1] || parts[0];
        toast.success(`${label} ${nextValue ? 'enabled' : 'disabled'}`, { duration: 1500 });
    };
    const key = (g: string, item: string, ch: string) => `${g}:${item}:${ch}`;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.put('/notification-settings', { preferences: prefs });
            toast.success('Notification preferences saved!');
            await fetchUser(); // Update global auth state
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save preferences.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Section title="Notification Settings" subtitle="Choose what you want to be notified about">
            <div className="space-y-6">
                {groups.map(g => (
                    <div key={g.label} className="rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                        <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-800 p-4 border-b border-neutral-200 dark:border-neutral-700">
                            <p className="font-black text-sm text-neutral-900 dark:text-neutral-100 uppercase tracking-widest">{g.label}</p>
                        </div>
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {g.items.map(item => (
                                <div key={item} className="flex items-center justify-between px-5 py-3.5">
                                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{item}</p>
                                    <div className="flex items-center gap-5">
                                        {channels.map(ch => {
                                            const k = key(g.label, item, ch);
                                            // Default to true if not explicitly set
                                            const on = prefs[k] !== false;
                                            return (
                                                <div key={ch} className="flex flex-col items-center gap-1">
                                                    <span className="text-[9px] font-black text-neutral-400 uppercase">{ch}</span>
                                                    <button onClick={() => toggle(k)}
                                                        className={cn('w-9 h-5 rounded-full transition-colors relative', on ? 'bg-[#14a800]' : 'bg-neutral-300 dark:bg-neutral-700')}>
                                                        <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform', on ? 'left-4' : 'left-0.5')} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <Btn onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save preferences'}
                </Btn>
            </div>
        </Section>
    );
};

// ── 7. Stats & Trends ────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = 'text-[#14a800]' }: { label: string; value: string; sub: string; color?: string }) => (
    <div className="p-5 rounded-2xl bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:border-[#14a800]/30 transition-all">
        <p className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2 font-inter">{label}</p>
        <p className={cn('text-3xl font-black mb-1 font-inter', color)}>{value}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-inter">{sub}</p>
    </div>
);

const StatsTrends = ({ user }: { user: any }) => {
    const [statsData, setStatsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get('/stats');
                setStatsData(data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) return <div className="p-20 text-center animate-pulse text-neutral-400">Loading stats...</div>;

    const stats = statsData?.stats || { total_bookings: 0, completed: 0, profile_views: 0, unique_agents: 0 };
    const history = statsData?.recent_history || [];
    const relationships = statsData?.top_relationships || [];

    return (
        <Section title="Stats & Trends" subtitle="Your activity and performance on Forafix">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Bookings" value={stats.total_bookings.toString()} sub="All time" />
                <StatCard label="Completed" value={stats.completed.toString()} sub="Services received" color="text-blue-600" />
                <StatCard label="Profile Views" value={stats.profile_views.toString()} sub="Last 30 days" color="text-purple-600" />
                <StatCard label="Agents Worked With" value={stats.unique_agents.toString()} sub="Unique professionals" color="text-amber-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <h3 className="font-black text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#14a800]" /> Booking History</h3>
                    <div className="space-y-2">
                        {history.length > 0 ? history.map((b: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-2.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                                <div>
                                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{b.service}</p>
                                    <p className="text-xs text-neutral-400 font-inter">{b.date}</p>
                                </div>
                                <span className={cn('text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wide', b.color)}>{b.status}</span>
                            </div>
                        )) : (
                            <p className="text-sm text-neutral-400 py-4 text-center italic">No booking history yet.</p>
                        )}
                    </div>
                </div>

                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <h3 className="font-black text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Professional Relationships</h3>
                    <div className="space-y-3">
                        {relationships.length > 0 ? relationships.map((a: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700">
                                <div className="w-9 h-9 rounded-full bg-[#14a800]/10 flex items-center justify-center font-black text-[#14a800] text-sm shrink-0">{a.name[0]}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-neutral-900 dark:text-neutral-100 truncate">{a.name}</p>
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-inter">{a.service} · {a.jobs} job{a.jobs > 1 ? 's' : ''}</p>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {'★'.repeat(a.rating).split('').map((s, j) => <span key={j} className="text-amber-400 text-sm">{s}</span>)}
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-neutral-400 py-4 text-center italic">Start booking to build relationships.</p>
                        )}
                    </div>
                </div>
            </div>
        </Section>
    );
};

// ── 8. Subscription Plans ────────────────────────────────────────────────────
const plans = [
    { name: 'Free', price: '₦0', period: 'Forever', features: ['Up to 3 bookings/month', 'Basic messaging', 'Standard support'], current: true, color: 'border-neutral-200' },
    { name: 'Pro', price: '₦2,500', period: '/month', features: ['Unlimited bookings', 'Priority messaging', 'Priority support', 'Advanced filters', 'Early access to new features'], current: false, color: 'border-[#14a800]', highlight: true },
    { name: 'Business', price: '₦6,500', period: '/month', features: ['Everything in Pro', 'Team management', 'Dedicated account manager', 'Custom invoicing', 'API access'], current: false, color: 'border-blue-400' },
];

const SubscriptionPlans = () => (
    <Section title="Subscription Plans" subtitle="Choose the plan that works for you">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map(p => (
                <div key={p.name} className={cn('rounded-[2rem] border-2 p-8 relative transition-all hover:-translate-y-1', p.color, p.highlight ? 'bg-[#14a800]/5 dark:bg-[#14a800]/10 shadow-xl shadow-[#14a800]/5' : 'bg-white dark:bg-neutral-900')}>
                    {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#14a800] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.2em]">Most Popular</span>}
                    {p.current && <span className="absolute top-6 right-6 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Current Plan</span>}
                    <h3 className="font-black text-2xl text-neutral-900 dark:text-neutral-100 mb-2 tracking-tight">{p.name}</h3>
                    <p className="font-black text-4xl text-neutral-900 dark:text-neutral-100 mb-1 tracking-tighter">{p.price}<span className="text-sm font-bold text-neutral-400 dark:text-neutral-500 ml-1 font-inter">{p.period}</span></p>
                    <ul className="mt-8 space-y-4 mb-10">
                        {p.features.map(f => (
                            <li key={f} className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                                <div className="w-5 h-5 rounded-full bg-[#14a800]/10 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-[#14a800]" />
                                </div>
                                {f}
                            </li>
                        ))}
                    </ul>
                    {p.current
                        ? <Btn variant="outline" className="w-full justify-center h-14 rounded-2xl" disabled>Current active plan</Btn>
                        : <Btn className={cn('w-full justify-center h-14 rounded-2xl shadow-lg', p.highlight ? 'shadow-[#14a800]/20' : 'bg-neutral-900 dark:bg-neutral-800 hover:bg-black dark:hover:bg-neutral-700')} onClick={() => toast.success(`Upgrading to ${p.name}...`)}>Upgrade to {p.name}</Btn>
                    }
                </div>
            ))}
        </div>
    </Section>
);

// ── 9. Help & Support ────────────────────────────────────────────────────────
const HelpSupport = () => {
    const [feedback, setFeedback] = useState('');
    const [contacts, setContacts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchSupport = async () => {
            try {
                const { data } = await axios.get('/help-support');
                // Map icon names back to Lucide components
                const iconMap: any = { Zap, HelpCircle, Star };
                const refined = data.contacts.map((c: any) => ({
                    ...c,
                    icon: iconMap[c.icon] || HelpCircle
                }));
                setContacts(refined);
            } catch (err) {
                console.error('Failed to fetch support contacts:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSupport();
    }, []);

    const submitFeedback = async () => {
        if (!feedback || feedback.length < 5) {
            return toast.error('Please enter at least 5 characters.');
        }
        setIsSubmitting(true);
        try {
            const { data } = await axios.post('/feedback', { content: feedback });
            toast.success(data.message);
            setFeedback('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Section title="Help & Support" subtitle="Get help or share your feedback">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-44 w-full animate-pulse rounded-3xl bg-neutral-100 dark:bg-neutral-800" />
                    ))
                ) : (
                    contacts.map((c, i) => (
                        <div key={i} className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex flex-col gap-4 transition-all hover:bg-white dark:hover:bg-neutral-800 shadow-sm hover:shadow-md">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shadow-sm"><c.icon className="w-6 h-6 text-[#14a800]" /></div>
                            <div>
                                <h3 className="font-black text-neutral-900 dark:text-neutral-100 text-lg tracking-tight">{c.title}</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 font-medium leading-relaxed">{c.desc}</p>
                            </div>
                            {c.action && c.href && (
                                <a href={c.href} className="mt-auto text-[#14a800] text-sm font-black hover:underline flex items-center gap-1.5">{c.action} <ArrowRight className="w-3.5 h-3.5" /></a>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="max-w-lg p-6 rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
                <h3 className="font-black text-neutral-900 dark:text-neutral-100 mb-1">Submit Feedback</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">We read every message.</p>
                <Field label="Your feedback">
                    <textarea 
                        value={feedback} 
                        disabled={isSubmitting}
                        onChange={e => setFeedback(e.target.value)} 
                        rows={4} 
                        placeholder="Tell us what you think..." 
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 text-sm font-medium text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#14a800]/50 focus:ring-2 focus:ring-[#14a800]/10 transition-all resize-none" 
                    />
                </Field>
                <Btn className="mt-4" onClick={submitFeedback} disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send feedback'}
                </Btn>
            </div>
        </Section>
    );
};

// ── 10. Reports ──────────────────────────────────────────────────────────────
const Reports = () => {
    const [form, setForm] = useState({ agentName: '', agentUuid: '', type: '', description: '', evidence: null as string | null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEvidence = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        const r = new FileReader(); r.onload = ev => setForm(p => ({ ...p, evidence: ev.target?.result as string })); r.readAsDataURL(f);
    };

    const submit = async () => {
        if (!form.agentName || !form.type || !form.description) { 
            toast.error('Please fill all required fields.'); 
            return; 
        }

        setIsSubmitting(true);
        try {
            const { data } = await axios.post('/reports', {
                agent_name: form.agentName,
                agent_uuid: form.agentUuid,
                type: form.type,
                description: form.description,
                evidence: form.evidence
            });
            toast.success(data.message);
            setForm({ agentName: '', agentUuid: '', type: '', description: '', evidence: null });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Section title="Reports" subtitle="Report misconduct or issues with agents">
            <div className="p-6 mb-8 rounded-[2rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-500 font-bold leading-relaxed">All reports are reviewed confidentially. Only submit reports that are truthful and made in good faith.</p>
            </div>

            <div className="max-w-xl space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Agent Name *">
                        <Input 
                            placeholder="Full name of the agent" 
                            disabled={isSubmitting}
                            value={form.agentName} 
                            onChange={e => setForm(p => ({ ...p, agentName: e.target.value }))} 
                        />
                    </Field>
                    <Field label="Agent ID / UUID">
                        <Input 
                            placeholder="Optional — found on their profile" 
                            disabled={isSubmitting}
                            value={form.agentUuid} 
                            onChange={e => setForm(p => ({ ...p, agentUuid: e.target.value }))} 
                        />
                    </Field>
                </div>
                <Field label="Incident Type *">
                    <Select 
                        value={form.type} 
                        disabled={isSubmitting}
                        onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    >
                        <option value="">Select incident type</option>
                        <option>Fraud or scam</option>
                        <option>Harassment or abuse</option>
                        <option>No-show / abandoned job</option>
                        <option>Property damage</option>
                        <option>Unprofessional conduct</option>
                        <option>Fake reviews</option>
                        <option>Other</option>
                    </Select>
                </Field>
                <Field label="Description *">
                    <textarea 
                        value={form.description} 
                        disabled={isSubmitting}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))} 
                        rows={5} 
                        placeholder="Describe what happened in detail. Include dates and any other relevant information." 
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 text-sm font-medium text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#14a800]/50 focus:ring-2 focus:ring-[#14a800]/10 transition-all resize-none" 
                    />
                </Field>
                <Field label="Evidence (optional)">
                    <div 
                        onClick={() => !isSubmitting && document.getElementById('evidence-upload')?.click()} 
                        className={cn(
                            "border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-5 flex items-center gap-3 transition-colors",
                            isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-[#14a800]/40"
                        )}
                    >
                        <Upload className="w-5 h-5 text-neutral-400 shrink-0" />
                        {form.evidence ? <img src={form.evidence} className="h-14 rounded-lg object-cover" alt="Evidence" /> : <div><p className="text-sm font-bold text-neutral-600 dark:text-neutral-400">Upload screenshot or photo</p><p className="text-xs text-neutral-400">JPG, PNG, max 10MB</p></div>}
                    </div>
                    <input id="evidence-upload" type="file" accept="image/*" className="hidden" onChange={handleEvidence} disabled={isSubmitting} />
                </Field>
                <Btn onClick={submit} variant="danger" className="bg-red-600 text-white hover:bg-red-700 border-0" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : <><Flag className="w-4 h-4 inline mr-1.5" />Submit Report</>}
                </Btn>
            </div>
        </Section>
    );
};

// ── Sidebar items ─────────────────────────────────────────────────────────────
const ALL_SECTIONS = [
    { id: 'account', label: 'Account Info', icon: User, roles: ['client', 'agent'] },
    { id: 'billing', label: 'Wallet & Payments', icon: CreditCard, roles: ['client', 'agent'] },
    { id: 'tax', label: 'Tax Information', icon: FileText, roles: ['agent'] },
    { id: 'identity', label: 'Identity Verification', icon: ShieldCheck, roles: ['agent'] },
    { id: 'security', label: 'Password & Security', icon: Lock, roles: ['client', 'agent'] },
    { id: 'notifications', label: 'Notification Settings', icon: Bell, roles: ['client', 'agent'] },
    { id: 'stats', label: 'Stats & Trends', icon: BarChart2, roles: ['client', 'agent'] },
    { id: 'plans', label: 'Subscription Plans', icon: Star, roles: ['agent'] },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, roles: ['client', 'agent'] },
    { id: 'reports', label: 'Reports', icon: Flag, roles: ['client', 'agent'] },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
const ClientSettingsPage = () => {
    const { user } = useAuthStore();
    const { isDark, toggle: toggleTheme } = useThemeStore();
    const [searchParams] = useSearchParams();
    const tab = searchParams.get('tab');
    const [active, setActive] = useState(tab || 'account');

    const role = (user?.role || 'client').toLowerCase();
    const sections = ALL_SECTIONS.filter(s => s.roles.includes(role));

    // Update active tab when URL param changes
    useEffect(() => {
        if (tab && sections.some(s => s.id === tab)) {
            setActive(tab);
        } else if (!sections.some(s => s.id === active)) {
            setActive('account');
        }
    }, [tab, role]);

    const renderSection = () => {
        switch (active) {
            case 'account': return <AccountInfo user={user} />;
            case 'billing': return <WalletPayments />;
            case 'tax': return <TaxInfo />;
            case 'identity': return <IdentityVerification />;
            case 'security': return <PasswordSecurity />;
            case 'notifications': return <NotificationSettings />;
            case 'stats': return <StatsTrends user={user} />;
            case 'plans': return <SubscriptionPlans />;
            case 'help': return <HelpSupport />;
            case 'reports': return <Reports />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Mobile tab bar */}
            <div className="md:hidden overflow-x-auto flex border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-16 z-10">
                {sections.map(s => (
                    <button key={s.id} onClick={() => setActive(s.id)}
                        className={cn('flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs font-black whitespace-nowrap transition-colors border-b-2', active === s.id ? 'border-[#14a800] text-[#14a800]' : 'border-transparent text-neutral-500 dark:text-neutral-400')}>
                        <s.icon className="w-3.5 h-3.5" />{s.label}
                    </button>
                ))}
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
                <div className="flex gap-8">
                    {/* Sidebar — desktop */}
                    <aside className="hidden md:flex flex-col w-60 shrink-0">
                        <div className="sticky top-24 space-y-1">
                            <div className="mb-4">
                                <h1 className="text-xl font-black text-neutral-900 dark:text-neutral-100">Settings</h1>
                                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 font-medium">{user?.email}</p>
                            </div>

                            {/* Dark mode toggle */}
                            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 mb-3">
                                <div className="flex items-center gap-2 text-sm font-black text-neutral-700 dark:text-neutral-300">
                                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                    {isDark ? 'Dark mode' : 'Light mode'}
                                </div>
                                <button onClick={toggleTheme}
                                    className={cn('w-9 h-5 rounded-full transition-colors relative', isDark ? 'bg-[#14a800]' : 'bg-neutral-300')}>
                                    <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform', isDark ? 'left-4' : 'left-0.5')} />
                                </button>
                            </div>

                            {sections.map(s => (
                                <button key={s.id} onClick={() => setActive(s.id)}
                                    className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black transition-all text-left',
                                        active === s.id ? 'bg-[#14a800]/10 text-[#14a800]' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800')}>
                                    <s.icon className="w-4 h-4 shrink-0" />
                                    <span className="flex-1">{s.label}</span>
                                    {active === s.id && <ChevronRight className="w-3.5 h-3.5" />}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="flex-1 min-w-0 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
                        {renderSection()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ClientSettingsPage;
