import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useHeaderStore } from '../store/useHeaderStore';
import { 
    User as UserIcon, 
    Mail, 
    MapPin, 
    Save, 
    CheckCircle2, 
    ArrowLeft,
    ShieldCheck,
    Briefcase,
    Zap,
    Camera,
    FileText,
    Loader2,
    Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import axios from 'axios';

const ProfilePage = () => {
    const { user, updateProfile, updateAgentProfile, uploadAvatar } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [bio, setBio] = useState(user?.agent_profile?.bio || '');
    const [location, setLocation] = useState(user?.agent_profile?.location_base || '');
    const [skillsString, setSkillsString] = useState(user?.agent_profile?.skills?.join(', ') || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '');

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);

        setIsUploadingAvatar(true);
        try {
            await uploadAvatar(file);
            setMessage({ type: 'success', text: 'Profile photo updated!' });
        } catch (error) {
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
            setMessage({ type: 'success', text: 'ID verification document uploaded! Pending review.' });
        } catch (error) {
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
            // Update general profile
            await updateProfile({ name, email, phone });

            // Update agent profile if applicable
            if (user?.role === 'AGENT') {
                const skills = skillsString.split(',').map(s => s.trim()).filter(s => s.length > 0);
                await updateAgentProfile({ 
                    bio, 
                    location_base: location,
                    skills 
                });
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const { setExtraActions } = useHeaderStore();

    React.useEffect(() => {
        setExtraActions(
            <div className="flex items-center gap-6">
                <Link to="/cl/find-service" className="flex items-center gap-2 text-neutral-600 hover:text-brand-600 font-bold text-sm transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <div className="h-6 w-px bg-neutral-200" />
                <div className="text-sm font-black text-neutral-900 uppercase tracking-widest">Edit Profile</div>
            </div>
        );
        return () => setExtraActions(null);
    }, [setExtraActions]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20 transition-colors">
            <main className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {message && (
                    <div className={cn(
                        "mb-8 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm animate-in zoom-in duration-300",
                        message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                    )}>
                        <CheckCircle2 className="w-5 h-5" />
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Avatar Section */}
                    <section className="flex flex-col items-center justify-center p-8 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden relative">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-neutral-100 dark:bg-neutral-800 overflow-hidden border-4 border-neutral-50 dark:border-neutral-800 shadow-inner flex items-center justify-center">
                                {avatarPreview ? (
                                    <img src={avatarPreview} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-12 h-12 text-neutral-300" />
                                )}
                                {isUploadingAvatar && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white cursor-pointer hover:bg-brand-700 transition-all shadow-lg hover:scale-110 active:scale-95 group-hover:shadow-brand-600/40">
                                <Camera className="w-5 h-5" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
                            </label>
                        </div>
                        <div className="mt-4 text-center">
                            <h3 className="font-black text-neutral-900 dark:text-neutral-100 font-inter tracking-tight">Profile Photo</h3>
                            <p className="text-xs text-neutral-500 font-inter mt-1 italic">Click the camera to upload a clear photo</p>
                        </div>
                    </section>

                    {/* Basic Info */}
                    <section className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-brand-600" />
                            </div>
                            <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-100 font-inter tracking-tight">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest px-1">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/50 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all dark:text-neutral-100"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest px-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/50 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all dark:text-neutral-100"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest px-1">Phone Number</label>
                                <div className="relative">
                                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                    <input 
                                        type="tel" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+234 000 000 0000"
                                        className="w-full pl-12 pr-4 py-4 border-2 border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/50 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all dark:text-neutral-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Agent Specific Info */}
                    {user.role === 'AGENT' && (
                        <>
                            <section className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm animate-in fade-in duration-500">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
                                        <Briefcase className="w-5 h-5 text-brand-600" />
                                    </div>
                                    <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-100 font-inter tracking-tight">Professional Profile</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-neutral-400 uppercase tracking-widest px-1">Bio / About Me</label>
                                        <textarea 
                                            rows={4}
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Describe your experience and specialties..."
                                            className="w-full px-5 py-4 border-2 border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/50 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all resize-none dark:text-neutral-100"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-neutral-400 uppercase tracking-widest px-1">Base Location</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                                <input 
                                                    type="text" 
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    placeholder="e.g. Asokoro, Abuja"
                                                    className="w-full pl-12 pr-4 py-4 border-2 border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/50 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all dark:text-neutral-100"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-neutral-400 uppercase tracking-widest px-1">Skills (Comma separated)</label>
                                            <div className="relative">
                                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                                <input 
                                                    type="text" 
                                                    value={skillsString}
                                                    onChange={(e) => setSkillsString(e.target.value)}
                                                    placeholder="e.g. AC Repair, Electrical, Plumbing"
                                                    className="w-full pl-12 pr-4 py-4 border-2 border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/50 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all dark:text-neutral-100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Identity Verification */}
                            <section className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm animate-in fade-in duration-500 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50/50 dark:bg-brand-900/10 rounded-bl-full -z-0 pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-brand-600" />
                                        </div>
                                        <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-100 font-inter tracking-tight">Identity Verification</h2>
                                    </div>

                                    {user.is_vetted ? (
                                        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-2xl">
                                            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shrink-0">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-green-800 text-sm">Account Verified</h4>
                                                <p className="text-xs text-green-700 opacity-80">You have full access to all marketplace features.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <p className="text-sm text-neutral-500 font-inter leading-relaxed">
                                                Upload your National ID (NIN), Voter's Card, or Passport. This is required to get the <span className="text-brand-600 font-black">Verified Pro</span> badge.
                                            </p>
                                            
                                            <label className={cn(
                                                "block border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all cursor-pointer text-center",
                                                isUploadingDoc && "opacity-50 pointer-events-none"
                                            )}>
                                                {isUploadingDoc ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                                                        <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">Uploading Document...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-neutral-400">
                                                            <FileText className="w-6 h-6" />
                                                        </div>
                                                        <span className="text-sm font-black text-neutral-900 dark:text-neutral-100 font-inter">Choose Document (PDF or Image)</span>
                                                        <span className="text-xs text-neutral-400">Max size: 5MB</span>
                                                    </div>
                                                )}
                                                <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleVerificationUpload} disabled={isUploadingDoc} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </>
                    )}

                    <div className="flex justify-end">
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="bg-brand-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/20 active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:scale-100"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save className="w-6 h-6" />
                                    Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ProfilePage;
