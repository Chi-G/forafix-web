import React, { useEffect, useState } from 'react';
import { useLocation } from '../../hooks/useLocation';
import { locationService } from '../../services/locationService';
import { MapPin, Loader, AlertCircle, Navigation } from 'lucide-react';

export const LocationDetector: React.FC<{
  onLocationDetected: (location: {
    address: string;
    area: string;
    coordinates: { lat: number; lng: number };
  }) => void;
}> = ({ onLocationDetected }) => {
  const { 
    coordinates, 
    getCurrentPosition, 
    loading, 
    error, 
    permission 
  } = useLocation();
  
  const [detectedLocation, setDetectedLocation] = useState<{
    address: string;
    area: string;
    district: string;
    formattedAddress: string;
  } | null>(null);
  
  const [detecting, setDetecting] = useState(false);

  const handleDetect = async () => {
    try {
      setDetecting(true);
      const coords = await getCurrentPosition();
      
      // Send to backend for reverse geocoding
      const locationData = await locationService.reverseGeocode(
        coords.latitude,
        coords.longitude
      );
      
      setDetectedLocation(locationData as any);
      onLocationDetected({
        address: locationData.formattedAddress,
        area: locationData.area,
        coordinates: {
          lat: coords.latitude,
          lng: coords.longitude,
        },
      });
    } catch (err) {
      console.error('Detection failed:', err);
    } finally {
      setDetecting(false);
    }
  };

  // Auto-detect on mount if permission already granted
  useEffect(() => {
    if (permission === 'granted' && !coordinates) {
      handleDetect();
    }
  }, [permission]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="text-red-500 mt-0.5" size={20} />
        <div>
          <p className="text-red-800 font-medium">Location Error</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={handleDetect}
            className="mt-2 text-sm text-red-700 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleDetect}
        disabled={loading || detecting}
        className="w-full flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
      >
        {loading || detecting ? (
          <>
            <Loader className="animate-spin" size={20} />
            <span>Detecting your location...</span>
          </>
        ) : (
          <>
            <Navigation size={20} className="text-green-600" />
            <span className="text-green-800 font-medium">
              {detectedLocation ? 'Update Location' : 'Detect My Location'}
            </span>
          </>
        )}
      </button>

      {detectedLocation && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <MapPin className="text-green-600 mt-1" size={20} />
            <div>
              <p className="font-semibold text-gray-900">
                {detectedLocation.area}
              </p>
              <p className="text-gray-600 text-sm">
                {detectedLocation.district}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {detectedLocation.address}
              </p>
            </div>
          </div>
        </div>
      )}

      {permission === 'denied' && (
        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
          Location access denied. Please enable it in your browser settings or enter your address manually.
        </p>
      )}
    </div>
  );
};
