import { useState, useEffect, useCallback } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Loader2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/maps/config');

        if (!response.data.apiKey) {
          throw new Error('API key not configured');
        }

        console.log('API Key loaded successfully');
        setApiKey(response.data.apiKey);
      } catch (error) {
        console.error('Error loading API key:', error);
        toast({
          title: "Грешка при зареждане",
          description: "Проблем при зареждане на Google Maps конфигурацията",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKey();
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

    setIsSearching(true);
    try {
      console.log('Searching for address:', searchQuery);
      const { data } = await axios.get('/api/geocode', {
        params: {
          address: `${searchQuery}, Bulgaria`,
          language: 'bg'
        }
      });

      console.log('Geocoding response:', data);

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
        description: error instanceof Error ? error.message : "Не успяхме да намерим адреса",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
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

  if (isLoading) {
    return (
      <div className="w-full h-full rounded-md border flex items-center justify-center bg-accent/5">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Зареждане на картата...</p>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="w-full h-full rounded-md border flex items-center justify-center bg-accent/5">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            Google Maps API ключът не е конфигуриран правилно
          </p>
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
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="shrink-0"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
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