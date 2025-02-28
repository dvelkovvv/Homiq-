import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Train, Trees, ChevronsRight, Loader2, Building } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from 'axios';
import { GoogleMaps } from "./google-maps";

interface LocationPoint {
  type: 'transport' | 'park';
  name: string;
  distance: number;
}

interface LocationData {
  points: LocationPoint[];
  area: number;
  price_range: { min: number; max: number };
  coordinates: { lat: number; lng: number };
}

interface LocationAnalysisProps {
  address: string;
  onComplete?: () => void;
}

export function LocationAnalysis({ address, onComplete }: LocationAnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LocationData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const analyzeLocation = async () => {
      if (!address) return;

      setLoading(true);
      try {
        // Get coordinates
        const { data: geoData } = await axios.get('/api/geocode', {
          params: { address }
        });

        if (!geoData.results?.[0]?.geometry?.location) {
          throw new Error('Не можахме да намерим координатите');
        }

        const { lat, lng } = geoData.results[0].geometry.location;

        // Get nearby points
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

        const points: LocationPoint[] = [];

        if (metroData.data.results?.[0]) {
          points.push({
            type: 'transport',
            name: metroData.data.results[0].name,
            distance: Math.round(metroData.data.results[0].distance || 0)
          });
        }

        if (parksData.data.results?.[0]) {
          points.push({
            type: 'park',
            name: parksData.data.results[0].name,
            distance: Math.round(parksData.data.results[0].distance || 0)
          });
        }

        // Mock data for demonstration
        setData({
          points,
          area: 85,
          price_range: { min: 950, max: 1200 },
          coordinates: { lat, lng }
        });

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

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Анализът е готов",
        description: "Районът е анализиран успешно"
      });

      onComplete?.();
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Възникна проблем при анализа",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

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
          {data?.coordinates && (
            <div className="rounded-lg overflow-hidden border h-[300px]">
              <GoogleMaps
                initialLocation={data.coordinates}
                defaultAddress={address}
              />
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <div className="h-[100px] rounded-lg border bg-muted/10 animate-pulse" />
              <div className="h-[100px] rounded-lg border bg-muted/10 animate-pulse" />
            </div>
          ) : data && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Building className="h-4 w-4 text-primary" />
                      <span className="font-medium">Данни за имота</span>
                    </div>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Площ:</dt>
                        <dd className="font-medium">{data.area} м²</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Ценови диапазон:</dt>
                        <dd className="font-medium">
                          {data.price_range.min} - {data.price_range.max} €/м²
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">Близки обекти</span>
                    </div>
                    <div className="space-y-2">
                      {data.points.map((point, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {point.type === 'transport' ? (
                              <Train className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Trees className="h-4 w-4 text-green-500" />
                            )}
                            <span>{point.name}</span>
                          </div>
                          <span className="text-muted-foreground">{point.distance}м</span>
                        </div>
                      ))}
                      {data.points.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center">
                          Няма намерени обекти в близост
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  variant="outline"
                  className="flex-1"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Анализиране...
                    </>
                  ) : (
                    'Анализирай района'
                  )}
                </Button>

                <Button
                  onClick={onComplete}
                  disabled={analyzing}
                  className="flex-1"
                >
                  Продължи
                  <ChevronsRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}