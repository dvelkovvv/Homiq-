import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Loader2, AlertCircle } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get('/api/maps/config');
        console.log('API Config Response:', response.data);

        if (response.data.error) {
          throw new Error(response.data.details || response.data.error);
        }

        if (!response.data.apiKey) {
          throw new Error('API key not configured');
        }

        setApiKey(response.data.apiKey);
        console.log('API Key loaded successfully');
      } catch (error) {
        console.error('Error loading API key:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        toast({
          title: "Грешка при зареждане",
          description: `Проблем с Google Maps API: ${errorMessage}`,
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

  if (error || !apiKey) {
    return (
      <div className="w-full h-full rounded-md border flex items-center justify-center bg-accent/5">
        <div className="flex flex-col items-center gap-4 text-center p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Грешка при зареждане на картата</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error || 'Google Maps API ключът не е конфигуриран правилно'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Моля, проверете дали:
              1. API ключът е правилен
              2. JavaScript Maps API е активиран
              3. Домейнът е разрешен в конзолата
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey={apiKey}
      onError={(error) => {
        console.error('Google Maps loading error:', error);
        setError(`Error loading Google Maps: ${error.message}`);
      }}
    >
      <div className="relative h-full">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true
          }}
        >
          <Marker position={center} />
        </GoogleMap>
      </div>
    </LoadScript>
  );
}