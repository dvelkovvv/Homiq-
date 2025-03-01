import { useState, useEffect, useRef } from "react";
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

interface GoogleMapsProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  onAddressSelect?: (address: string) => void;
  initialLocation?: { lat: number; lng: number };
}

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

export function GoogleMaps({ onLocationSelect, onAddressSelect, initialLocation }: GoogleMapsProps) {
  const [center, setCenter] = useState(initialLocation || defaultCenter);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
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

          // Pan the map to show the selected location
          if (mapRef.current && place.geometry.viewport) {
            mapRef.current.fitBounds(place.geometry.viewport);
          } else if (mapRef.current) {
            mapRef.current.setCenter(place.geometry.location);
            mapRef.current.setZoom(17);
          }
        }
      }
    }
  };

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
      <div className="relative h-full">
        <StandaloneSearchBox
          onLoad={ref => searchBoxRef.current = ref}
          onPlacesChanged={handlePlacesChanged}
        >
          <input
            type="text"
            placeholder="Търсете адрес..."
            className="absolute top-2 left-2 right-2 z-10 h-10 px-3 py-2 rounded-md border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </StandaloneSearchBox>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={15}
          onLoad={map => mapRef.current = map}
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
          onClick={(e) => {
            if (e.latLng) {
              const newLocation = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              };
              setCenter(newLocation);
              onLocationSelect?.(newLocation);

              // Reverse geocode the clicked location
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode(
                { location: newLocation },
                (results, status) => {
                  if (status === "OK" && results?.[0]) {
                    onAddressSelect?.(results[0].formatted_address);
                  }
                }
              );
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

                // Reverse geocode the dragged location
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode(
                  { location: newLocation },
                  (results, status) => {
                    if (status === "OK" && results?.[0]) {
                      onAddressSelect?.(results[0].formatted_address);
                    }
                  }
                );
              }
            }}
          />
        </GoogleMap>
      </div>
    </LoadScript>
  );
}