import axios from 'axios';
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
    if (!address.trim()) {
      toast({
        title: "Моля, въведете адрес",
        description: "Адресното поле не може да бъде празно",
        variant: "destructive"
      });
      return null;
    }

    // Check cache first
    const cachedResult = geocodingCache.get(address);
    if (cachedResult) {
      return cachedResult;
    }

    // Get API configuration
    const { data: config } = await axios.get('/api/maps/config');
    if (!config.apiKey) {
      throw new Error('Maps API key not configured');
    }

    // Make the geocoding request through our backend proxy
    const { data } = await axios.get('/api/geocode', {
      params: {
        address: address
      }
    });

    if (data.status === 'OK' && data.results?.[0]) {
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

    toast({
      title: "Адресът не е намерен",
      description: "Моля, опитайте с по-точен адрес",
      variant: "destructive"
    });

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    toast({
      title: "Грешка при търсене на адрес",
      description: error.response?.data?.error || "Моля, опитайте отново по-късно",
      variant: "destructive"
    });
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const { data } = await axios.get('/api/geocode', {
      params: { latlng: `${lat},${lng}` }
    });

    if (data.status === 'OK' && data.results?.[0]) {
      return data.results[0].formatted_address;
    }

    return null;
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