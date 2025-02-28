import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Circle, InfoWindow } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";
import { AddressSearch } from "./address-search";
import { LocationAnalyzer, LocationPoint } from "@/lib/location-analysis";

const containerStyle = {
  width: '100%',
  height: '400px'
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

const markerIcons = {
  transport: "🚇",
  education: "🎓",
  shopping: "🏬",
  leisure: "🌳"
};

export function GoogleMaps({ onLocationSelect, initialLocation, defaultAddress }: GoogleMapsProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<LocationPoint | null>(null);
  const [nearbyPoints, setNearbyPoints] = useState<LocationPoint[]>([]);
  const [center, setCenter] = useState(initialLocation || defaultCenter);
  const [error, setError] = useState<string | null>(null);
  const [loadingPoints, setLoadingPoints] = useState(false);

  useEffect(() => {
    if (defaultAddress) {
      setLoadingPoints(true);
      LocationAnalyzer.getNearbyPoints(defaultAddress)
        .then(points => {
          setNearbyPoints(points);
          setLoadingPoints(false);
        })
        .catch(error => {
          console.error('Error loading nearby points:', error);
          setError("Грешка при зареждане на точките на интерес");
          setLoadingPoints(false);
        });
    }
  }, [defaultAddress]);

  const handleMapLoad = (map: google.maps.Map) => {
    setMap(map);
    // Set custom map options after load
    map.setOptions({
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
    });
  };

  const handleMapUnmount = () => {
    setMap(null);
  };

  const handleLocationFound = async (location: { lat: number; lng: number; display_name: string }) => {
    setCenter({ lat: location.lat, lng: location.lng });
    onLocationSelect?.({ lat: location.lat, lng: location.lng });

    try {
      localStorage.setItem('lastAddress', location.display_name);
      localStorage.setItem('lastLocation', JSON.stringify({ lat: location.lat, lng: location.lng }));

      setLoadingPoints(true);
      const points = await LocationAnalyzer.getNearbyPoints(location.display_name);
      setNearbyPoints(points);
      setLoadingPoints(false);
    } catch (error) {
      console.error('Error processing location:', error);
      setError("Грешка при обработка на локацията");
      setLoadingPoints(false);
    }
  };

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-md border flex items-center justify-center bg-destructive/5">
        <div className="text-center">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">Моля, опитайте отново по-късно</p>
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
      <div className="relative w-full h-[400px] border rounded-md overflow-hidden">
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          language="bg"
          libraries={["places", "geometry"]}
          loadingElement={
            <div className="w-full h-[400px] flex items-center justify-center bg-accent/5">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Зареждане на картата...</p>
              </div>
            </div>
          }
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
            onLoad={handleMapLoad}
            onUnmount={handleMapUnmount}
          >
            <Marker
              position={center}
              draggable={true}
              onDragEnd={(e) => {
                if (e.latLng) {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();
                  handleLocationFound({
                    lat,
                    lng,
                    display_name: 'Избрана локация'
                  });
                }
              }}
            >
              <InfoWindow>
                <div className="text-sm">
                  <div className="font-medium">Избрана локация</div>
                  <div className="text-muted-foreground mt-1">
                    Преместете маркера за прецизиране на локацията
                  </div>
                </div>
              </InfoWindow>
            </Marker>

            {!loadingPoints && nearbyPoints.map((point, index) => {
              const position = {
                lat: center.lat + (Math.random() - 0.5) * 0.01,
                lng: center.lng + (Math.random() - 0.5) * 0.01
              };

              return (
                <Marker
                  key={index}
                  position={position}
                  icon={{
                    url: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><text y="18">${markerIcons[point.type]}</text></svg>`,
                    anchor: new google.maps.Point(12, 12),
                  }}
                  onClick={() => setSelectedMarker(point)}
                >
                  {selectedMarker === point && (
                    <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <span>{markerIcons[point.type]}</span>
                          <span className="font-medium">{point.name}</span>
                        </div>
                        <div className="text-muted-foreground mt-1">
                          {point.distance}м разстояние
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              );
            })}

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
      </div>
    </div>
  );
}