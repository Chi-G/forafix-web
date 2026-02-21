import { ServiceCategory } from '../types';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
    {
        id: 1,
        name: 'Cleaning Services',
        slug: 'cleaning',
        icon: 'sparkles',
        description: 'Residential, deep cleaning, and eco-friendly solutions.',
        starting_price: 3000,
    },
    {
        id: 2,
        name: 'Home Repairs',
        slug: 'repairs',
        icon: 'wrench',
        description: 'Plumbing, electrical, carpentry, and AC maintenance.',
        starting_price: 3500,
    },
    {
        id: 3,
        name: 'Grocery Shopping',
        slug: 'grocery',
        icon: 'shopping-basket',
        description: 'Personal shoppers for Wuse market and supermarkets.',
        starting_price: 2500,
    },
    {
        id: 4,
        name: 'Package Delivery',
        slug: 'delivery',
        icon: 'truck',
        description: 'Same-day errand and parcel delivery within Abuja.',
        starting_price: 2000,
    },
    {
        id: 5,
        name: 'Laundry',
        slug: 'laundry',
        icon: 'shirt',
        description: 'Pickup, professional cleaning, and delivery.',
        starting_price: 2500,
    },
    {
        id: 6,
        name: 'Pest Control',
        slug: 'pest-control',
        icon: 'bug',
        description: 'Fumigation and pest management for your home.',
        starting_price: 8000,
    }
];
