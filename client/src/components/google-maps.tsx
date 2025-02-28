import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { Loader2 } from "lucide-react";
import { AddressSearch } from "./address-search";
import { LocationAnalyzer, LocationPoint } from "@/lib/location-analysis";

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

function MapUpdater({ center, points }: { center: [number, number]; points?: LocationPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    map.setView(center, map.getZoom(), {
      animate: true,
      duration: 0.8,
      easeLinearity: 0.25
    });
  }, [center, map]);

  return null;
}

const pointTypeIcons: Record<string, string> = {
  transport: "🚇",
  education: "🎓",
  shopping: "🏬",
  leisure: "🌳"
};

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
  const [nearbyPoints, setNearbyPoints] = useState<LocationPoint[]>([]);

  const center = useMemo(() => 
    [currentLocation.lat, currentLocation.lng] as [number, number],
    [currentLocation.lat, currentLocation.lng]
  );

  useEffect(() => {
    if (currentLocation) {
      LocationAnalyzer.getNearbyPoints(defaultAddress || '')
        .then(points => setNearbyPoints(points))
        .catch(console.error);
    }
  }, [currentLocation, defaultAddress]);

  const handleLocationFound = async (location: { lat: number; lng: number; display_name: string }) => {
    setCurrentLocation(location);
    onLocationSelect?.(location);

    try {
      localStorage.setItem('lastAddress', location.display_name);
      localStorage.setItem('lastLocation', JSON.stringify({ lat: location.lat, lng: location.lng }));

      const points = await LocationAnalyzer.getNearbyPoints(location.display_name);
      setNearbyPoints(points);
    } catch (error) {
      console.error('Error processing location:', error);
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
      <div className="relative w-full h-[400px] border rounded-md overflow-hidden">
        <MapContainer
          center={center}
          zoom={14}
          className="w-full h-full"
          whenReady={() => setIsLoading(false)}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker 
            position={center}
            icon={defaultIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                handleLocationFound({
                  lat: position.lat,
                  lng: position.lng,
                  display_name: 'Избрана локация'
                });
              },
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium">Избрана локация</div>
                <div className="text-muted-foreground mt-1">
                  Преместете маркера за прецизиране на локацията
                </div>
              </div>
            </Popup>
          </Marker>

          {nearbyPoints.map((point, index) => (
            <Marker
              key={index}
              position={[
                center[0] + (Math.random() - 0.5) * 0.01, // Random offset for visualization
                center[1] + (Math.random() - 0.5) * 0.01
              ]}
              icon={new Icon({
                iconUrl: defaultIcon.options.iconUrl,
                iconSize: [20, 33],
                iconAnchor: [10, 33]
              })}
            >
              <Popup>
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <span>{pointTypeIcons[point.type]}</span>
                    <span className="font-medium">{point.name}</span>
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {point.distance}м разстояние
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          <Circle
            center={center}
            radius={500}
            pathOptions={{ 
              color: 'blue', 
              fillColor: 'blue', 
              fillOpacity: 0.1,
              weight: 1
            }}
          />
          <MapUpdater center={center} points={nearbyPoints} />
        </MapContainer>
      </div>
    </div>
  );
}