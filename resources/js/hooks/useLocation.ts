import { useState, useEffect, useCallback } from 'react';

interface Coordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
}

interface LocationData {
    coordinates: Coordinates | null;
    address: string | null;
    area: string | null;
    city: string | null;
    state: string | null;
    loading: boolean;
    error: string | null;
    permission: 'granted' | 'denied' | 'prompt' | null;
}

export const useLocation = () => {
    const [location, setLocation] = useState<LocationData>({
        coordinates: null,
        address: null,
        area: null,
        city: null,
        state: null,
        loading: false,
        error: null,
        permission: null,
    });

    // 1. Check permission status
    const checkPermission = useCallback(async () => {
        if (!navigator.permissions) return;

        try {
            const result = await navigator.permissions.query({ name: 'geolocation' as any });
            setLocation(prev => ({ ...prev, permission: result.state as any }));

            result.addEventListener('change', () => {
                setLocation(prev => ({ ...prev, permission: result.state as any }));
            });
        } catch (e) {
            console.log('Permission API not supported');
        }
    }, []);

    // 2. Get current position with high accuracy
    const getCurrentPosition = useCallback((): Promise<Coordinates> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            setLocation(prev => ({ ...prev, loading: true, error: null }));

            const options = {
                enableHighAccuracy: true,  // Use GPS if available
                timeout: 10000,            // 10 seconds
                maximumAge: 0              // Don't use cached position
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy, // in meters
                    };
                    setLocation(prev => ({
                        ...prev,
                        coordinates: coords,
                        loading: false
                    }));
                    resolve(coords);
                },
                (error) => {
                    let errorMessage = 'Unable to retrieve location';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied. Please enable location services.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                    }
                    setLocation(prev => ({
                        ...prev,
                        error: errorMessage,
                        loading: false
                    }));
                    reject(new Error(errorMessage));
                },
                options
            );
        });
    }, []);

    // 3. Watch position (for real-time tracking when agent is en route)
    const watchPosition = useCallback((callback: (coords: Coordinates) => void) => {
        if (!navigator.geolocation) return null;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const coords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                };
                callback(coords);
            },
            (error) => console.error('Watch error:', error),
            { enableHighAccuracy: true, maximumAge: 10000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    useEffect(() => {
        checkPermission();
    }, [checkPermission]);

    return {
        ...location,
        getCurrentPosition,
        watchPosition,
    };
};
