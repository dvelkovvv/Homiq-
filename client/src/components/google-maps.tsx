import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox } from "@react-google-maps/api";
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

const libraries = ["places"];

interface GoogleMapsProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  onAddressSelect?: (address: string) => void;
  initialLocation?: { lat: number; lng: number };
}

export function GoogleMaps({ onLocationSelect, onAddressSelect, initialLocation }: GoogleMapsProps) {
  const [center, setCenter] = useState(initialLocation || defaultCenter);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

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

  const handlePlacesChanged = () => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          const newLocation = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          setCenter(newLocation);
          onLocationSelect?.(newLocation);

          if (place.formatted_address) {
            onAddressSelect?.(place.formatted_address);
          }

          if (mapRef.current) {
            if (place.geometry.viewport) {
              mapRef.current.fitBounds(place.geometry.viewport);
            } else {
              mapRef.current.setCenter(place.geometry.location);
              mapRef.current.setZoom(17);
            }
          }
        }
      }
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
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <div className="relative h-full">
        <StandaloneSearchBox
          onLoad={ref => searchBoxRef.current = ref}
          onPlacesChanged={handlePlacesChanged}
        >
          <input
            type="text"
            placeholder="Търсете адрес в България..."
            className="absolute top-2 left-2 right-2 z-10 h-10 px-3 py-2 rounded-md border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </StandaloneSearchBox>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={map => mapRef.current = map}
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