import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, Train, Trees, ChevronsRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from 'axios';
import { GoogleMaps } from "./google-maps";

interface LocationPoint {
  type: 'transport' | 'park';
  name: string;
  distance: number;
}

interface LocationAnalysisProps {
  address: string;
  onComplete?: () => void;
}

export function LocationAnalysis({ address, onComplete }: LocationAnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const analyzeLocation = async () => {
      if (!address) return;

      setLoading(true);
      try {
        // Получаем координаты адреса
        const { data: geoData } = await axios.get('/api/geocode', {
          params: { address }
        });

        if (!geoData.results?.[0]?.geometry?.location) {
          throw new Error('Не удалось получить координаты');
        }

        const { lat, lng } = geoData.results[0].geometry.location;
        setLocation({ lat, lng });

        // Получаем ближайшие метро и парки
        const [metroData, parksData] = await Promise.all([
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

        const nearbyPoints: LocationPoint[] = [];

        // Добавляем ближайшее метро
        if (metroData.data.results?.[0]) {
          const metro = metroData.data.results[0];
          nearbyPoints.push({
            type: 'transport',
            name: metro.name,
            distance: Math.round(metro.distance)
          });
        }

        // Добавляем ближайший парк
        if (parksData.data.results?.[0]) {
          const park = parksData.data.results[0];
          nearbyPoints.push({
            type: 'park',
            name: park.name,
            distance: Math.round(park.distance)
          });
        }

        setPoints(nearbyPoints);

      } catch (error) {
        console.error('Error analyzing location:', error);
        toast({
          title: "Грешка при анализ",
          description: "Не успяхме да анализираме района",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    analyzeLocation();
  }, [address]);

  if (!address) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Анализ на локацията
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Google Maps */}
          {location && (
            <div className="rounded-lg overflow-hidden border h-[300px]">
              <GoogleMaps
                initialLocation={location}
                defaultAddress={address}
              />
            </div>
          )}

          {/* Близки обекти */}
          <div>
            <h3 className="text-sm font-medium mb-4 flex items-center justify-between">
              <span>Близки обекти</span>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-[72px] rounded-lg border bg-muted/10 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3">
                {points.map((point, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                    {point.type === 'transport' ? (
                      <Train className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Trees className="h-4 w-4 text-green-500" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{point.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {point.distance}м разстояние
                      </div>
                    </div>
                  </div>
                ))}
                {points.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-3">
                    Няма намерени обекти в близост
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Бутон за продължаване */}
          <Button
            onClick={onComplete}
            disabled={loading}
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Анализиране...</span>
              </div>
            ) : (
              <>
                Продължи с оценката
                <ChevronsRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}