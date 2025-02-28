import { toast } from "@/hooks/use-toast";

interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
  boundingbox?: [string, string, string, string];
}

// Cache for geocoding requests
const geocodingCache = new Map<string, GeocodingResult>();

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    // Check cache first
    const cachedResult = geocodingCache.get(address);
    if (cachedResult) {
      return cachedResult;
    }

    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=bg`
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      const geoResult = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name,
        boundingbox: result.boundingbox
      };

      // Save to cache
      geocodingCache.set(address, geoResult);

      return geoResult;
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    toast({
      title: "Грешка при търсене на адрес",
      description: "Не успяхме да намерим координатите на този адрес.",
      variant: "destructive"
    });
    return null;
  }
}
