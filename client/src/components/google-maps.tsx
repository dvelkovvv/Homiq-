import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface GoogleMapsProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
}

export function GoogleMaps({ onLocationSelect, initialLocation }: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    // Mock Google Maps with a basic implementation
    const loadMap = async () => {
      const mapDiv = mapRef.current;
      if (!mapDiv) return;

      mapDiv.style.backgroundColor = "#eee";
      mapDiv.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <p class="text-gray-500">Google Maps integration mocked for demo</p>
          <p class="text-sm text-gray-400">Click anywhere to set location</p>
        </div>
      `;

      mapDiv.addEventListener("click", (e) => {
        const rect = mapDiv.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert click to mock coordinates
        const lat = (y / rect.height) * 180 - 90;
        const lng = (x / rect.width) * 360 - 180;
        
        onLocationSelect?.({ lat, lng });
      });
    };

    loadMap();
  }, [onLocationSelect]);

  return (
    <div 
      ref={mapRef}
      className="w-full h-[300px] rounded-md border"
    />
  );
}
