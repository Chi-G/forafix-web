import React, { useState, useEffect } from 'react';
import { 
    X, 
    Calendar as CalendarIcon, 
    Clock, 
    MapPin, 
    ChevronRight, 
    ChevronLeft, 
    CheckCircle2,
    ArrowRight,
    ShieldCheck,
    Info,
    LayoutGrid,
    FileText
} from 'lucide-react';
import { cn, formatNaira } from '../lib/utils';
import { useBookingStore } from '../store/useBookingStore';
import { toast } from 'react-hot-toast';

interface BookingModalProps {
    agent: any;
    isOpen: boolean;
    onClose: () => void;
}

const BookingModal = ({ agent, isOpen, onClose }: BookingModalProps) => {
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [subCategory, setSubCategory] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [address, setAddress] = useState('');
    const [district, setDistrict] = useState('');
    const [notes, setNotes] = useState('');
    
    const { createBooking, initializePayment, isLoading } = useBookingStore();

    useEffect(() => {
        if (isOpen && agent?.services?.length > 0) {
            setSelectedService(agent.services[0]);
            setStep(1); // Reset to step 1 when opening
        }
    }, [isOpen, agent]);

    if (!isOpen || !agent) return null;

    const abuiaDistricts = ['Maitama', 'Asokoro', 'Wuse 2', 'Garki 1', 'Garki 2', 'Jabi', 'Utako', 'Guzape', 'Lugbe', 'Kubwa', 'Gwarinpa', 'Apo'];
    
    // Mock subcategories based on agent's services or main category
    const subCategories = agent.services?.[0]?.category === 'CLEANING' 
        ? ['Regular Deep Clean', 'Move-in/Move-out', 'Post-Construction', 'Window Specialized']
        : ['Full AC Service', 'Leak Detection', 'Emergency Repair', 'Routine Maintenance'];

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        try {
            // Convert 12h time (e.g. "01:00 PM") to 24h format (e.g. "13:00")
            const [timeVal, modifier] = time.split(' ');
            let [hours, minutes] = timeVal.split(':');
            let h = parseInt(hours, 10);
            if (modifier === 'PM' && h < 12) h += 12;
            if (modifier === 'AM' && h === 12) h = 0;
            const time24 = `${h.toString().padStart(2, '0')}:${minutes}:00`;

            const bookingData = {
                agent_id: agent.id,
                service_id: selectedService?.id,
                scheduled_at: `${date} ${time24}`,
                address: `${address}, ${district}, Abuja`,
                notes: `${jobDescription}\n\nNotes: ${notes}`,
                total_price: selectedService?.base_price || 0
            };
            
            const booking = await createBooking(bookingData);
            
            // Initialize payment
            toast.loading('Redirecting to payment...');
            const paymentResponse = await initializePayment(booking.id);
            
            if (paymentResponse.data?.authorization_url) {
                window.location.href = paymentResponse.data.authorization_url;
            } else {
                throw new Error('Payment initialization failed. Please contact support.');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
            toast.error(errorMsg);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose} />
            
            {/* Side Drawer */}
            <div className="bg-white dark:bg-neutral-900 w-full lg:w-1/2 h-full shadow-[-20px_0_50px_rgba(0,0,0,0.2)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.5)] relative z-[110] flex flex-col animate-in slide-in-from-right duration-700">
                {/* Header */}
                <div className="px-12 py-10 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900 sticky top-0 z-20">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#14a800]/5 dark:bg-[#14a800]/10 rounded-[2rem] flex items-center justify-center text-2xl font-black text-[#14a800] border-2 border-white dark:border-neutral-800 shadow-xl ring-4 ring-neutral-50/50 dark:ring-neutral-800/50">
                            {agent.name?.[0]}
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14a800] mb-1 block">Booking Session</span>
                            <h3 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">Hire {agent.name}</h3>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-12 h-12 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl transition-all text-neutral-400 dark:text-neutral-500 hover:rotate-90 duration-300"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 flex">
                    {[1, 2, 3, 4].map(i => (
                        <div 
                            key={i} 
                            className={cn(
                                "h-full transition-all duration-700 flex-1",
                                i <= step ? "bg-[#14a800]" : "bg-transparent"
                            )} 
                        />
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden p-12 space-y-12">
                    {/* Step 1: Service & Description */}
                    {step === 1 && (
                        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 space-y-10">
                            <div>
                                <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
                                    <LayoutGrid className="w-5 h-5 text-[#14a800]" /> Select Service Detail
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {agent.services?.map((svc: any) => (
                                        <button
                                            key={svc.id}
                                            onClick={() => setSelectedService(svc)}
                                            className={cn(
                                                "p-6 rounded-3xl border-2 text-left transition-all relative group",
                                                selectedService?.id === svc.id 
                                                    ? "border-[#14a800] bg-[#14a800]/5 dark:bg-[#14a800]/10 ring-4 ring-[#14a800]/10" 
                                                    : "border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 bg-white dark:bg-neutral-800/50"
                                            )}
                                        >
                                            <p className="font-black text-neutral-900 dark:text-neutral-100 mb-1">{svc.name}</p>
                                            <p className="text-xs font-bold text-[#14a800]">From {formatNaira(svc.base_price)}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedService && (
                                <div>
                                    <h5 className="text-sm font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">Sub-categories (Specialization)</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {subCategories.map(sub => (
                                            <button
                                                key={sub}
                                                onClick={() => setSubCategory(sub)}
                                                className={cn(
                                                    "px-6 py-3 rounded-2xl text-xs font-bold transition-all border-2",
                                                    subCategory === sub 
                                                        ? "bg-[#14a800] border-[#14a800] text-white shadow-lg shadow-[#14a800]/20" 
                                                        : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-200 dark:hover:border-neutral-600"
                                                )}
                                            >
                                                {sub}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#14a800]" /> Job Description
                                </h4>
                                <textarea 
                                    rows={5}
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Describe specifically what you need the professional to do..."
                                    className="w-full px-8 py-6 bg-neutral-50 dark:bg-neutral-800/50 border-2 border-neutral-100 dark:border-neutral-700 rounded-[2.5rem] font-medium text-neutral-900 dark:text-neutral-100 focus:border-[#14a800] focus:bg-white dark:focus:bg-neutral-800 outline-none transition-all resize-none shadow-inner"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Schedule */}
                    {step === 2 && (
                        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 space-y-10">
                            <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-[#14a800]" /> Choose Schedule
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Preferred Date</label>
                                    <input 
                                        type="date" 
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-8 py-5 bg-neutral-50 dark:bg-neutral-800/50 border-2 border-neutral-100 dark:border-neutral-700 rounded-3xl font-black text-neutral-900 dark:text-neutral-100 focus:border-[#14a800] outline-none transition-all cursor-pointer"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Available Slots</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', '07:00 PM', '09:00 PM', '11:00 PM'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setTime(t)}
                                                className={cn(
                                                    "py-4 rounded-2xl border-2 font-black transition-all text-sm",
                                                    time === t ? "bg-[#14a800] border-[#14a800] text-white shadow-lg shadow-[#14a800]/20" : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-200 dark:hover:border-neutral-600"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Location */}
                    {step === 3 && (
                        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 space-y-10">
                            <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#14a800]" /> Service Location
                            </h4>
                            <div className="space-y-8">
                                <div>
                                    <label className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-4">Abuja District</label>
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                        {abuiaDistricts.map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setDistrict(d)}
                                                className={cn(
                                                    "py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all",
                                                    district === d ? "bg-neutral-900 dark:bg-neutral-700 border-neutral-900 dark:border-neutral-600 text-white" : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500"
                                                )}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Street Address / Apartment Number</label>
                                    <input 
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="e.g. No 15, Adetokunbo Ademola Cres..."
                                        className="w-full px-8 py-5 bg-neutral-50 dark:bg-neutral-800/50 border-2 border-neutral-100 dark:border-neutral-700 rounded-[2rem] font-bold text-neutral-900 dark:text-neutral-100 focus:border-[#14a800] outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Summary */}
                    {step === 4 && (
                        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 space-y-8">
                            <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 underline decoration-[#14a800] decoration-4 underline-offset-8">Order Summary</h4>
                            
                            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-[3rem] p-10 space-y-8 border-2 border-neutral-100 dark:border-neutral-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-2">Selected Professional</p>
                                        <h5 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{agent.name}</h5>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-2">Professional Fee</p>
                                        <h5 className="text-3xl font-black text-[#14a800]">{formatNaira(selectedService?.base_price)}</h5>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10 py-8 border-y border-neutral-200 dark:border-neutral-700">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                                            <CalendarIcon className="w-4 h-4 text-[#14a800]" />
                                            <span className="font-bold text-sm">{date} @ {time}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                                            <MapPin className="w-4 h-4 text-[#14a800]" />
                                            <span className="font-bold text-sm">{district}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Service Area</p>
                                        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{selectedService?.name} • {subCategory || 'General'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Additional Notes for {agent.name.split(' ')[0]}</label>
                                    <textarea 
                                        rows={2}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Entry codes, pets, or specific instructions..."
                                        className="w-full px-6 py-4 bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-700 rounded-2xl font-medium text-sm text-neutral-900 dark:text-neutral-100 focus:border-[#14a800] outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-12 py-10 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between sticky bottom-0 z-20">
                    {step > 1 ? (
                        <button 
                            onClick={handleBack}
                            className="group flex items-center gap-3 text-neutral-400 font-black hover:text-neutral-900 transition-all py-4 px-6"
                        >
                            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" /> Back
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 text-neutral-300">
                            <ShieldCheck className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Escrow Protected</span>
                        </div>
                    )}

                    <button 
                        onClick={step === 4 ? handleSubmit : handleNext}
                        disabled={isLoading || (step === 1 && (!selectedService || !jobDescription)) || (step === 2 && (!date || !time)) || (step === 3 && (!district || !address))}
                        className={cn(
                            "px-14 py-6 rounded-full font-black text-lg transition-all flex items-center gap-3 shadow-2xl disabled:opacity-30 disabled:scale-100 active:scale-95",
                            step === 4 
                                ? "bg-[#14a800] text-white shadow-green-200" 
                                : "bg-neutral-900 text-white shadow-neutral-200 hover:bg-black"
                        )}
                    >
                        {isLoading ? 'Creating Booking...' : (step === 4 ? 'Confirm & Buy' : 'Next Step')}
                        {step < 4 && <ArrowRight className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
