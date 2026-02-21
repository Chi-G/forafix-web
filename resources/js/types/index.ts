export type UserRole = 'CLIENT' | 'AGENT' | 'ADMIN';

export interface User {
    id: number;
    uuid: string;
    name: string;
    email: string;
    role: UserRole;
    is_vetted?: boolean;
    loyalty_points?: number;
    balance?: number;
    avatar_url?: string;
    agent_profile?: AgentProfile;
    created_at: string;
}

export interface AgentProfile {
    id: number;
    user_id: number;
    bio: string;
    rating: number;
    review_count: number;
    skills: string[];
    is_verified: boolean;
    location_base?: string;
    availability: string; // JSON or serialized schedule
}

export interface ServiceCategory {
    id: number;
    name: string;
    slug: string;
    icon: string;
    description: string;
    starting_price: number;
    subcategories?: ServiceSubcategory[];
}

export interface ServiceSubcategory {
    id: number;
    category_id: number;
    name: string;
    description: string;
    base_price: number;
}

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
    id: number;
    client_id: number;
    agent_id?: number;
    service_id: number;
    status: BookingStatus;
    scheduled_at: string;
    address: string;
    latitude?: number;
    longitude?: number;
    total_price: number;
    notes?: string;
    created_at: string;
}

export interface Review {
    id: number;
    booking_id: number;
    reviewer_id: number;
    reviewee_id: number;
    rating: number;
    comment: string;
    created_at: string;
}
