import { useState, useEffect } from "react";
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
  initialLocation?: { lat: number; lng: number };
}

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

export function GoogleMaps({ onLocationSelect, initialLocation }: GoogleMapsProps) {
  const [center, setCenter] = useState(initialLocation || defaultCenter);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch API key from backend
    axios.get('/api/maps/config')
      .then(({ data }) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setApiKey(data.apiKey);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching Maps API key:', error);
        toast({
          title: "Грешка при зареждане",
          description: "Не успяхме да заредим картата",
          variant: "destructive"
        });
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (initialLocation) {
      setCenter(initialLocation);
    }
  }, [initialLocation]);

  if (isLoading || !apiKey) {
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
    <LoadScript
      googleMapsApiKey={apiKey}
      language="bg"
      libraries={libraries}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
        }}
        onClick={(e) => {
          if (e.latLng) {
            const newLocation = {
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            };
            setCenter(newLocation);
            onLocationSelect?.(newLocation);
          }
        }}
      >
        <Marker
          position={center}
          draggable={true}
          onDragEnd={(e) => {
            if (e.latLng) {
              const newLocation = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              };
              setCenter(newLocation);
              onLocationSelect?.(newLocation);
            }
          }}
        />
      </GoogleMap>
    </LoadScript>
  );
}