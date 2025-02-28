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

    // Get API configuration
    const configResponse = await fetch('/api/maps/config');
    const { apiKey } = await configResponse.json();

    if (!apiKey) {
      throw new Error('Maps API key not configured');
    }

    // Make the geocoding request
    const geocoder = new google.maps.Geocoder();

    const result = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
      geocoder.geocode(
        { 
          address,
          componentRestrictions: { country: 'BG' },
          language: 'bg'
        },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            resolve(results[0]);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });

    const geoResult = {
      lat: result.geometry.location.lat(),
      lng: result.geometry.location.lng(),
      display_name: result.formatted_address
    };

    // Save to cache
    geocodingCache.set(address, geoResult);

    return geoResult;
  } catch (error) {
    console.error('Geocoding error:', error);

    // Show user-friendly error message
    toast({
      title: "Грешка при търсене на адрес",
      description: "Моля, проверете адреса и опитайте отново",
      variant: "destructive"
    });

    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const geocoder = new google.maps.Geocoder();

    const result = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
      geocoder.geocode(
        { 
          location: { lat, lng },
          language: 'bg'
        },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            resolve(results[0]);
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        }
      );
    });

    return result.formatted_address;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    toast({
      title: "Грешка при определяне на адрес",
      description: "Не успяхме да определим адреса на избраната локация",
      variant: "destructive"
    });
    return null;
  }
}