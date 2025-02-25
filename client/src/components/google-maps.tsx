import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { Loader2 } from "lucide-react";
import { AddressSearch } from "./address-search";

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface GoogleMapsProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
  defaultAddress?: string;
}

// Компонент за актуализиране на изгледа на картата
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    map.setView(center, map.getZoom(), {
      animate: true,
      duration: 0.8
    });
  }, [center, map]);

  return null;
}

export function GoogleMaps({ onLocationSelect, initialLocation, defaultAddress }: GoogleMapsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(() => {
    try {
      const savedLocation = localStorage.getItem('lastLocation');
      if (savedLocation) {
        return JSON.parse(savedLocation);
      }
    } catch (error) {
      console.error('Error reading location from localStorage:', error);
    }
    return initialLocation || { lat: 42.6977, lng: 23.3219 }; // София по подразбиране
  });

  // Мемоизация на центъра на картата
  const center = useMemo(() => 
    [currentLocation.lat, currentLocation.lng] as [number, number],
    [currentLocation.lat, currentLocation.lng]
  );

  // Handle map load complete
  const handleMapLoad = () => {
    setIsLoading(false);
  };

  const handleLocationFound = (location: { lat: number; lng: number; display_name: string }) => {
    setCurrentLocation(location);
    onLocationSelect?.(location);

    try {
      // Запазваме адреса в localStorage за да го запомним
      localStorage.setItem('lastAddress', location.display_name);
      localStorage.setItem('lastLocation', JSON.stringify({ lat: location.lat, lng: location.lng }));
    } catch (error) {
      console.error('Error saving location to localStorage:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[300px] rounded-md border flex items-center justify-center bg-accent/5">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Зареждане на картата...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AddressSearch 
        onLocationFound={handleLocationFound}
        defaultAddress={defaultAddress || (() => {
          try {
            return localStorage.getItem('lastAddress') || '';
          } catch {
            return '';
          }
        })()}
      />
      <div className="relative w-full h-[300px]">
        <MapContainer
          center={center}
          zoom={13}
          className="w-full h-[300px] rounded-md border"
          style={{ zIndex: 1 }}
          whenReady={handleMapLoad}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker 
            position={center}
            icon={defaultIcon}
          />
          {/* Добавяме радиус около имота */}
          <Circle
            center={center}
            radius={500}
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
          />
          <MapUpdater center={center} />
        </MapContainer>
      </div>
    </div>
  );
}