import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Libraries } from "@react-google-maps/api";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 42.6977,
  lng: 23.3219
};

const libraries: Libraries = ['places'];

interface GoogleMapsProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
}

export function GoogleMaps({ onLocationSelect, initialLocation }: GoogleMapsProps) {
  const [center, setCenter] = useState(initialLocation || defaultCenter);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const response = await api.get('api/maps/config');
        console.log('Maps API config response:', response.data);

        if (!response.data.apiKey) {
          throw new Error('API key not configured');
        }

        setApiKey(response.data.apiKey);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Maps API key:', error);
        setError(error instanceof Error ? error.message : 'Failed to load Maps API key');
        toast({
          title: "Грешка при зареждане на картата",
          description: "Моля, проверете конфигурацията на Google Maps API",
          variant: "destructive"
        });
      }
    };

    loadApiKey();
  }, []);

  useEffect(() => {
    if (initialLocation) {
      setCenter(initialLocation);
    }
  }, [initialLocation]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setCenter(newLocation);
      onLocationSelect?.(newLocation);
    }
  };

  if (isLoading || !apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey={apiKey}
      libraries={libraries}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onClick={handleMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false
        }}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}