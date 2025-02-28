import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, Train, GraduationCap, Building2, Trees, ChevronsRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LocationPoint {
  type: 'transport' | 'education' | 'shopping' | 'leisure';
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
      try {
        // Симулираме получаване на данни - в реална ситуация тук ще има API заявка
        const mockPoints: LocationPoint[] = [
          { type: 'transport', name: 'Метростанция', distance: 250 },
          { type: 'education', name: 'Училище', distance: 500 },
          { type: 'shopping', name: 'Търговски център', distance: 800 },
          { type: 'leisure', name: 'Парк', distance: 400 }
        ];

        const mockScores = {
          transport: 8.5,
          education: 7.5,
          shopping: 8.0,
          leisure: 9.0
        };

        setPoints(mockPoints);
        setScores(mockScores);

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

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Анализиране на локацията...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <h3 className="text-sm font-medium mb-4">Близост до ключови обекти</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {points.map((point, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  {point.type === 'transport' && <Train className="h-4 w-4 text-blue-500" />}
                  {point.type === 'education' && <GraduationCap className="h-4 w-4 text-green-500" />}
                  {point.type === 'shopping' && <Building2 className="h-4 w-4 text-purple-500" />}
                  {point.type === 'leisure' && <Trees className="h-4 w-4 text-emerald-500" />}
                  <div>
                    <div className="font-medium">{point.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {point.distance}м
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4">Оценка на района</h3>
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
          </div>

          <Button
            onClick={onComplete}
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary"
          >
            Продължи с оценката
            <ChevronsRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}