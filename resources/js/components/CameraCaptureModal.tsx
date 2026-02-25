import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCcw, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface CameraCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File) => void;
}

const CameraCaptureModal = ({ isOpen, onClose, onCapture }: CameraCaptureModalProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen]);

    useEffect(() => {
        if (stream && videoRef.current && !capturedImage) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => console.error("Video play error:", err));
        }
    }, [stream, capturedImage, isLoading]);

    const startCamera = async () => {
        setIsLoading(true);
        setError(null);
        setCapturedImage(null);
        
        // Stop existing stream if any
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user', 
                    width: { ideal: 1024 }, 
                    height: { ideal: 1024 } 
                }, 
                audio: false 
            });
            setStream(mediaStream);
        } catch (err: any) {
            console.error("Camera error:", err);
            setError(err.name === 'NotAllowedError' 
                ? "Camera access denied. Please enable permissions." 
                : "Could not access camera. Make sure no other app is using it.");
        } finally {
            setIsLoading(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Set square dimensions
        const size = Math.min(video.videoWidth, video.videoHeight);
        canvas.width = size;
        canvas.height = size;

        // Draw centered square from video
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        
        context.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
    };

    const handleUsePhoto = () => {
        if (!capturedImage) return;

        // Convert dataUrl to File
        fetch(capturedImage)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], `profile_${Date.now()}.jpg`, { type: 'image/jpeg' });
                onCapture(file);
                onClose();
            });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-neutral-900 tracking-tight">Access Camera</h3>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Take a profile photo</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="relative aspect-square bg-neutral-900 rounded-[2rem] overflow-hidden border-4 border-neutral-50 shadow-inner flex items-center justify-center">
                        {isLoading && (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-[#14a800]" />
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Waking up camera...</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <p className="text-sm font-bold text-red-600">{error}</p>
                                <button 
                                    onClick={startCamera}
                                    className="px-6 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {!isLoading && !error && !capturedImage && (
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                        )}

                        {capturedImage && (
                            <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
                        )}

                        {/* Centering Guide */}
                        {!capturedImage && !error && !isLoading && (
                            <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none">
                                <div className="w-full h-full border-2 border-dashed border-white/50 rounded-full" />
                            </div>
                        )}
                    </div>

                    <canvas ref={canvasRef} className="hidden" />

                    <div className="mt-8 flex items-center gap-3">
                        {!capturedImage ? (
                            <button
                                onClick={capturePhoto}
                                disabled={isLoading || !!error}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#14a800] text-white py-4 rounded-2xl font-black text-sm hover:bg-[#118b00] transition-all shadow-lg shadow-green-100 active:scale-95 disabled:opacity-50"
                            >
                                <Camera className="w-5 h-5" /> Capture Photo
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={startCamera}
                                    className="flex-1 flex items-center justify-center gap-2 bg-neutral-100 text-neutral-900 py-4 rounded-2xl font-black text-sm hover:bg-neutral-200 transition-all active:scale-95"
                                >
                                    <RefreshCcw className="w-4 h-4" /> Retake
                                </button>
                                <button
                                    onClick={handleUsePhoto}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#14a800] text-white py-4 rounded-2xl font-black text-sm hover:bg-[#118b00] transition-all shadow-lg shadow-green-100 active:scale-95"
                                >
                                    <Check className="w-4 h-4" /> Use Photo
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CameraCaptureModal;
