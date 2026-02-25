import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
    Star, Shield, MapPin, Briefcase, Calendar, Clock, CheckCircle2, 
    MessageSquare, ShieldCheck, Mail, Phone, ExternalLink, Camera, 
    AlertCircle, Loader2, User as UserIcon, Settings, X, ChevronRight, 
    LayoutGrid, Share2, Info, ChevronLeft, Zap, FileText, Save, 
    MessageCircle, Verified 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';
import Avatar from '../components/Avatar';
import CameraCaptureModal from '../components/CameraCaptureModal';

const ClientProfileViewPage = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const { user: currentUser, updateProfile, updateAgentProfile, uploadAvatar } = useAuthStore();

    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Edit form state — seeded from currentUser when editing own profile
    const [name, setName] = useState(currentUser?.name || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [bio, setBio] = useState(currentUser?.agent_profile?.bio || '');
    const [location, setLocation] = useState(currentUser?.agent_profile?.location_base || '');
    const [skillsString, setSkillsString] = useState(
        currentUser?.agent_profile?.skills?.join(', ') || ''
    );
    const [phone, setPhone] = useState(currentUser?.phone || '');
    const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar_url || '');

    // Sync state when currentUser is loaded/updated
    React.useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            setEmail(currentUser.email || '');
            setBio(currentUser.agent_profile?.bio || '');
            setLocation(currentUser.agent_profile?.location_base || '');
            setSkillsString(currentUser.agent_profile?.skills?.join(', ') || '');
            setPhone(currentUser.phone || '');
            setAvatarPreview(currentUser.avatar_url || currentUser.avatar || '');
        }
    }, [currentUser]);

    const { data: profile, isLoading, isError, refetch } = useQuery({
        queryKey: ['user-profile', uuid],
        queryFn: async () => {
            try {
                const response = await axios.get(`/users/${uuid}`);
                return response.data;
            } catch {
                const response = await axios.get(`/agents/${uuid}`);
                return response.data;
            }
        },
        enabled: !!uuid && uuid !== 'undefined',
        retry: 1,
        staleTime: 30000,
    });

    const isOwnProfile = currentUser?.uuid === uuid;
    const isAgent = (isOwnProfile ? currentUser?.role : profile?.role) === 'AGENT';


    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        handlePhotoUpload(file);
    };

    const handlePhotoUpload = async (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
        setIsUploadingAvatar(true);
        try {
            await uploadAvatar(file);
            setMessage({ type: 'success', text: 'Profile photo updated!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to upload photo.' });
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleVerificationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingDoc(true);
        const formData = new FormData();
        formData.append('document', file);
        try {
            await axios.post('/upload/verification', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ type: 'success', text: 'ID document uploaded! Pending review.' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to upload document.' });
        } finally {
            setIsUploadingDoc(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            await updateProfile({ name, email, phone });
            if (isAgent) {
                const skills = skillsString.split(',').map(s => s.trim()).filter(Boolean);
                await updateAgentProfile({ bio, location_base: location, skills });
            }
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            refetch();
        } catch {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Loading / Error ───────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-[#14a800]" />
                <p className="text-neutral-400 font-black uppercase tracking-widest text-xs">Loading profile...</p>
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="w-24 h-24 bg-neutral-100 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                    <UserIcon className="w-12 h-12 text-neutral-300" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-neutral-900 mb-2">Profile not found</h2>
                    <p className="text-neutral-500 font-medium text-sm max-w-xs mx-auto">
                        This profile may have been removed or is unavailable.
                    </p>
                </div>
                <Link
                    to="/cl/find-service"
                    className="flex items-center gap-2 bg-neutral-900 text-white px-8 py-4 rounded-full font-black text-sm hover:bg-black transition-all shadow-xl active:scale-95"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </div>
        );
    }

    // ─── Display data: prefer live currentUser for own profile ─────────────
    const displayName    = isOwnProfile ? (currentUser?.name   ?? profile.name)   : profile.name;
    const displayAvatar  = isOwnProfile 
        ? (currentUser?.avatar_url ?? currentUser?.avatar ?? profile.avatar_url ?? profile.avatar)
        : (profile.avatar_url ?? profile.avatar);
    const agentProfile   = isOwnProfile ? currentUser?.agent_profile : profile.agent_profile;

    // ─── EDIT PANEL (own profile only) ────────────────────────────────────


    // ─── MAIN RENDER ──────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
            <main className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Profile Header Card */}
                <section className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden mb-6">
                    {/* Banner */}
                    <div className="h-32 bg-gradient-to-br from-[#0a6600] via-[#14a800] to-[#1ed100] relative">
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                        />
                    </div>

                    <div className="px-6 sm:px-8 pb-8">
                        {/* Avatar row */}
                        <div className="flex items-end justify-between -mt-14 mb-5">
                            <div className="relative">
                                <div className="w-28 h-28 rounded-[2rem] bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                                    <Avatar 
                                        src={displayAvatar} 
                                        name={displayName} 
                                        sizeClassName="w-full h-full"
                                        className="rounded-none"
                                    />
                                </div>
                                {profile.is_vetted && (
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#14a800] rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                        <ShieldCheck className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3 mb-2">
                                {!isOwnProfile && (
                                    <Link
                                        to="/cl/messages/rooms/"
                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#14a800] text-white rounded-full text-sm font-black hover:bg-[#118b00] transition-all shadow-md shadow-green-200 active:scale-95"
                                    >
                                        <MessageCircle className="w-4 h-4" /> Message
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Name & badges */}
                        <div className="flex items-start gap-3 flex-wrap mb-3">
                            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">{displayName}</h1>
                            {profile.is_vetted && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#14a800]/10 text-[#14a800] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#14a800]/20 mt-1.5">
                                    <Verified className="w-3.5 h-3.5" /> Forafix Vetted
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            {/* Primary Badges */}
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    'px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm',
                                    isAgent ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                                )}>
                                    {isAgent ? '⚡ Service Professional' : '👤 Client Member'}
                                </span>
                                {!isAgent && (
                                    <span className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        Forafix Member
                                    </span>
                                )}
                            </div>

                            {/* Secondary Details */}
                            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                                {!isAgent && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Status</span>
                                            <span className="text-xs font-black text-neutral-700 dark:text-neutral-300">Premium User • Abuja</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-neutral-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Joined</span>
                                        <span className="text-xs font-black text-neutral-700 dark:text-neutral-300">
                                            {new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Basic Information (Permanent for owner) ── */}
                {isOwnProfile && (
                    <div className="mb-6">
                        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-300">
                            {message && (
                                <div className={cn(
                                    'p-4 rounded-2xl flex items-center gap-3 font-bold text-sm',
                                    message.type === 'success'
                                        ? 'bg-green-50 text-green-700 border border-green-100'
                                        : 'bg-red-50 text-red-700 border border-red-100'
                                )}>
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    {message.text}
                                </div>
                            )}

                            {/* Avatar upload */}
                            <section className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm flex items-center gap-6">
                                <div className="relative group shrink-0">
                                    <div className="w-20 h-20 rounded-2xl bg-neutral-100 overflow-hidden border-2 border-neutral-50 shadow-sm flex items-center justify-center relative">
                                        <Avatar 
                                            src={avatarPreview} 
                                            name={name} 
                                            sizeClassName="w-full h-full"
                                            className="rounded-2xl"
                                        />
                                        {isUploadingAvatar && (
                                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-[#14a800]" />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#14a800] rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-[#118b00] transition-all shadow-md">
                                        <Camera className="w-4 h-4" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
                                    </label>
                                </div>
                                <div>
                                    <p className="font-black text-neutral-900 text-sm">Profile Photo</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <p className="text-xs text-neutral-400">Click icon to upload or</p>
                                        <button 
                                            type="button"
                                            onClick={() => setIsCameraModalOpen(true)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                        >
                                            <Camera className="w-3 h-3" /> Snap Photo
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Basic Info */}
                            <section className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm space-y-4">
                                <h3 className="font-black text-neutral-900 text-sm uppercase tracking-widest">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">User ID</label>
                                        <input
                                            type="text" value={currentUser?.uuid || ''} disabled
                                            className="w-full px-4 py-3 border-2 border-neutral-100 rounded-2xl bg-neutral-50 text-neutral-400 font-bold text-sm outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Role</label>
                                        <input
                                            type="text" value={currentUser?.role || ''} disabled
                                            className="w-full px-4 py-3 border-2 border-neutral-100 rounded-2xl bg-neutral-50 text-neutral-400 font-bold text-sm outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Full Name</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="text" value={name} onChange={e => setName(e.target.value)} required
                                                className="w-full pl-10 pr-4 py-3 border-2 border-neutral-100 rounded-2xl focus:border-[#14a800]/50 outline-none font-bold text-sm transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="email" value={email} onChange={e => setEmail(e.target.value)} disabled
                                                className="w-full pl-10 pr-4 py-3 border-2 border-neutral-100 rounded-2xl focus:border-[#14a800]/50 outline-none font-bold text-sm transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Phone Number (11 Digits)</label>
                                        <div className="relative">
                                            <Zap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="tel" 
                                                value={phone} 
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, ''); // Numeric only
                                                    if (val.length <= 11) {
                                                        setPhone(val);
                                                    }
                                                }}
                                                placeholder="080 0000 0000"
                                                className="w-full pl-10 pr-4 py-3 border-2 border-neutral-100 rounded-2xl focus:border-[#14a800]/50 outline-none font-bold text-sm transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Agent-specific fields */}
                            {isAgent && (
                                <>
                                    <section className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm space-y-4">
                                        <h3 className="font-black text-neutral-900 text-sm uppercase tracking-widest">Professional Info</h3>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Bio / About Me</label>
                                            <textarea
                                                rows={3} value={bio} onChange={e => setBio(e.target.value)}
                                                placeholder="Describe your experience..."
                                                className="w-full px-4 py-3 border-2 border-neutral-100 rounded-2xl focus:border-[#14a800]/50 outline-none font-bold text-sm transition-all resize-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Base Location</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                    <input
                                                        type="text" value={location} onChange={e => setLocation(e.target.value)}
                                                        placeholder="e.g. Asokoro, Abuja"
                                                        className="w-full pl-10 pr-4 py-3 border-2 border-neutral-100 rounded-2xl focus:border-[#14a800]/50 outline-none font-bold text-sm transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Skills (comma-separated)</label>
                                                <div className="relative">
                                                    <Zap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                    <input
                                                        type="text" value={skillsString} onChange={e => setSkillsString(e.target.value)}
                                                        placeholder="e.g. AC Repair, Electrical"
                                                        className="w-full pl-10 pr-4 py-3 border-2 border-neutral-100 rounded-2xl focus:border-[#14a800]/50 outline-none font-bold text-sm transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* ID Verification */}
                                    {!profile.is_vetted && (
                                        <section className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm space-y-4">
                                            <h3 className="font-black text-neutral-900 text-sm uppercase tracking-widest">Identity Verification</h3>
                                            <p className="text-sm text-neutral-500 leading-relaxed">
                                                Upload your National ID, Voter's Card, or Passport to earn the <span className="text-[#14a800] font-black">Verified Pro</span> badge.
                                            </p>
                                            <label className={cn(
                                                'block border-2 border-dashed border-neutral-200 rounded-2xl p-6 hover:border-[#14a800] hover:bg-green-50/30 transition-all cursor-pointer text-center',
                                                isUploadingDoc && 'opacity-50 pointer-events-none'
                                            )}>
                                                {isUploadingDoc ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="w-6 h-6 animate-spin text-[#14a800]" />
                                                        <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">Uploading...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                                                            <FileText className="w-5 h-5 text-neutral-400" />
                                                        </div>
                                                        <span className="text-sm font-black text-neutral-900">Choose Document (PDF or Image)</span>
                                                        <span className="text-xs text-neutral-400">Max 5MB</span>
                                                    </div>
                                                )}
                                                <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleVerificationUpload} disabled={isUploadingDoc} />
                                            </label>
                                        </section>
                                    )}
                                </>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-8 py-3 bg-[#14a800] text-white rounded-2xl font-black text-sm hover:bg-[#118b00] transition-all shadow-lg shadow-green-200 active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isSaving ? 'Saving...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── View mode content (Other Sections) ── */}
                {isAgent && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {[
                                { icon: Star, label: 'Rating', value: '4.9', sub: '50+ Reviews' },
                                { icon: Briefcase, label: 'Jobs Done', value: '120+', sub: 'Completed' },
                                { icon: ShieldCheck, label: 'Response', value: '< 1hr', sub: 'Super Fast' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5 text-center shadow-sm">
                                    <stat.icon className="w-5 h-5 text-[#14a800] mx-auto mb-2" />
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-xl font-black text-neutral-900">{stat.value}</p>
                                    <p className="text-xs font-bold text-neutral-500">{stat.sub}</p>
                                </div>
                            ))}
                        </div>

                        {!isOwnProfile && agentProfile?.bio && (
                            <section className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm mb-6">
                                <h2 className="text-base font-black text-neutral-900 uppercase tracking-widest mb-4">About</h2>
                                <p className="text-neutral-600 leading-relaxed font-medium italic">"{agentProfile.bio}"</p>
                            </section>
                        )}

                        {!isOwnProfile && agentProfile?.skills && (
                            <section className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm mb-6">
                                <h2 className="text-base font-black text-neutral-900 uppercase tracking-widest mb-5">Skills & Expertise</h2>
                                <div className="flex flex-wrap gap-2">
                                    {(Array.isArray(agentProfile.skills)
                                        ? agentProfile.skills
                                        : agentProfile.skills.split(',')
                                    ).map((skill: string, i: number) => (
                                        <span key={i} className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-sm">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {profile.services && profile.services.length > 0 && (
                            <section className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm">
                                <h2 className="text-base font-black text-neutral-900 uppercase tracking-widest mb-6">Services Offered</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {profile.services.map((svc: any) => (
                                        <div key={svc.id} className="p-5 rounded-2xl border-2 border-neutral-100 hover:border-[#14a800]/30 transition-all">
                                            <h3 className="font-black text-neutral-900 mb-1">{svc.name}</h3>
                                            <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{svc.description}</p>
                                            <p className="text-[#14a800] font-black text-sm">From ₦{Number(svc.base_price).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}

            </main>

            <CameraCaptureModal 
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
                onCapture={handlePhotoUpload}
            />
        </div>
    );
};

export default ClientProfileViewPage;
