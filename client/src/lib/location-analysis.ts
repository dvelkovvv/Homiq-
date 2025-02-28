import { toast } from "@/hooks/use-toast";

export interface LocationPoint {
  type: 'transport' | 'education' | 'shopping' | 'leisure';
  name: string;
  distance: number;
  rating?: number;
}

export interface AreaAnalysis {
  averagePrice: number;
  priceChange: number;
  transportScore: number;
  educationScore: number;
  shoppingScore: number;
  leisureScore: number;
  infrastructureProjects: string[];
}

interface PlaceDetails {
  name: string;
  types: string[];
  rating?: number;
  distance: number;
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

      for (const [type, placeTypes] of Object.entries(categories)) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          `location=${encodeURIComponent(address)}` +
          `&radius=${radius}` +
          `&types=${placeTypes.join('|')}` +
          `&key=${process.env.GOOGLE_MAPS_API_KEY}` +
          `&language=bg`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch nearby places');
        }

        const data = await response.json();

        if (data.status === 'OK') {
          for (const place of data.results) {
            points.push({
              type: type as 'transport' | 'education' | 'shopping' | 'leisure',
              name: place.name,
              distance: Math.round(place.distance),
              rating: place.rating
            });
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
        averagePrice: 2200, // EUR/m² - This should come from a real estate API
        priceChange: 5.2, // % last year - This should come from a real estate API
        transportScore: calculateScore('transport'),
        educationScore: calculateScore('education'),
        shoppingScore: calculateScore('shopping'),
        leisureScore: calculateScore('leisure'),
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