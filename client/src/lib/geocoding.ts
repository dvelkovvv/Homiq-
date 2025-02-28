import { toast } from "@/hooks/use-toast";

interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
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

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}&components=country:BG`
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const geoResult = {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        display_name: result.formatted_address
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
      description: "Не успяхме да намерим координатите на този адрес",
      variant: "destructive"
    });
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}&language=bg`
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}