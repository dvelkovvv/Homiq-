import { useState, useEffect, useCallback } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
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

interface GoogleMapsProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  onAddressSelect?: (address: string) => void;
  initialLocation?: { lat: number; lng: number };
}

export function GoogleMaps({ onLocationSelect, onAddressSelect, initialLocation }: GoogleMapsProps) {
  const [center, setCenter] = useState(initialLocation || defaultCenter);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    if (initialLocation) {
      setCenter(initialLocation);
    }
  }, [initialLocation]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Въведете адрес",
        description: "Моля, въведете адрес за търсене",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data } = await axios.get('/api/geocode', {
        params: {
          address: `${searchQuery}, Bulgaria`,
          language: 'bg'
        }
      });

      if (!data.results?.[0]) {
        throw new Error('Адресът не е намерен');
      }

      const location = data.results[0].geometry.location;
      setCenter(location);
      onLocationSelect?.(location);
      onAddressSelect?.(data.results[0].formatted_address);

      toast({
        title: "Адресът е намерен",
        description: "Можете да коригирате позицията на маркера",
      });
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Грешка при търсене",
        description: "Не успяхме да намерим адреса",
        variant: "destructive"
      });
    }
  };

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
          latlng: `${location.lat},${location.lng}`,
          language: 'bg'
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

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <div className="relative h-full">
        <div className="absolute top-2 left-2 right-2 z-10 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Търсете адрес в България..."
            className="flex-1 h-10 px-3 py-2 rounded-md border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

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
            restriction: {
              latLngBounds: {
                north: 44.2,
                south: 41.2,
                east: 29.0,
                west: 22.0
              },
              strictBounds: true
            }
          }}
        >
          <Marker
            position={center}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
          />
        </GoogleMap>
      </div>
    </LoadScript>
  );
}