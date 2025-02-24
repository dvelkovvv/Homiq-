import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Progress } from "@/components/ui/progress";
import { Download, TrendingUp, MapPin, Home, Share2, HelpCircle, Info } from "lucide-react";
import jsPDF from 'jspdf';
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { InstructionCard } from "@/components/instruction-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

interface PropertyAnalysis {
  estimatedValue: number;
  factors: {
    location: number;
    condition: number;
    market: number;
  };
  priceHistory: { date: string; value: number }[];
  similarProperties: { price: number; distance: number }[];
}

const STEPS = [
  {
    title: "Основна информация",
    description: "Въведете детайли за имота"
  },
  {
    title: "Медия файлове",
    description: "Качете снимки и документи"
  },
  {
    title: "Оценка",
    description: "Преглед на резултатите"
  }
];

function calculatePropertyValue(property: any): PropertyAnalysis {
  // Базова цена според квадратура (примерно 1000 евро на кв.м)
  const basePrice = property.squareMeters * 1000;

  // Фактори за корекция
  const locationFactor = 0.9; // Базирано на местоположението
  const yearFactor = Math.max(0.7, 1 - (new Date().getFullYear() - property.yearBuilt) / 100);
  const typeFactor = {
    apartment: 1,
    house: 1.2,
    villa: 1.3,
    agricultural: 0.5,
    industrial: 1.5
  }[property.type] || 1;

  const estimatedValue = basePrice * locationFactor * yearFactor * typeFactor;

  // Генериране на история на цените (последните 6 месеца)
  const priceHistory = Array.from({ length: 6 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const variation = 0.95 + Math.random() * 0.1; // ±5% вариация
    return {
      date: format(date, 'MMM yyyy', { locale: bg }),
      value: Math.round(estimatedValue * variation)
    };
  });

  // Подобни имоти (3-5 имота)
  const similarCount = 3 + Math.floor(Math.random() * 3);
  const similarProperties = Array.from({ length: similarCount }).map(() => ({
    price: Math.round(estimatedValue * (0.9 + Math.random() * 0.2)),
    distance: Math.round(1 + Math.random() * 4)
  }));

  return {
    estimatedValue: Math.round(estimatedValue),
    factors: {
      location: Math.round(locationFactor * 100),
      condition: Math.round(yearFactor * 100),
      market: Math.round(typeFactor * 70)
    },
    priceHistory,
    similarProperties
  };
}

export default function Step3() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<PropertyAnalysis | null>(null);
  const propertyId = new URLSearchParams(window.location.search).get('propertyId');
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
      return;
    }

    // Симулираме зареждане на данни
    const timer = setTimeout(() => {
      const mockProperty = {
        type: "apartment",
        squareMeters: 85,
        yearBuilt: 2010,
        location: { lat: 42.6977, lng: 23.3219 }
      };

      const result = calculatePropertyValue(mockProperty);
      setAnalysis(result);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [propertyId, navigate]);

  const generatePDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');

      pdf.setFontSize(20);
      pdf.setTextColor(0, 51, 102);
      pdf.text('Оценка на имот', 20, 20);

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Оценена стойност: €${analysis?.estimatedValue.toLocaleString() || 0}`, 20, 40);

      pdf.setFontSize(12);
      pdf.text('Фактори за оценката:', 20, 60);
      pdf.text(`• Локация: ${analysis?.factors.location || 0}/100`, 25, 70);
      pdf.text(`• Състояние: ${analysis?.factors.condition || 0}/100`, 25, 80);
      pdf.text(`• Пазарни условия: ${analysis?.factors.market || 0}/100`, 25, 90);

      pdf.setFontSize(10);
      pdf.text(`Дата на оценката: ${new Date().toLocaleDateString('bg-BG')}`, 20, 120);

      pdf.save('оценка-на-имот.pdf');

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

  const shareEvaluation = async () => {
    try {
      await navigator.share({
        title: 'Оценка на имот',
        text: `Оценена стойност на имота: €${analysis?.estimatedValue.toLocaleString() || 0}`,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ProgressSteps currentStep={3} steps={STEPS} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>Резултат от оценката</CardTitle>
                <CardDescription>
                  Детайлен анализ на стойността на вашия имот
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 text-center py-8"
                    >
                      <Progress value={45} className="w-full h-2" />
                      <p>Изчисляваме стойността на имота...</p>
                      <p className="text-sm text-gray-500">
                        Анализираме предоставената информация
                      </p>
                    </motion.div>
                  ) : analysis ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-8"
                    >
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="text-center"
                      >
                        <h3 className="text-3xl font-bold text-[#003366]">
                          €{analysis.estimatedValue.toLocaleString()}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                          Оценена стойност на имота
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                      >
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-medium">Локация</p>
                              <Progress value={analysis.factors.location} className="h-2 mt-2" />
                              <p className="text-sm text-gray-500 mt-1">{analysis.factors.location}/100</p>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <Home className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium">Състояние</p>
                              <Progress value={analysis.factors.condition} className="h-2 mt-2" />
                              <p className="text-sm text-gray-500 mt-1">{analysis.factors.condition}/100</p>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                            <div>
                              <p className="font-medium">Пазар</p>
                              <Progress value={analysis.factors.market} className="h-2 mt-2" />
                              <p className="text-sm text-gray-500 mt-1">{analysis.factors.market}/100</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                      >
                        <Card className="p-6">
                          <h4 className="font-medium mb-4">История на цените</h4>
                          <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={analysis.priceHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#003366"
                                  strokeWidth={2}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                      >
                        <Card className="p-6">
                          <h4 className="font-medium mb-4">Подобни имоти в района</h4>
                          <div className="space-y-4">
                            {analysis.similarProperties.map((prop, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">€{prop.price.toLocaleString()}</p>
                                  <p className="text-sm text-gray-500">
                                    на {prop.distance} км разстояние
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col sm:flex-row gap-4"
                      >
                        <Button
                          onClick={generatePDF}
                          className="flex-1 bg-[#4CAF50] hover:bg-[#45a049]"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Изтегли PDF
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1">
                              <Share2 className="h-4 w-4 mr-2" />
                              Сподели оценката
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogTitle>Сподели оценката</DialogTitle>
                            <DialogDescription>
                              Изберете как искате да споделите оценката
                            </DialogDescription>
                            <div className="grid gap-4 py-4">
                              <Button onClick={shareEvaluation} className="w-full">
                                Сподели чрез системата за споделяне
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  navigator.clipboard.writeText(window.location.href);
                                  toast({
                                    title: "Копирано",
                                    description: "Линкът е копиран в клипборда",
                                  });
                                }}
                                className="w-full"
                              >
                                Копирай линк
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </motion.div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
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
          </motion.div>

          <div className="hidden lg:block space-y-4">
            <InstructionCard
              icon={<Info className="h-5 w-5 text-blue-500" />}
              title="Как се изчислява оценката?"
              description="Оценката се базира на множество фактори, включително локация, състояние на имота и текущи пазарни условия."
            />
            <InstructionCard
              icon={<HelpCircle className="h-5 w-5 text-green-500" />}
              title="Какво следва?"
              description="Можете да изтеглите подробен отчет в PDF формат или да споделите резултатите с други."
            />
          </div>
        </div>
      </main>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 md:hidden rounded-full h-12 w-12 bg-primary shadow-lg"
            size="icon"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Как да разчетете оценката?</DialogTitle>
          <DialogDescription>
            Оценката включва анализ на локацията, състоянието на имота и текущите пазарни условия.
            Разгледайте графиките и сравнителния анализ за по-добро разбиране.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}