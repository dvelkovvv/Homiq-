import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, Train, GraduationCap, Building2, Trees, ChevronsRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LocationPoint {
  type: 'transport' | 'education' | 'shopping' | 'leisure';
  name: string;
  distance: number;
  rating?: number;
}

interface LocationAnalysisProps {
  address: string;
  onComplete?: () => void;
}

export function LocationAnalysis({ address, onComplete }: LocationAnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(true);
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [scores, setScores] = useState({
    transport: 0,
    education: 0,
    shopping: 0,
    leisure: 0
  });

  useEffect(() => {
    const analyzeLocation = async () => {
      if (!address) return;

      setLoading(true);
      setAnalyzing(true);

      try {
        // Симулация на получаване на точки на интерес
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockPoints: LocationPoint[] = [
          { type: 'transport', name: 'Метростанция', distance: 250, rating: 4.5 },
          { type: 'education', name: 'Училище', distance: 500, rating: 4.2 },
          { type: 'shopping', name: 'Търговски център', distance: 800, rating: 4.0 },
          { type: 'leisure', name: 'Парк', distance: 400, rating: 4.8 }
        ];
        setPoints(mockPoints);
        setLoading(false);

        // Симулация на анализ на района
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockScores = {
          transport: 8.5,
          education: 7.5,
          shopping: 8.0,
          leisure: 9.0
        };
        setScores(mockScores);
        setAnalyzing(false);

      } catch (error) {
        console.error('Error analyzing location:', error);
        toast({
          title: "Грешка при анализ",
          description: "Не успяхме да анализираме района",
          variant: "destructive"
        });
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
          <div>
            <h3 className="text-sm font-medium mb-4 flex items-center justify-between">
              <span>Близки обекти</span>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </h3>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[72px] rounded-lg border bg-muted/10 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {points.map((point, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                    {point.type === 'transport' && <Train className="h-4 w-4 text-blue-500" />}
                    {point.type === 'education' && <GraduationCap className="h-4 w-4 text-green-500" />}
                    {point.type === 'shopping' && <Building2 className="h-4 w-4 text-purple-500" />}
                    {point.type === 'leisure' && <Trees className="h-4 w-4 text-emerald-500" />}
                    <div className="flex-1">
                      <div className="font-medium">{point.name}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {point.distance}м
                        </span>
                        {point.rating && (
                          <span className="text-sm font-medium text-primary">
                            {point.rating}/5
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4 flex items-center justify-between">
              <span>Оценка на района</span>
              {analyzing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </h3>
            {analyzing ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted/10 rounded animate-pulse" />
                    <div className="h-2 bg-muted/10 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Транспорт</span>
                    <span className="text-sm font-medium">{scores.transport}/10</span>
                  </div>
                  <Progress value={scores.transport * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Образование</span>
                    <span className="text-sm font-medium">{scores.education}/10</span>
                  </div>
                  <Progress value={scores.education * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Търговски обекти</span>
                    <span className="text-sm font-medium">{scores.shopping}/10</span>
                  </div>
                  <Progress value={scores.shopping * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Зелени площи</span>
                    <span className="text-sm font-medium">{scores.leisure}/10</span>
                  </div>
                  <Progress value={scores.leisure * 10} className="h-2" />
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={onComplete}
            disabled={loading || analyzing}
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary"
          >
            {loading || analyzing ? (
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