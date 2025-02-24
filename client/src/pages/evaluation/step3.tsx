import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Download } from "lucide-react";
import jsPDF from 'jspdf';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Step3() {
  // Извличаме propertyId от URL
  const propertyId = new URLSearchParams(window.location.search).get('propertyId');
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
      return;
    }

    // Симулираме изчисление на оценката
    const calculateEvaluation = async () => {
      try {
        const evaluation = {
          propertyId: parseInt(propertyId),
          score: 85,
          estimatedValue: 250000,
          recommendations: [
            'Обмислете малки ремонти за увеличаване на стойността',
            'Локацията на имота е много търсена',
            'Подходящ момент за продажба според пазарните тенденции'
          ]
        };

        const response = await fetch('/api/evaluations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(evaluation)
        });

        if (!response.ok) {
          throw new Error('Failed to create evaluation');
        }

        setScore(85);
        setLoading(false);
      } catch (error) {
        console.error('Error creating evaluation:', error);
        setLoading(false);
      }
    };

    calculateEvaluation();
  }, [propertyId, navigate]);

  const chartData = {
    labels: ['Вашият имот', 'Среден за района'],
    datasets: [
      {
        label: 'Оценена стойност (EUR)',
        data: [250000, 230000],
        backgroundColor: ['#003366', '#4CAF50'],
      },
    ],
  };

  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Заглавие
    pdf.setFontSize(20);
    pdf.setTextColor(0, 51, 102); // #003366
    pdf.text('Homiq - Оценка на имот', 20, 20);

    // Основна информация
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Оценена стойност: €250,000`, 20, 40);
    pdf.text(`Оценка: ${score}/100`, 20, 50);

    // Добавяне на графиката
    if (chartRef.current) {
      const chartImage = chartRef.current.toBase64Image();
      pdf.addImage(chartImage, 'PNG', 20, 60, 170, 100);
    }

    // Препоръки
    pdf.setFontSize(12);
    pdf.text('Препоръки:', 20, 170);
    pdf.text('• Обмислете малки ремонти за увеличаване на стойността', 25, 180);
    pdf.text('• Локацията на имота е много търсена', 25, 190);
    pdf.text('• Подходящ момент за продажба според пазарните тенденции', 25, 200);

    // Постижения
    pdf.text('Постижения:', 20, 220);
    pdf.text('🏆 Първа оценка (100 точки)', 25, 230);
    pdf.text('📄 Document Master (200 точки)', 25, 240);

    // Запазване на PDF
    pdf.save('homiq-оценка.pdf');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Резултати от оценката</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 text-center py-8">
                <Progress value={score} />
                <p>Изчисляваме стойността на имота...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-[#003366]">
                    Оценена стойност: €250,000
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Базирана на текущите пазарни условия и характеристики на имота
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Оценка на имота</h4>
                  <Progress value={score} className="h-4" />
                  <p className="text-sm text-gray-500 mt-1">
                    Вашият имот получава {score}/100 точки базирани на локация, състояние и пазарно търсене
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Сравнение на стойността</h4>
                  <div className="h-[200px]">
                    <Bar ref={chartRef} data={chartData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Постижения</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      Първа оценка
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      100 Homiq точки
                    </Badge>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Препоръки</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Обмислете малки ремонти за увеличаване на стойността</li>
                    <li>Локацията на имота е много търсена</li>
                    <li>Подходящ момент за продажба според пазарните тенденции</li>
                  </ul>
                </div>

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