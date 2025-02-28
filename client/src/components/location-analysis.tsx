import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Train, 
  GraduationCap, 
  Building2, 
  Trees,
  TrendingUp,
  Construction,
  Loader2
} from "lucide-react";
import { LocationAnalyzer, LocationPoint, AreaAnalysis } from "@/lib/location-analysis";
import { GoogleMaps } from "./google-maps";

interface LocationAnalysisProps {
  address: string;
}

export function LocationAnalysis({ address }: LocationAnalysisProps) {
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [analysis, setAnalysis] = useState<AreaAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pointsData, analysisData] = await Promise.all([
          LocationAnalyzer.getNearbyPoints(address),
          LocationAnalyzer.getAreaAnalysis(address)
        ]);
        setPoints(pointsData);
        setAnalysis(analysisData);
      } catch (error) {
        console.error('Error loading location data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      loadData();
    }
  }, [address]);

  if (!address) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-pulse text-muted-foreground mr-2" />
            <span>Анализ на локацията...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Анализ на локацията
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <GoogleMaps 
                defaultAddress={address}
                initialLocation={analysis?.coordinates}
              />
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Близост до ключови локации</h3>
                <div className="space-y-4">
                  {points.map((point, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {point.type === 'transport' && <Train className="h-4 w-4 text-blue-500" />}
                      {point.type === 'education' && <GraduationCap className="h-4 w-4 text-green-500" />}
                      {point.type === 'shopping' && <Building2 className="h-4 w-4 text-purple-500" />}
                      {point.type === 'leisure' && <Trees className="h-4 w-4 text-emerald-500" />}
                      <div>
                        <div className="font-medium">{point.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {point.distance}м разстояние
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {analysis && (
                <div>
                  <h3 className="font-medium mb-4">Оценка на района</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span>Средна цена в района</span>
                        </div>
                        <span className="font-medium">{analysis.averagePrice} €/м²</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {analysis.priceChange > 0 ? '+' : ''}{analysis.priceChange}% за последната година
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Транспорт</span>
                          <span className="text-sm font-medium">{analysis.transportScore}/10</span>
                        </div>
                        <Progress value={analysis.transportScore * 10} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Образование</span>
                          <span className="text-sm font-medium">{analysis.educationScore}/10</span>
                        </div>
                        <Progress value={analysis.educationScore * 10} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Търговски обекти</span>
                          <span className="text-sm font-medium">{analysis.shoppingScore}/10</span>
                        </div>
                        <Progress value={analysis.shoppingScore * 10} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Зелени площи</span>
                          <span className="text-sm font-medium">{analysis.leisureScore}/10</span>
                        </div>
                        <Progress value={analysis.leisureScore * 10} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {analysis?.infrastructureProjects && analysis.infrastructureProjects.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Construction className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Инфраструктурни проекти в района</h4>
                  <ul className="mt-2 space-y-1">
                    {analysis.infrastructureProjects.map((project, index) => (
                      <li key={index} className="text-sm text-blue-700">{project}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}