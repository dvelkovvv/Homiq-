import { useState, useEffect, useRef } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    // Fetch API key from server
    axios.get('/api/maps/config')
      .then(response => {
        const apiKey = response.data.apiKey;
        if (!apiKey) {
          throw new Error('API key not received');
        }

        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          setError("Грешка при зареждане на Google Maps API");
          setIsLoading(false);
        };

        // Define the callback function
        window.initMap = () => {
          const mapElement = document.getElementById('map');
          if (!mapElement) return;

          const center = initialLocation || defaultCenter;

          const map = new google.maps.Map(mapElement, {
            zoom: 12,
            center: center,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
          });

          const marker = new google.maps.Marker({
            position: center,
            map: map,
            draggable: true
          });

          mapRef.current = map;
          markerRef.current = marker;

          // Add click event listener to map
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              const location = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              };
              marker.setPosition(location);
              onLocationSelect?.(location);
              updateAddress(location);
            }
          });

          // Add dragend event listener to marker
          marker.addListener('dragend', () => {
            const position = marker.getPosition();
            if (position) {
              const location = {
                lat: position.lat(),
                lng: position.lng()
              };
              onLocationSelect?.(location);
              updateAddress(location);
            }
          });

          setIsLoading(false);
        };

        document.head.appendChild(script);
      })
      .catch(error => {
        console.error('Error loading Google Maps:', error);
        setError("Грешка при зареждане на картата");
        setIsLoading(false);
      });

    return () => {
      // Cleanup
      delete window.initMap;
    };
  }, [initialLocation, onLocationSelect, onAddressSelect]);

  const updateAddress = async (location: { lat: number; lng: number }) => {
    try {
      const response = await axios.get('/api/geocode', {
        params: {
          latlng: `${location.lat},${location.lng}`
        }
      });

      if (response.data.results?.[0]) {
        onAddressSelect?.(response.data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  if (error) {
    return (
      <div className="w-full h-full rounded-md border flex items-center justify-center bg-destructive/5">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

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

  return <div id="map" style={containerStyle} />;
}

// Add the initMap to the window object type
declare global {
  interface Window {
    initMap: () => void;
  }
}