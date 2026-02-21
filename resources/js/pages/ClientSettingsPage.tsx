import React, { useState } from 'react';
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

// ── Types ────────────────────────────────────────────────────────────────────
interface Card { id: number; last4: string; brand: string; expiry: string; isDefault: boolean; }

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

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
        <label className="block text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1.5">{label}</label>
        {children}
    </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#14a800]/50 focus:ring-2 focus:ring-[#14a800]/10 transition-all bg-white dark:bg-neutral-800 disabled:bg-neutral-50 dark:disabled:bg-neutral-900 disabled:text-neutral-400" />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#14a800]/50 focus:ring-2 focus:ring-[#14a800]/10 transition-all bg-white dark:bg-neutral-800" />
);

const Btn = ({ children, variant = 'primary', className = '', ...props }: { children: React.ReactNode; variant?: 'primary' | 'outline' | 'ghost' | 'danger'; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} className={cn('px-5 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95',
        variant === 'primary' && 'bg-[#14a800] text-white hover:bg-[#118b00] shadow-sm',
        variant === 'outline' && 'border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800',
        variant === 'ghost' && 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
        variant === 'danger' && 'border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
        className)}>
        {children}
    </button>
);

// ── 1. Account Info ──────────────────────────────────────────────────────────
const AccountInfo = ({ user }: { user: any }) => (
    <Section title="Account Info" subtitle="Manage your personal information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="User ID"><Input value={user?.uuid || '—'} disabled /></Field>
            <Field label="Role"><Input value={user?.role || '—'} disabled /></Field>
            <Field label="Full Name"><Input defaultValue={user?.name || ''} /></Field>
            <Field label="Email Address"><Input type="email" defaultValue={user?.email || ''} /></Field>
            <Field label="Phone Number"><Input type="tel" placeholder="+234 000 000 0000" /></Field>
            <Field label="Time Zone">
                <Select defaultValue="Africa/Lagos">
                    <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                </Select>
            </Field>
            <div className="md:col-span-2">
                <Field label="Address"><Input placeholder="Street address" /></Field>
            </div>
            <Field label="City"><Input placeholder="City" /></Field>
            <Field label="Postal Code"><Input placeholder="Postal code" /></Field>
        </div>
        <div className="flex items-center gap-3 mt-6">
            <Btn onClick={() => toast.success('Profile saved!')}>Save changes</Btn>
            <Btn variant="outline">Cancel</Btn>
        </div>
        <div className="mt-10 p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
            <h3 className="font-black text-red-700 dark:text-red-500 mb-1">Danger Zone</h3>
            <p className="text-sm text-red-500 dark:text-red-400 mb-4">Permanently close your account. This cannot be undone.</p>
            <Btn variant="danger" onClick={() => toast.error('Please contact support to close your account.')}>Close my account</Btn>
        </div>
    </Section>
);

// ── 2. Billing & Payments ────────────────────────────────────────────────────
const mockCards: Card[] = [
    { id: 1, last4: '4242', brand: 'Visa', expiry: '12/26', isDefault: true },
    { id: 2, last4: '0001', brand: 'Mastercard', expiry: '08/25', isDefault: false },
];

