import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export interface LocationPoint {
  type: 'transport' | 'education' | 'shopping' | 'leisure';
  name: string;
  distance: number;
  rating?: number;
}

export interface AreaAnalysis {
  transportScore: number;
  educationScore: number;
  shoppingScore: number;
  leisureScore: number;
  averagePrice: number;
  priceChange: number;
  infrastructureProjects: string[];
}

export class LocationAnalyzer {
  static async getNearbyPoints(address: string, radius: number = 1000): Promise<LocationPoint[]> {
    try {
      const points: LocationPoint[] = [];
      const categories = {
        transport: ['subway_station', 'bus_station', 'train_station'],
        education: ['school', 'university'],
        shopping: ['shopping_mall', 'supermarket'],
        leisure: ['park', 'gym']
      };

      // First get coordinates for the address
      const geocodeResponse = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status !== 'OK' || !geocodeData.results?.[0]?.geometry?.location) {
        throw new Error('Failed to geocode address');
      }

      const location = geocodeData.results[0].geometry.location;
      const locationString = `${location.lat},${location.lng}`;

      // Fetch nearby points for each category
      for (const [type, placeTypes] of Object.entries(categories)) {
        for (const placeType of placeTypes) {
          const response = await fetch(
            `/api/places/nearby?location=${locationString}&type=${placeType}&radius=${radius}`
          );
          const data = await response.json();

          if (data.status === 'OK') {
            for (const place of data.results) {
              points.push({
                type: type as 'transport' | 'education' | 'shopping' | 'leisure',
                name: place.name,
                distance: Math.round(
                  google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(location.lat, location.lng),
                    new google.maps.LatLng(place.geometry.location.lat, place.geometry.location.lng)
                  )
                ),
                rating: place.rating
              });
            }
          }
        }
      }

      return points;
    } catch (error) {
      console.error('Error fetching nearby points:', error);
      toast({
        title: "Грешка при анализ на локацията",
        description: "Не успяхме да заредим информация за околността",
        variant: "destructive"
      });
      return [];
    }
  }

  static async getAreaAnalysis(address: string): Promise<AreaAnalysis> {
    try {
      // Get points
      const points = await this.getNearbyPoints(address);

      // Calculate scores based on nearby points
      const calculateScore = (type: string): number => {
        const typePoints = points.filter(p => p.type === type);
        const baseScore = Math.min(10, typePoints.length * 2);
        const avgRating = typePoints.reduce((acc, p) => acc + (p.rating || 0), 0) / typePoints.length;
        return Math.round((baseScore + (avgRating || 0)) / 2);
      };

      return {
        transportScore: calculateScore('transport'),
        educationScore: calculateScore('education'),
        shoppingScore: calculateScore('shopping'),
        leisureScore: calculateScore('leisure'),
        averagePrice: 2200, // EUR/m² - This should come from a real estate API
        priceChange: 5.2, // % last year - This should come from a real estate API
        infrastructureProjects: [
          'Разширение на метрото',
          'Нов парк',
          'Ремонт на булевард'
        ]
      };
    } catch (error) {
      console.error('Error analyzing area:', error);
      toast({
        title: "Грешка при анализ на района",
        description: "Не успяхме да заредим информация за района",
        variant: "destructive"
      });
      throw error;
    }
  }
}