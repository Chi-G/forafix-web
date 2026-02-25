import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface AvatarProps {
    src?: string | null;
    name?: string | null;
    className?: string;
    sizeClassName?: string;
    fallbackIcon?: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ 
    src, 
    name, 
    className, 
    sizeClassName = "w-10 h-10",
    fallbackIcon
}) => {
    const [imgError, setImgError] = useState(false);

    // reset error state if src changes (e.g. after upload or fallback change)
    React.useEffect(() => {
        setImgError(false);
    }, [src]);

    const hasImage = src && !imgError;
    const initial = name ? name[0].toUpperCase() : null;

    return (
        <div className={cn(
            "rounded-full flex items-center justify-center font-black text-sm overflow-hidden shrink-0",
            !hasImage && "bg-brand-50 dark:bg-[#14a800]/20 text-[#14a800]",
            sizeClassName,
            className
        )}>
            {hasImage ? (
                <img 
                    src={src!} 
                    alt={name || 'Avatar'} 
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                initial || fallbackIcon || <UserIcon className="w-1/2 h-1/2 opacity-50" />
            )}
        </div>
    );
};

export default Avatar;
