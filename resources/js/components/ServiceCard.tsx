import React from 'react';
import { LucideIcon, Sparkles, Wind, Droplets, Shirt, Zap, Leaf, Wrench, ShoppingBasket, Truck, Bug, ChevronRight, Star, ArrowUpRight } from 'lucide-react';
import { ServiceCategory } from '../types';
import { formatNaira } from '../lib/utils';
import { Link } from 'react-router-dom';

const iconMap: Record<string, LucideIcon> = {
    'Sparkles': Sparkles,
    'Wind': Wind,
    'Droplets': Droplets,
    'Shirt': Shirt,
    'Zap': Zap,
    'Leaf': Leaf,
    'wrench': Wrench,
    'shopping-basket': ShoppingBasket,
    'truck': Truck,
    'bug': Bug,
};

interface ServiceCardProps {
    category: ServiceCategory;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ category }) => {
    const Icon = iconMap[category.icon] || Sparkles;

    return (
        <Link 
            to={`/services/${category.slug}`}
            className="group relative bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-2xl hover:border-transparent dark:hover:shadow-black/40 hover:-translate-y-2 block h-full flex flex-col"
        >
            <div className="flex items-start justify-between mb-8">
                <div className="p-5 bg-neutral-50 dark:bg-neutral-700 rounded-2xl group-hover:bg-[#14a800] group-hover:text-white transition-all duration-500 shadow-sm">
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded-full text-sm font-bold text-neutral-900 dark:text-neutral-100 border border-neutral-100 dark:border-neutral-600 shadow-sm group-hover:bg-white dark:group-hover:bg-neutral-800 transition-colors">
                    <Star className="w-4 h-4 fill-[#14a800] text-[#14a800]" />
                    <span>4.9</span>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 tracking-tight group-hover:text-[#14a800] transition-colors">{category.name}</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-10 leading-relaxed font-medium flex-grow">
                {category.description}
            </p>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-neutral-50 dark:border-neutral-700">
                <div className="text-sm">
                    <span className="text-neutral-400 dark:text-neutral-500 block font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Starting from</span>
                    <span className="text-neutral-900 dark:text-neutral-100 text-xl font-black tracking-tight">{formatNaira(category.starting_price)}</span>
                </div>
                
                <div className="w-12 h-12 rounded-full border border-neutral-100 dark:border-neutral-700 flex items-center justify-center text-neutral-300 dark:text-neutral-500 group-hover:bg-[#14a800] group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-sm">
                    <ArrowUpRight className="w-6 h-6" />
                </div>
            </div>
            
            {/* Subtle Gradient Overlay on Hover */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#14a800]/10 rounded-[2.5rem] pointer-events-none transition-all duration-500" />
        </Link>
    );
};

export default ServiceCard;
