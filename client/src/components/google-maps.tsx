import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Circle } from "@react-google-maps/api";
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
  defaultAddress?: string;
}

type Libraries = ("places" | "geometry")[];
const libraries: Libraries = ["places", "geometry"];

export function GoogleMaps({ onLocationSelect, initialLocation, defaultAddress }: GoogleMapsProps) {
  const [center, setCenter] = useState(initialLocation || defaultCenter);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Fetch API key from backend
    axios.get('/api/maps/config')
      .then(({ data }) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setApiKey(data.apiKey);
      })
      .catch(error => {
        console.error('Error fetching Maps API key:', error);
        setError("Грешка при зареждане на конфигурацията");
        toast({
          title: "Грешка при зареждане",
          description: "Не успяхме да заредим картата",
          variant: "destructive"
        });
      });
  }, []);

  if (error) {
    return (
      <div className="w-full h-full rounded-md border flex items-center justify-center bg-destructive/5">
        <div className="text-center">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">Моля, опитайте отново по-късно</p>
        </div>
      </div>
    );
  }

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
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
      >
        <Marker
          position={center}
          draggable={true}
          onDragEnd={(e) => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              setCenter({ lat, lng });
              onLocationSelect?.({ lat, lng });
            }
          }}
        />
        <Circle
          center={center}
          radius={500}
          options={{
            fillColor: '#4299e1',
            fillOpacity: 0.1,
            strokeColor: '#4299e1',
            strokeWeight: 1
          }}
        />
      </GoogleMap>
    </LoadScript>
  );
}