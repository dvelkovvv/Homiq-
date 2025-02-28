import { toast } from "@/hooks/use-toast";
import axios from 'axios';

interface LocationPoint {
  type: 'transport' | 'park';
  name: string;
  distance: number;
}

interface PropertyData {
  area: number;
  lat: number;
  lng: number;
  metro_distance: number | null;
  green_zones: number;
}

// Calculate distance between two points in meters
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function analyzeLocation(lat: number, lng: number): Promise<PropertyData> {
  try {
    // Get nearby metro stations and parks
    const [metroResponse, parksResponse] = await Promise.all([
      axios.get('/api/places/nearby', {
        params: {
          location: `${lat},${lng}`,
          type: 'subway_station',
          radius: 1500
        }
      }),
      axios.get('/api/places/nearby', {
        params: {
          location: `${lat},${lng}`,
          type: 'park',
          radius: 1000
        }
      })
    ]);

    // Find nearest metro station
    let metro_distance: number | null = null;
    if (metroResponse.data.results?.length > 0) {
      const nearestMetro = metroResponse.data.results[0];
      metro_distance = calculateDistance(
        lat, lng,
        nearestMetro.geometry.location.lat,
        nearestMetro.geometry.location.lng
      );
    }

    // Count green zones
    const green_zones = parksResponse.data.results?.length || 0;

    // Mock area value - in real app this would come from user input or database
    const area = 85;

    return {
      area,
      lat,
      lng,
      metro_distance,
      green_zones
    };
  } catch (error) {
    console.error('Error analyzing location:', error);
    toast({
      title: "Грешка при анализ",
      description: "Не успяхме да анализираме района",
      variant: "destructive"
    });
    throw error;
  }
}