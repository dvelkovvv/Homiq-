import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Progress } from "@/components/ui/progress";
import { Download, TrendingUp, MapPin, Home, Calendar } from "lucide-react";
import jsPDF from 'jspdf';
import { toast } from "@/hooks/use-toast";

interface EvaluationScore {
  locationScore: number;
  conditionScore: number;
  marketScore: number;
  totalScore: number;
}

export default function Step3() {
  const propertyId = new URLSearchParams(window.location.search).get('propertyId');
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [evaluationScores, setEvaluationScores] = useState<EvaluationScore>({
    locationScore: 0,
    conditionScore: 0,
    marketScore: 0,
    totalScore: 0
  });

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
      return;
    }

    // Симулираме изчисление на оценката
    const timer = setTimeout(() => {
      setEstimatedValue(250000);
      setEvaluationScores({
        locationScore: 85,
        conditionScore: 75,
        marketScore: 90,
        totalScore: 83
      });
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [propertyId, navigate]);

  const generatePDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Заглавие
      pdf.setFontSize(20);
      pdf.setTextColor(0, 51, 102);
      pdf.text('Оценка на имот', 20, 20);

      // Основна информация
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Оценена стойност: €${estimatedValue.toLocaleString()}`, 20, 40);
      pdf.text(`Обща оценка: ${evaluationScores.totalScore}/100`, 20, 50);

      // Детайлни оценки
      pdf.setFontSize(12);
      pdf.text('Детайлни оценки:', 20, 70);
      pdf.text(`• Локация: ${evaluationScores.locationScore}/100`, 25, 80);
      pdf.text(`• Състояние: ${evaluationScores.conditionScore}/100`, 25, 90);
      pdf.text(`• Пазарни условия: ${evaluationScores.marketScore}/100`, 25, 100);

      // Дата на оценката
      pdf.setFontSize(10);
      pdf.text(`Дата на оценката: ${new Date().toLocaleDateString('bg-BG')}`, 20, 130);

      pdf.save('homiq-оценка.pdf');

      toast({
        title: "PDF генериран успешно",
        description: "Можете да изтеглите оценката във формат PDF.",
      });
    } catch (error) {
      toast({
        title: "Грешка при генериране на PDF",
        description: "Моля, опитайте отново.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Резултат от оценката</CardTitle>
            <CardDescription>
              Детайлен анализ на стойността на вашия имот
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 text-center py-8">
                <Progress value={45} className="w-full h-2" />
                <p>Изчисляваме стойността на имота...</p>
                <p className="text-sm text-gray-500">
                  Моля, изчакайте докато анализираме всички предоставени данни
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-[#003366]">
                    €{estimatedValue.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Оценена стойност на имота
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Локация</p>
                        <Progress value={evaluationScores.locationScore} className="h-2 mt-2" />
                        <p className="text-sm text-gray-500 mt-1">{evaluationScores.locationScore}/100</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Състояние</p>
                        <Progress value={evaluationScores.conditionScore} className="h-2 mt-2" />
                        <p className="text-sm text-gray-500 mt-1">{evaluationScores.conditionScore}/100</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Пазар</p>
                        <Progress value={evaluationScores.marketScore} className="h-2 mt-2" />
                        <p className="text-sm text-gray-500 mt-1">{evaluationScores.marketScore}/100</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <h4 className="font-medium">Актуалност на оценката</h4>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date().toLocaleDateString('bg-BG')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Оценката е базирана на текущите пазарни условия и може да варира във времето. 
                    Препоръчваме периодично обновяване на оценката за по-точни резултати.
                  </p>
                </Card>

                <Button
                  onClick={generatePDF}
                  className="w-full flex items-center justify-center gap-2 bg-[#4CAF50] hover:bg-[#45a049]"
                >
                  <Download className="h-4 w-4" />
                  Изтегли PDF с оценката
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/evaluation/step2")}>
              Назад
            </Button>
            <Button onClick={() => navigate("/")} className="bg-[#003366] hover:bg-[#002244]">
              Завърши
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}