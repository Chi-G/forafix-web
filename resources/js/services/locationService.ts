import axios from 'axios';

interface ReverseGeocodeResponse {
    address: string;
    area: string;           // e.g., "Kagini"
    district: string;       // e.g., "Abuja Municipal Area Council"
    city: string;           // e.g., "Abuja"
    state: string;          // e.g., "FCT"
    country: string;
    postalCode?: string;
    formattedAddress: string; // Full readable address
}

export const locationService = {
    // Send coordinates to backend, get human-readable address
    reverseGeocode: async (
        latitude: number,
        longitude: number
    ): Promise<ReverseGeocodeResponse> => {
        const { data } = await axios.post('/location/reverse-geocode', {
            latitude,
            longitude,
        });
        return data;
    },

    // Search for address/area name (for manual input)
    searchPlaces: async (query: string): Promise<Array<{
        id: string;
        description: string;
        placeId: string;
        mainText: string;
        secondaryText: string;
    }>> => {
        const { data } = await axios.get('/location/search', {
            params: { q: query },
        });
        return data.predictions;
    },

    // Get details from place_id (when user selects from search)
    getPlaceDetails: async (placeId: string): Promise<{
        latitude: number;
        longitude: number;
        address: string;
        area: string;
    }> => {
        const { data } = await axios.get(`/location/place-details/${placeId}`);
        return data;
    },

    // Save user's location to profile
    saveLocation: async (locationData: {
        name: string;        // e.g., "Home", "Office"
        address: string;
        area: string;
        latitude: number;
        longitude: number;
        isDefault: boolean;
    }) => {
        const { data } = await axios.post('/user/locations', locationData);
        return data;
    },
};