const BillingPayments = () => {
    const [cards, setCards] = useState<Card[]>(mockCards);
    const [showModal, setShowModal] = useState(false);
    const [editCard, setEditCard] = useState<Card | null>(null);
    const [form, setForm] = useState({ number: '', expiry: '', cvc: '', name: '' });

    const openAdd = () => { setEditCard(null); setForm({ number: '', expiry: '', cvc: '', name: '' }); setShowModal(true); };
    const openEdit = (c: Card) => { setEditCard(c); setForm({ number: `**** **** **** ${c.last4}`, expiry: c.expiry, cvc: '', name: 'Card holder' }); setShowModal(true); };
    const removeCard = (id: number) => { setCards(p => p.filter(c => c.id !== id)); toast.success('Card removed.'); };
    const setDefault = (id: number) => setCards(p => p.map(c => ({ ...c, isDefault: c.id === id })));
    const saveCard = () => {
        if (!editCard) {
            setCards(p => [...p, { id: Date.now(), last4: form.number.slice(-4) || '0000', brand: 'Visa', expiry: form.expiry, isDefault: p.length === 0 }]);
            toast.success('Card added!');
        } else {
            setCards(p => p.map(c => c.id === editCard.id ? { ...c, expiry: form.expiry } : c));
            toast.success('Card updated!');
        }
        setShowModal(false);
    };

    const brandIcon = (b: string) => b === 'Visa' ? '💳' : '💳';

    return (
        <Section title="Billing & Payments" subtitle="Manage your payment methods">
            <div className="space-y-3 mb-6">
                {cards.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 hover:border-[#14a800]/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-lg">{brandIcon(c.brand)}</div>
                            <div>
                                <p className="font-black text-neutral-900 dark:text-neutral-100 text-sm">{c.brand} •••• {c.last4}</p>
                                <p className="text-xs text-neutral-400 font-medium font-inter">Expires {c.expiry}</p>
                            </div>
                            {c.isDefault && <span className="text-[10px] font-black bg-[#14a800]/10 text-[#14a800] px-2 py-1 rounded-full uppercase tracking-widest">Default</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            {!c.isDefault && <Btn variant="ghost" className="text-xs" onClick={() => setDefault(c.id)}>Set default</Btn>}
                            <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => removeCard(c.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
            <Btn onClick={openAdd}><Plus className="w-4 h-4 inline mr-1.5" />Add payment method</Btn>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 w-full max-w-md m-4 border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">{editCard ? 'Edit card' : 'Add payment method'}</h3>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><X className="w-5 h-5 text-neutral-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <Field label="Card number"><Input placeholder="1234 5678 9012 3456" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} /></Field>
                            <Field label="Cardholder name"><Input placeholder="Name on card" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Expiry (MM/YY)"><Input placeholder="MM/YY" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} /></Field>
                                <Field label="CVC"><Input placeholder="•••" value={form.cvc} onChange={e => setForm(f => ({ ...f, cvc: e.target.value }))} /></Field>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Btn onClick={saveCard} className="flex-1 justify-center">{editCard ? 'Save changes' : 'Add card'}</Btn>
                            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
                        </div>
                    </div>
                </div>
            )}
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
    const [show, setShow] = useState({ cur: false, new: false, confirm: false });
    const [twoFA, setTwoFA] = useState(false);
    const toggle = (k: keyof typeof show) => setShow(s => ({ ...s, [k]: !s[k] }));

    return (
        <Section title="Password & Security" subtitle="Keep your account safe">
            <div className="max-w-md space-y-6">
                <div className="space-y-4">
                    <h3 className="font-black text-neutral-800 dark:text-neutral-200">Change Password</h3>
                    {(['cur', 'new', 'confirm'] as const).map((k, i) => (
                        <Field key={k} label={['Current password', 'New password', 'Confirm new password'][i]}>
                            <div className="relative">
                                <Input type={show[k] ? 'text' : 'password'} placeholder="••••••••" />
                                <button type="button" onClick={() => toggle(k)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                    {show[k] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </Field>
                    ))}
                    <Btn onClick={() => toast.success('Password updated!')}>Update password</Btn>
                </div>

                <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <h3 className="font-black text-neutral-800 dark:text-neutral-200 mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                        <div>
                            <p className="font-black text-sm text-neutral-900 dark:text-neutral-100 font-inter">Authenticator app (2FA)</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-inter mt-0.5">{twoFA ? 'Currently enabled' : 'Adds an extra layer of security'}</p>
                        </div>
                        <button onClick={() => { setTwoFA(v => !v); toast.success(twoFA ? '2FA disabled' : '2FA enabled!'); }}
                            className={cn('w-12 h-6 rounded-full transition-colors relative', twoFA ? 'bg-[#14a800]' : 'bg-neutral-300 dark:bg-neutral-700')}>
                            <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', twoFA ? 'left-6' : 'left-0.5')} />
                        </button>
                    </div>
                </div>

                <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <h3 className="font-black text-neutral-800 dark:text-neutral-200 mb-4">Active Sessions</h3>
                    {[{ device: 'Chrome on macOS', location: 'Lagos, Nigeria', time: 'Active now', current: true },
                      { device: 'Safari on iPhone', location: 'Abuja, Nigeria', time: '2 hours ago', current: false }].map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 mb-2">
                            <div>
                                <p className="text-sm font-black text-neutral-900 dark:text-neutral-100">{s.device} {s.current && <span className="text-[10px] bg-[#14a800]/10 text-[#14a800] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest ml-1">Current</span>}</p>
                                <p className="text-xs text-neutral-400 dark:text-neutral-500 font-inter mt-0.5">{s.location} · {s.time}</p>
                            </div>
                            {!s.current && <Btn variant="danger" className="text-xs" onClick={() => toast.success('Session revoked.')}>Revoke</Btn>}
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
};

// ── 6. Notification Settings ─────────────────────────────────────────────────
const NotificationSettings = () => {
    const groups = [
        { label: 'Booking Updates', items: ['New booking confirmed', 'Booking cancelled', 'Agent assigned'] },
        { label: 'Messages', items: ['New message received', 'Unread message reminder'] },
        { label: 'Payments', items: ['Payment processed', 'Payment failed', 'Refund issued'] },
        { label: 'Promotions', items: ['Special offers', 'New agents in your area', 'Weekly digest'] },
    ];
    const channels = ['Email', 'Push', 'SMS'];
    const [prefs, setPrefs] = useState<Record<string, boolean>>({});
    const toggle = (key: string) => setPrefs(p => ({ ...p, [key]: !p[key] }));
    const key = (g: string, item: string, ch: string) => `${g}:${item}:${ch}`;

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
                                    <p className="text-sm font-medium text-neutral-700">{item}</p>
                                    <div className="flex items-center gap-5">
                                        {channels.map(ch => {
                                            const k = key(g.label, item, ch);
                                            const on = prefs[k] !== false && prefs[k] !== undefined ? true : prefs[k] === undefined;
                                            return (
                                                <div key={ch} className="flex flex-col items-center gap-1">
                                                    <span className="text-[9px] font-black text-neutral-400 uppercase">{ch}</span>
                                                    <button onClick={() => toggle(k)}
                                                        className={cn('w-9 h-5 rounded-full transition-colors relative', on ? 'bg-[#14a800]' : 'bg-neutral-300')}>
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
                <Btn onClick={() => toast.success('Notification preferences saved!')}>Save preferences</Btn>
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

const StatsTrends = ({ user }: { user: any }) => (
    <Section title="Stats & Trends" subtitle="Your activity and performance on Forafix">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Bookings" value="24" sub="All time" />
            <StatCard label="Completed" value="18" sub="Services received" color="text-blue-600" />
            <StatCard label="Profile Views" value="142" sub="Last 30 days" color="text-purple-600" />
            <StatCard label="Agents Worked With" value="7" sub="Unique professionals" color="text-amber-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <h3 className="font-black text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#14a800]" /> Booking History</h3>
                <div className="space-y-2">
                    {[
                        { service: 'AC Installation', date: 'Feb 18, 2026', status: 'Completed', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
                        { service: 'Plumbing Repair', date: 'Feb 10, 2026', status: 'Pending', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
                        { service: 'Electrical Wiring', date: 'Jan 30, 2026', status: 'Completed', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
                        { service: 'House Cleaning', date: 'Jan 20, 2026', status: 'Cancelled', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
                    ].map((b, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                            <div>
                                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{b.service}</p>
                                <p className="text-xs text-neutral-400 font-inter">{b.date}</p>
                            </div>
                            <span className={cn('text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wide', b.color)}>{b.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <h3 className="font-black text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Client Relationships</h3>
                <div className="space-y-3">
                    {[
                        { name: 'Emeka Nwosu', service: 'AC Installation', rating: 5, jobs: 3 },
                        { name: 'Fatima Abubakar', service: 'Plumbing', rating: 4, jobs: 1 },
                        { name: 'Chuka Obi', service: 'Electrical', rating: 5, jobs: 2 },
                    ].map((a, i) => (
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
                    ))}
                </div>
            </div>
        </div>
    </Section>
);

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
    return (
        <Section title="Help & Support" subtitle="Get help or share your feedback">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {[
                    { icon: Zap, title: 'App Support', desc: 'Report bugs or issues with the Forafix app.', action: 'Contact App Support', href: 'mailto:app-support@forafix.com' },
                    { icon: HelpCircle, title: 'General Support', desc: 'Questions about bookings, payments, or anything else.', action: 'Contact Support', href: 'mailto:support@forafix.com' },
                    { icon: Star, title: 'Feedback', desc: 'Love something? Want to suggest a feature? Tell us!', action: null },
                ].map((c, i) => (
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
                ))}
            </div>

            <div className="max-w-lg p-6 rounded-2xl border border-neutral-200 bg-white">
                <h3 className="font-black text-neutral-900 mb-1">Submit Feedback</h3>
                <p className="text-xs text-neutral-500 mb-4">We read every message.</p>
                <Field label="Your feedback">
                    <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} placeholder="Tell us what you think..." className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-900 outline-none focus:border-[#14a800]/50 focus:ring-2 focus:ring-[#14a800]/10 transition-all resize-none" />
                </Field>
                <Btn className="mt-4" onClick={() => { toast.success('Feedback submitted. Thank you!'); setFeedback(''); }}>Send feedback</Btn>
            </div>
        </Section>
    );
};

// ── 10. Reports ──────────────────────────────────────────────────────────────
const Reports = () => {
    const [form, setForm] = useState({ agentName: '', agentUuid: '', type: '', description: '', evidence: null as string | null });
    const handleEvidence = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        const r = new FileReader(); r.onload = ev => setForm(p => ({ ...p, evidence: ev.target?.result as string })); r.readAsDataURL(f);
    };
    const submit = () => {
        if (!form.agentName || !form.type || !form.description) { toast.error('Please fill all required fields.'); return; }
        toast.success('Report submitted. Our team will review it shortly.'); setForm({ agentName: '', agentUuid: '', type: '', description: '', evidence: null });
    };

    return (
        <Section title="Reports" subtitle="Report misconduct or issues with agents">
            <div className="p-6 mb-8 rounded-[2rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-500 font-bold leading-relaxed">All reports are reviewed confidentially. Only submit reports that are truthful and made in good faith.</p>
            </div>

            <div className="max-w-xl space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Agent Name *"><Input placeholder="Full name of the agent" value={form.agentName} onChange={e => setForm(p => ({ ...p, agentName: e.target.value }))} /></Field>
                    <Field label="Agent ID / UUID"><Input placeholder="Optional — found on their profile" value={form.agentUuid} onChange={e => setForm(p => ({ ...p, agentUuid: e.target.value }))} /></Field>
                </div>
                <Field label="Incident Type *">
                    <Select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
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
                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={5} placeholder="Describe what happened in detail. Include dates and any other relevant information." className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-900 outline-none focus:border-[#14a800]/50 focus:ring-2 focus:ring-[#14a800]/10 transition-all resize-none" />
                </Field>
                <Field label="Evidence (optional)">
                    <div onClick={() => document.getElementById('evidence-upload')?.click()} className="border-2 border-dashed border-neutral-200 rounded-xl p-5 flex items-center gap-3 cursor-pointer hover:border-[#14a800]/40 transition-colors">
                        <Upload className="w-5 h-5 text-neutral-400 shrink-0" />
                        {form.evidence ? <img src={form.evidence} className="h-14 rounded-lg object-cover" alt="Evidence" /> : <div><p className="text-sm font-bold text-neutral-600">Upload screenshot or photo</p><p className="text-xs text-neutral-400">JPG, PNG, max 10MB</p></div>}
                    </div>
                    <input id="evidence-upload" type="file" accept="image/*" className="hidden" onChange={handleEvidence} />
                </Field>
                <Btn onClick={submit} variant="danger" className="bg-red-600 text-white hover:bg-red-700 border-0"><Flag className="w-4 h-4 inline mr-1.5" />Submit Report</Btn>
            </div>
        </Section>
    );
};

// ── Sidebar items ─────────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'account', label: 'Account Info', icon: User },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'tax', label: 'Tax Information', icon: FileText },
    { id: 'identity', label: 'Identity Verification', icon: ShieldCheck },
    { id: 'security', label: 'Password & Security', icon: Lock },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'stats', label: 'Stats & Trends', icon: BarChart2 },
    { id: 'plans', label: 'Subscription Plans', icon: Star },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'reports', label: 'Reports', icon: Flag },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
const ClientSettingsPage = () => {
    const { user } = useAuthStore();
    const { isDark, toggle: toggleTheme } = useThemeStore();
    const [active, setActive] = useState('account');

    const renderSection = () => {
        switch (active) {
            case 'account': return <AccountInfo user={user} />;
            case 'billing': return <BillingPayments />;
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
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-20">
            {/* Mobile tab bar */}
            <div className="md:hidden overflow-x-auto flex border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-16 z-10">
                {SECTIONS.map(s => (
                    <button key={s.id} onClick={() => setActive(s.id)}
                        className={cn('flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs font-black whitespace-nowrap transition-colors border-b-2', active === s.id ? 'border-[#14a800] text-[#14a800]' : 'border-transparent text-neutral-500 dark:text-neutral-400')}>
                        <s.icon className="w-3.5 h-3.5" />{s.label}
                    </button>
                ))}
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

                            {SECTIONS.map(s => (
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
