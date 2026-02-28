import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Search,
    MessageSquare,
    Send,
    MoreVertical,
    Phone,
    Paperclip,
    Smile,
    CheckCheck,
    ShieldCheck,
    ChevronLeft,
    X,
    Circle,
    Image as ImageIcon,
    Download,
    ZoomIn
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useParams } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Emoji data — common emojis grouped by category
// ─────────────────────────────────────────────────────────────────────────────
const EMOJI_CATEGORIES = [
    {
        label: '😊 Smileys',
        emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','🥰','😍','😘','🤩','😏','😒','😞','😔','😟','😕','🙁','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','😈','👿','💀','☠️','🤡','👹','👺','😺','😸','😹'],
    },
    {
        label: '👋 Gestures',
        emojis: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🙏','✍️','💅','🤳'],
    },
    {
        label: '❤️ Hearts',
        emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','❤️‍🔥','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉','✡️','🔯'],
    },
    {
        label: '🎉 Celebration',
        emojis: ['🎉','🎊','🎈','🎁','🎀','🎗','🎟','🎫','🏆','🥇','🥈','🥉','🏅','🎖','🎗','🎖','🎑','🎃','🎄','🎆','🎇','🧨','✨','🎋','🎍'],
    },
    {
        label: '🐶 Animals',
        emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄'],
    },
    {
        label: '🍕 Food',
        emojis: ['🍕','🍔','🌭','🍟','🍿','🧂','🥚','🍳','🥞','🧇','🥓','🥩','🍗','🍖','🌮','🌯','🥙','🧆','🥚','🍜','🍝','🍛','🍣','🍱','🍤','🍙','🍚','🍘','🍥','🥮','🍢','🧁','🎂','🍰','🍩','🍪','🍫','🍬','🍭','🍮','🍯'],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Room {
    id: number;
    booking_id: number;
    other_user: {
        id: number;
        name: string;
        role: string;
        uuid: string;
        avatar_url?: string;
        is_vetted?: boolean;
    };
    last_message?: {
        body: string;
        created_at: string;
        sender_id: number;
    };
    unread_count: number;
    booking?: {
        status: string;
        service?: { name: string };
    };
}

interface Message {
    id: number;
    sender_id: number;
    body: string;
    image_url?: string;          // optional image attachment
    created_at: string;
    read_at?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() || '?';

const maskSensitiveInfo = (text: string) => {
    if (!text) return text;
    // Mask phone numbers (Nigerian formats + international)
    let masked = text.replace(/(\+?234|0)[789][01]\d{2}\d{2}(\d{4})/g, '•••• $2');
    // Mask emails
    masked = masked.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '••••@••••.•••');
    return masked;
};

const STATUS_COLORS: Record<string, string> = {
    ACCEPTED: 'bg-blue-50 text-blue-700',
    PENDING: 'bg-amber-50 text-amber-700',
    COMPLETED: 'bg-green-50 text-green-700',
    CANCELLED: 'bg-red-50 text-red-700',
};

// ─────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 'md', online = false }: { name: string; size?: 'sm' | 'md' | 'lg'; online?: boolean }) => {
    const sizeClass = { sm: 'w-8 h-8 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-lg' }[size];
    return (
        <div className="relative shrink-0">
            <div className={cn('rounded-full bg-[#14a800]/10 border-2 border-white shadow-sm flex items-center justify-center font-black text-[#14a800]', sizeClass)}>
                {getInitial(name)}
            </div>
            {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Emoji Picker
// ─────────────────────────────────────────────────────────────────────────────
interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const EmojiPicker = ({ onSelect, onClose }: EmojiPickerProps) => {
    const [activeCategory, setActiveCategory] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="absolute bottom-full mb-2 right-0 w-72 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-700 z-50 overflow-hidden"
        >
            {/* Category tabs */}
            <div className="flex border-b border-neutral-100 dark:border-neutral-700 overflow-x-auto no-scrollbar">
                {EMOJI_CATEGORIES.map((cat, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveCategory(i)}
                        className={cn(
                            'flex-shrink-0 px-3 py-2 text-base transition-all',
                            activeCategory === i ? 'bg-neutral-50 dark:bg-neutral-700 border-b-2 border-[#14a800]' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'
                        )}
                        title={cat.label}
                    >
                        {cat.emojis[0]}
                    </button>
                ))}
            </div>

            {/* Emoji grid */}
            <div className="p-3 h-44 overflow-y-auto">
                <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2">
                    {EMOJI_CATEGORIES[activeCategory].label}
                </p>
                <div className="grid grid-cols-8 gap-0.5">
                    {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
                        <button
                            key={i}
                            onClick={() => onSelect(emoji)}
                            className="w-8 h-8 text-lg flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox – full-screen image viewer
// ─────────────────────────────────────────────────────────────────────────────
const Lightbox = ({ src, onClose }: { src: string; onClose: () => void }) => {
    useEffect(() => {
        const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handle);
        return () => document.removeEventListener('keydown', handle);
    }, [onClose]);

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = src;
        a.download = `forafix-image-${Date.now()}.jpg`;
        a.click();
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={onClose}
        >
            {/* Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
                <button
                    onClick={handleDownload}
                    className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                    title="Download"
                >
                    <Download className="w-5 h-5" />
                </button>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                    title="Close (Esc)"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Image — click inside doesn't close */}
            <img
                src={src}
                alt="Full view"
                className="max-w-[92vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                onClick={e => e.stopPropagation()}
            />
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
const MOCK_ROOMS: Room[] = [
    {
        id: 1, booking_id: 1,
        other_user: { id: 2, name: 'Emeka Nwosu', role: 'AGENT', uuid: 'abc-123', is_vetted: true },
        last_message: { body: "I'll be there by 10am. Please have the area cleared.", created_at: new Date(Date.now() - 3600000).toISOString(), sender_id: 2 },
        unread_count: 2,
        booking: { status: 'ACCEPTED', service: { name: 'AC Installation' } }
    },
    {
        id: 2, booking_id: 2,
        other_user: { id: 3, name: 'Fatima Abubakar', role: 'AGENT', uuid: 'def-456', is_vetted: true },
        last_message: { body: "Got your message. I'll bring the parts needed.", created_at: new Date(Date.now() - 86400000).toISOString(), sender_id: 3 },
        unread_count: 0,
        booking: { status: 'PENDING', service: { name: 'Plumbing Repair' } }
    },
    {
        id: 3, booking_id: 3,
        other_user: { id: 4, name: 'Chuka Obi', role: 'AGENT', uuid: 'ghi-789' },
        last_message: { body: "Thank you for the booking! Looking forward to working with you.", created_at: new Date(Date.now() - 172800000).toISOString(), sender_id: 1 },
        unread_count: 0,
        booking: { status: 'COMPLETED', service: { name: 'Electrical Wiring' } }
    },
];

const MOCK_MESSAGES: Record<number, Message[]> = {
    1: [
        { id: 1, sender_id: 2, body: "Hello! I saw your booking for AC installation. I'm available this Saturday.", created_at: new Date(Date.now() - 7200000).toISOString() },
        { id: 2, sender_id: 1, body: "Great! Saturday works perfectly. Can you come around 10am?", created_at: new Date(Date.now() - 7000000).toISOString() },
        { id: 3, sender_id: 2, body: "Yes, 10am is perfect. Do you have the unit already or should I source it?", created_at: new Date(Date.now() - 6800000).toISOString() },
        { id: 4, sender_id: 1, body: "I already have the unit, it's a 1.5HP LG inverter.", created_at: new Date(Date.now() - 6600000).toISOString() },
        { id: 5, sender_id: 2, body: "Perfect choice! I'll bring all the mounting hardware and copper pipes.", created_at: new Date(Date.now() - 5000000).toISOString() },
        { id: 6, sender_id: 2, body: "I'll be there by 10am. Please have the area cleared.", created_at: new Date(Date.now() - 3600000).toISOString() },
    ],
    2: [
        { id: 1, sender_id: 1, body: "Hi Fatima! I have a leaking pipe under my kitchen sink.", created_at: new Date(Date.now() - 90000000).toISOString() },
        { id: 2, sender_id: 3, body: "Got your message. I'll bring the parts needed.", created_at: new Date(Date.now() - 86400000).toISOString() },
    ],
    3: [
        { id: 1, sender_id: 1, body: "Hello Chuka, please can you come rewire the master bedroom next week?", created_at: new Date(Date.now() - 190000000).toISOString() },
        { id: 2, sender_id: 4, body: "Thank you for the booking! Looking forward to working with you.", created_at: new Date(Date.now() - 172800000).toISOString() },
    ],
};

// ─────────────────────────────────────────────────────────────────────────────
// RoomList
// ─────────────────────────────────────────────────────────────────────────────
interface RoomListProps {
    rooms: Room[];
    selectedRoom: Room | null;
    search: string;
    onSearch: (v: string) => void;
    onSelect: (room: Room) => void;
    currentUserId: number;
}

const RoomList = ({ rooms, selectedRoom, search, onSearch, onSelect, currentUserId }: RoomListProps) => {
    const filtered = rooms.filter(r =>
        r.other_user.name.toLowerCase().includes(search.toLowerCase()) ||
        r.booking?.service?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800">
            <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-5">
                    <h1 className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">Messages</h1>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                        type="text"
                        placeholder="Search conversations..."
                        value={search}
                        onChange={e => onSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl text-sm font-medium placeholder-neutral-400 outline-none focus:border-[#14a800]/40 focus:bg-white dark:focus:bg-neutral-800 transition-all text-neutral-900 dark:text-neutral-100"
                    />
                    {search && (
                        <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 px-6 py-12 text-center">
                        <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center">
                            <MessageSquare className="w-7 h-7 text-neutral-300" />
                        </div>
                        <p className="text-sm font-bold text-neutral-400">
                            {search ? 'No conversations match your search' : 'No conversations yet'}
                        </p>
                    </div>
                ) : (
                    filtered.map(room => (
                        <button
                            key={room.id}
                            onClick={() => onSelect(room)}
                            className={cn(
                                'w-full text-left px-5 py-4 flex items-start gap-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border-b border-neutral-50 dark:border-neutral-800/50 relative',
                                selectedRoom?.id === room.id && 'bg-neutral-50 dark:bg-neutral-800/50 border-l-2 border-l-[#14a800]'
                            )}
                        >
                            <Avatar name={room.other_user.name} online={room.id === 1} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <span className="font-black text-sm text-neutral-900 truncate">{room.other_user.name}</span>
                                    <span className="text-[10px] font-bold text-neutral-400 whitespace-nowrap shrink-0">
                                        {room.last_message ? formatTime(room.last_message.created_at) : ''}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 mb-1">
                                    {room.booking?.service?.name && (
                                        <span className={cn('text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full', STATUS_COLORS[room.booking.status] || 'bg-neutral-100 text-neutral-500')}>
                                            {room.booking.service.name}
                                        </span>
                                    )}
                                    {room.other_user.is_vetted && <ShieldCheck className="w-3 h-3 text-[#14a800] shrink-0" />}
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs text-neutral-500 truncate font-medium">
                                        {room.last_message
                                            ? (room.last_message.sender_id === currentUserId ? 'You: ' : '') + room.last_message.body
                                            : 'No messages yet'}
                                    </p>
                                    {room.unread_count > 0 && (
                                        <span className="bg-[#14a800] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                                            {room.unread_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ChatPanel
// ─────────────────────────────────────────────────────────────────────────────
interface ChatPanelProps {
    selectedRoom: Room | null;
    messages: Message[];
    messageInput: string;
    onInputChange: (v: string) => void;
    onSend: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onBack: () => void;
    currentUserId: number;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    // Image attachment
    attachedImage: string | null;
    onAttachImage: (dataUrl: string | null) => void;
}

const ChatPanel = ({
    selectedRoom, messages, messageInput, onInputChange,
    onSend, onKeyDown, onBack, currentUserId, messagesEndRef, inputRef,
    attachedImage, onAttachImage,
}: ChatPanelProps) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleEmojiSelect = (emoji: string) => {
        onInputChange(messageInput + emoji);
        setShowEmojiPicker(false);
        requestAnimationFrame(() => inputRef.current?.focus());
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => onAttachImage(ev.target?.result as string);
        reader.readAsDataURL(file);
        // Reset so re-selecting same file triggers onChange
        e.target.value = '';
    };

    if (!selectedRoom) {
        return (
            <div className="hidden md:flex flex-col items-center justify-center h-full bg-neutral-50/50 dark:bg-neutral-900/50 gap-6">
                <div className="w-24 h-24 bg-white dark:bg-neutral-800 rounded-3xl flex items-center justify-center shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <MessageSquare className="w-12 h-12 text-neutral-200 dark:text-neutral-700" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mb-2">Welcome to Messages</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm max-w-xs">
                        Once your booking is confirmed, you'll be able to chat directly with your service professional here.
                    </p>
                </div>
                <Link
                    to="/cl/find-service"
                    className="bg-[#14a800] text-white px-8 py-3 rounded-full font-black text-sm hover:bg-[#118b00] transition-all shadow-lg shadow-green-100 active:scale-95"
                >
                    Find a Service
                </Link>
            </div>
        );
    }

    return (
        <>
        <div className="flex flex-col h-full bg-white dark:bg-neutral-900">
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors mr-1">
                        <ChevronLeft className="w-5 h-5 text-neutral-600" />
                    </button>
                    <Avatar name={selectedRoom.other_user.name} size="md" online={selectedRoom.id === 1} />
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-black text-sm text-neutral-900">{selectedRoom.other_user.name}</h2>
                            {selectedRoom.other_user.is_vetted && <ShieldCheck className="w-3.5 h-3.5 text-[#14a800]" />}
                        </div>
                        <div className="flex items-center gap-1.5">
                            {selectedRoom.id === 1 ? (
                                <>
                                    <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                                    <p className="text-[10px] text-green-600 font-bold">Online now</p>
                                </>
                            ) : (
                                <p className="text-[10px] text-neutral-400 font-bold">
                                    {selectedRoom.booking?.service?.name ? `Via ${selectedRoom.booking.service.name}` : 'Forafix Chat'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        disabled={selectedRoom.booking?.status !== 'COMPLETED' && selectedRoom.booking?.status !== 'CLOSED'}
                        title={selectedRoom.booking?.status === 'COMPLETED' || selectedRoom.booking?.status === 'CLOSED' ? "Call Agent" : "Phone calls enabled after job completion"}
                        className={cn(
                            "w-9 h-9 flex items-center justify-center rounded-full transition-colors",
                            (selectedRoom.booking?.status === 'COMPLETED' || selectedRoom.booking?.status === 'CLOSED')
                                ? "hover:bg-neutral-100 text-neutral-500" 
                                : "text-neutral-300 cursor-not-allowed opacity-50"
                        )}
                    >
                        <Phone className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Booking context banner */}
            {selectedRoom.booking && (
                <div className={cn('mx-4 mt-3 px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold shrink-0', STATUS_COLORS[selectedRoom.booking.status] || 'bg-neutral-50 text-neutral-600')}>
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Booking: <strong>{selectedRoom.booking.service?.name}</strong> — Status: <strong>{selectedRoom.booking.status}</strong></span>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
                {/* Safety Prompt */}
                <div className="flex justify-center my-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-900/30 px-4 py-2.5 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 leading-tight">
                            Keep all communication here for your safety and our quality guarantee.
                        </p>
                    </div>
                </div>

                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-neutral-400 font-medium">No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isOwn = msg.sender_id === currentUserId;
                        const prevMsg = messages[i - 1];
                        const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                        return (
                            <div key={msg.id} className={cn('flex items-end gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}>
                                {!isOwn && showAvatar && <Avatar name={selectedRoom.other_user.name} size="sm" />}
                                {!isOwn && !showAvatar && <div className="w-8" />}
                                <div className={cn('max-w-[75%] sm:max-w-[65%] flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
                                    {/* Image attachment */}
                                    {msg.image_url && (
                                        <div
                                            className={cn('rounded-2xl overflow-hidden shadow-sm cursor-zoom-in relative group', isOwn ? 'rounded-br-sm' : 'rounded-bl-sm')}
                                            onClick={() => setViewingImage(msg.image_url!)}
                                        >
                                            <img
                                                src={msg.image_url}
                                                alt="attachment"
                                                className="max-w-[220px] max-h-[220px] object-cover block"
                                            />
                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ZoomIn className="w-6 h-6 text-white drop-shadow" />
                                            </div>
                                        </div>
                                    )}
                                    {/* Text body */}
                                    {msg.body && (
                                        <div className={cn(
                                            'px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm',
                                            isOwn ? 'bg-[#14a800] text-white rounded-br-sm' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-sm'
                                        )}>
                                            {maskSensitiveInfo(msg.body)}
                                        </div>
                                    )}
                                    <span className="text-[10px] text-neutral-400 font-medium px-1 flex items-center gap-1">
                                        {formatTime(msg.created_at)}
                                        {isOwn && <CheckCheck className="w-3 h-3 text-[#14a800]" />}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Image preview strip */}
            {attachedImage && (
                <div className="px-4 sm:px-6 pt-3 shrink-0">
                    <div className="relative inline-block">
                        <img src={attachedImage} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm" />
                        <button
                            onClick={() => onAttachImage(null)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-900 dark:bg-neutral-700 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* Input area */}
            <div className="px-4 sm:px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 shrink-0">
                <div className="relative flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-2.5 focus-within:border-[#14a800]/40 focus-within:bg-white dark:focus-within:bg-neutral-800 transition-all">
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {/* Attach button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-neutral-400 hover:text-[#14a800] transition-colors shrink-0"
                        title="Attach image"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={e => onInputChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        className="flex-1 bg-transparent outline-none text-sm font-medium placeholder-neutral-400 text-neutral-900 dark:text-neutral-100"
                    />

                    {/* Emoji button + picker */}
                    <div className="relative shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(o => !o)}
                            className={cn('transition-colors', showEmojiPicker ? 'text-[#14a800]' : 'text-neutral-400 hover:text-[#14a800]')}
                            title="Emoji"
                        >
                            <Smile className="w-5 h-5" />
                        </button>
                        {showEmojiPicker && (
                            <EmojiPicker
                                onSelect={handleEmojiSelect}
                                onClose={() => setShowEmojiPicker(false)}
                            />
                        )}
                    </div>

                    {/* Send button */}
                    <button
                        onClick={onSend}
                        disabled={!messageInput.trim() && !attachedImage}
                        className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0',
                            (messageInput.trim() || attachedImage)
                                ? 'bg-[#14a800] text-white hover:bg-[#118b00] shadow-md shadow-green-200 active:scale-95'
                                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                        )}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium text-center mt-2">
                    Messages are end-to-end secured by Forafix
                </p>
            </div>
        </div>

        {/* Image lightbox */}
        {viewingImage && <Lightbox src={viewingImage} onClose={() => setViewingImage(null)} />}
        </>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MessagesPage
// ─────────────────────────────────────────────────────────────────────────────
const MessagesPage = () => {
    const { user } = useAuthStore();
    const { agentUuid } = useParams<{ agentUuid?: string }>();

    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [search, setSearch] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
    const [showMobileChat, setShowMobileChat] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentUserId = user?.id || 1;

    // Auto-select room when arriving via deep-link
    useEffect(() => {
        if (!agentUuid) return;

        const existing = rooms.find(r => r.other_user.uuid === agentUuid);
        if (existing) {
            setSelectedRoom(existing);
            setShowMobileChat(true);
            return;
        }

        axios.get(`/agents/${agentUuid}`)
            .then(res => {
                const agent = res.data;
                const placeholder: Room = {
                    id: Date.now(),
                    booking_id: 0,
                    other_user: {
                        id: agent.id,
                        name: agent.name,
                        role: agent.role,
                        uuid: agent.uuid,
                        avatar_url: agent.avatar_url,
                        is_vetted: agent.is_vetted,
                    },
                    unread_count: 0,
                    booking: undefined,
                };
                setRooms(prev => {
                    if (prev.some(r => r.other_user.uuid === agentUuid)) return prev;
                    return [placeholder, ...prev];
                });
                setSelectedRoom(placeholder);
                setShowMobileChat(true);
            })
            .catch(() => { /* agent not found */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agentUuid]);

    // Load messages when room changes
    useEffect(() => {
        if (selectedRoom) {
            setMessages(MOCK_MESSAGES[selectedRoom.id] || []);
            setRooms(prev => prev.map(r => r.id === selectedRoom.id ? { ...r, unread_count: 0 } : r));
        }
    }, [selectedRoom]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = useCallback(() => {
        if (!messageInput.trim() && !attachedImage) return;
        if (!selectedRoom) return;

        const newMsg: Message = {
            id: Date.now(),
            sender_id: currentUserId,
            body: messageInput.trim(),
            image_url: attachedImage ?? undefined,
            created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, newMsg]);
        setRooms(prev => prev.map(r =>
            r.id === selectedRoom.id
                ? { ...r, last_message: { body: newMsg.body || '📷 Image', created_at: newMsg.created_at, sender_id: newMsg.sender_id } }
                : r
        ));
        setMessageInput('');
        setAttachedImage(null);
        requestAnimationFrame(() => inputRef.current?.focus());
    }, [messageInput, attachedImage, selectedRoom, currentUserId]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    const selectRoom = useCallback((room: Room) => {
        setSelectedRoom(room);
        setShowMobileChat(true);
    }, []);

    return (
        <div className="h-[calc(100vh-5rem)] flex overflow-hidden bg-white dark:bg-neutral-950">
            <div className={cn('w-full md:w-80 lg:w-96 shrink-0 flex flex-col overflow-hidden', showMobileChat ? 'hidden md:flex' : 'flex')}>
                <RoomList
                    rooms={rooms}
                    selectedRoom={selectedRoom}
                    search={search}
                    onSearch={setSearch}
                    onSelect={selectRoom}
                    currentUserId={currentUserId}
                />
            </div>
            <div className={cn('flex-1 flex flex-col overflow-hidden', !showMobileChat ? 'hidden md:flex' : 'flex')}>
                <ChatPanel
                    selectedRoom={selectedRoom}
                    messages={messages}
                    messageInput={messageInput}
                    onInputChange={setMessageInput}
                    onSend={handleSend}
                    onKeyDown={handleKeyDown}
                    onBack={() => setShowMobileChat(false)}
                    currentUserId={currentUserId}
                    messagesEndRef={messagesEndRef}
                    inputRef={inputRef}
                    attachedImage={attachedImage}
                    onAttachImage={setAttachedImage}
                />
            </div>
        </div>
    );
};

export default MessagesPage;
