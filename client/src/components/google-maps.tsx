import { useState, useEffect, useCallback } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from 'axios';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 42.6977,
  lng: 23.3219
};

const libraries = ["places"] as const;

interface GoogleMapsProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  onAddressSelect?: (address: string) => void;
  initialLocation?: { lat: number; lng: number };
}

export function GoogleMaps({ onLocationSelect, onAddressSelect, initialLocation }: GoogleMapsProps) {
  const [center, setCenter] = useState(initialLocation || defaultCenter);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/api/maps/config')
      .then(response => {
        if (!response.data.apiKey) {
          throw new Error('API key not received');
        }
        setApiKey(response.data.apiKey);
      })
      .catch(error => {
        console.error('Error loading Maps API key:', error);
        toast({
          title: "Грешка при зареждане",
          description: "Проблем при зареждане на картата",
          variant: "destructive"
        });
      });
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? '',
    libraries,
  });

  useEffect(() => {
    if (initialLocation) {
      setCenter(initialLocation);
    }
  }, [initialLocation]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setCenter(newLocation);
      onLocationSelect?.(newLocation);
      updateAddress(newLocation);
    }
  }, [onLocationSelect]);

  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setCenter(newLocation);
      onLocationSelect?.(newLocation);
      updateAddress(newLocation);
    }
  }, [onLocationSelect]);

  const updateAddress = async (location: { lat: number; lng: number }) => {
    try {
      const { data } = await axios.get('/api/geocode', {
        params: {
          latlng: `${location.lat},${location.lng}`
        }
      });

      if (data.results?.[0]) {
        onAddressSelect?.(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  if (!apiKey) {
    return (
      <div className="w-full h-full rounded-md border flex items-center justify-center bg-accent/5">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Зареждане на картата...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-full rounded-md border flex items-center justify-center bg-destructive/5">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-destructive">Грешка при зареждане на картата</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full rounded-md border flex items-center justify-center bg-accent/5">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Зареждане на картата...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: 'greedy'
        }}
      >
        <Marker
          position={center}
          draggable={true}
          onDragEnd={handleMarkerDragEnd}
        />
      </GoogleMap>
    </div>
  );
}