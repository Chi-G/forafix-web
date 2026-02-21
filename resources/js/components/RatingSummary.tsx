import React from 'react';
import { Star } from 'lucide-react';

interface RatingSummaryProps {
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>;
}

const RatingSummary: React.FC<RatingSummaryProps> = ({ averageRating, totalReviews, distribution }) => {
    return (
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 flex flex-col md:flex-row gap-10">
            <div className="text-center md:border-r md:pr-10 border-neutral-100 flex flex-col justify-center">
                <div className="text-6xl font-black text-neutral-900 font-inter mb-2">{averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                            key={s} 
                            className={`w-5 h-5 ${s <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'}`} 
                        />
                    ))}
                </div>
                <div className="text-sm font-medium text-neutral-500 font-inter uppercase tracking-wider">{totalReviews} Reviews</div>
            </div>

            <div className="flex-1 space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                    const count = distribution[rating] || 0;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    
                    return (
                        <div key={rating} className="flex items-center gap-4 text-sm font-inter">
                            <div className="w-4 font-bold text-neutral-700">{rating}</div>
                            <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-brand-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <div className="w-12 text-right text-neutral-400 font-medium">
                                {count}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RatingSummary;
