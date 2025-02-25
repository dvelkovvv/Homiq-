import { useEffect, useState } from "react";
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

// Component to handle location updates
function LocationMarker({ onLocationSelect }: { onLocationSelect?: (location: { lat: number; lng: number }) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onLocationSelect) return;

    const handleClick = (e: any) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationSelect]);

  return null;
}

export function GoogleMaps({ onLocationSelect, initialLocation, defaultAddress }: GoogleMapsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(
    initialLocation || { lat: 42.6977, lng: 23.3219 } // София по подразбиране
  );

  // Handle map load complete
  const handleMapLoad = () => {
    setIsLoading(false);
  };

  const handleLocationFound = (location: { lat: number; lng: number; display_name: string }) => {
    setCurrentLocation(location);
    onLocationSelect?.(location);
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
        defaultAddress={defaultAddress}
      />
      <div className="relative w-full h-[300px]">
        <MapContainer
          center={[currentLocation.lat, currentLocation.lng]}
          zoom={13}
          className="w-full h-[300px] rounded-md border"
          style={{ zIndex: 1 }}
          whenReady={handleMapLoad}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker 
            position={[currentLocation.lat, currentLocation.lng]}
            icon={defaultIcon}
          />
          {/* Add a radius circle around the property */}
          <Circle
            center={[currentLocation.lat, currentLocation.lng]}
            radius={500}
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
          />
          <LocationMarker onLocationSelect={onLocationSelect} />
        </MapContainer>
      </div>
    </div>
  );
}