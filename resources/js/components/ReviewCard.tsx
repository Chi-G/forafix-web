import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { Review } from '../types';

interface ReviewCardProps {
    review: {
        id: number;
        user_name: string;
        rating: number;
        comment: string;
        date: string;
        is_verified_purchase: boolean;
    };
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    return (
        <div className="py-6 border-b border-neutral-100 last:border-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-500">
                        {review.user_name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-neutral-900 font-inter text-sm">{review.user_name}</div>
                        <div className="text-xs text-neutral-400 font-inter">{review.date}</div>
                    </div>
                </div>
                <div className="flex items-center gap-1 group">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                            key={s} 
                            className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'}`} 
                        />
                    ))}
                </div>
            </div>

            {review.is_verified_purchase && (
                <div className="flex items-center gap-1.5 text-xs text-brand-600 font-bold mb-3 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Booking
                </div>
            )}

            <p className="text-neutral-600 font-inter text-sm leading-relaxed">
                {review.comment}
            </p>
        </div>
    );
};

export default ReviewCard;
