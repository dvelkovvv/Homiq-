import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";

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

export function GoogleMaps({ onLocationSelect, initialLocation }: GoogleMapsProps) {
  const defaultLocation = initialLocation || { lat: 42.6977, lng: 23.3219 }; // София по подразбиране

  return (
    <MapContainer
      center={[defaultLocation.lat, defaultLocation.lng]}
      zoom={13}
      className="w-full h-[300px] rounded-md border"
      style={{ zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {initialLocation && (
        <Marker 
          position={[initialLocation.lat, initialLocation.lng]}
          icon={defaultIcon}
        />
      )}
      <LocationMarker onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
}