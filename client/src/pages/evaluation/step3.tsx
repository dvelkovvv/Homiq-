import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Progress } from "@/components/ui/progress";
import { Download } from "lucide-react";
import jsPDF from 'jspdf';

export default function Step3() {
  const propertyId = new URLSearchParams(window.location.search).get('propertyId');
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [estimatedValue, setEstimatedValue] = useState(0);

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
      return;
    }

    // Симулираме изчисление на оценката
    const timer = setTimeout(() => {
      setEstimatedValue(250000);
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [propertyId, navigate]);

  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');

    pdf.setFontSize(20);
    pdf.setTextColor(0, 51, 102);
    pdf.text('Оценка на имот', 20, 20);

    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Оценена стойност: €${estimatedValue.toLocaleString()}`, 20, 40);

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
            <CardTitle>Резултат от оценката</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 text-center py-8">
                <Progress value={45} />
                <p>Изчисляваме стойността на имота...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-[#003366]">
                    Оценена стойност: €{estimatedValue.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Базирана на текущите пазарни условия и характеристики на имота
                  </p>
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