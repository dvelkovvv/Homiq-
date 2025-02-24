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

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, TrendingUp, MapPin, Home, Share2, HelpCircle, Info, ArrowUpRight, Banknote, Calendar } from "lucide-react";
import jsPDF from 'jspdf';
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { InstructionCard } from "@/components/instruction-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { format, addMonths } from 'date-fns';
import { bg } from 'date-fns/locale';

interface PropertyAnalysis {
  estimatedValue: number;
  factors: {
    location: number;
    condition: number;
    market: number;
    potential: number;
  };
  priceHistory: { date: string; value: number }[];
  similarProperties: { price: number; distance: number; features: string[] }[];
  forecast: { date: string; optimistic: number; conservative: number }[];
  riskAssessment: {
    score: number;
    factors: { name: string; impact: number }[];
  };
  investmentMetrics: {
    roi: number;
    breakeven: number;
    appreciation: number;
  };
}

function calculatePropertyValue(property: any): PropertyAnalysis {
  // Базова цена според квадратура
  const basePrice = property.squareMeters * 1000;

  // Фактори за корекция
  const locationFactor = 0.9;
  const yearFactor = Math.max(0.7, 1 - (new Date().getFullYear() - property.yearBuilt) / 100);
  const typeFactor = {
    apartment: 1,
    house: 1.2,
    villa: 1.3,
    agricultural: 0.5,
    industrial: 1.5
  }[property.type] || 1;

  const estimatedValue = basePrice * locationFactor * yearFactor * typeFactor;

  // История на цените (12 месеца)
  const priceHistory = Array.from({ length: 12 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const variation = 0.95 + Math.random() * 0.1;
    return {
      date: format(date, 'MMM yyyy', { locale: bg }),
      value: Math.round(estimatedValue * variation)
    };
  });

  // Прогноза за следващите 24 месеца
  const forecast = Array.from({ length: 24 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const trend = 1 + (i * 0.005); // 0.5% месечен ръст
    return {
      date: format(date, 'MMM yyyy', { locale: bg }),
      optimistic: Math.round(estimatedValue * trend * 1.1),
      conservative: Math.round(estimatedValue * trend * 0.9)
    };
  });

  // Подобни имоти
  const similarProperties = Array.from({ length: 5 }).map(() => ({
    price: Math.round(estimatedValue * (0.9 + Math.random() * 0.2)),
    distance: Math.round(1 + Math.random() * 4),
    features: [
      'Сходна квадратура',
      'Близка локация',
      'Подобно състояние',
      'Сходна година на строеж'
    ].sort(() => Math.random() - 0.5).slice(0, 2)
  }));

  return {
    estimatedValue: Math.round(estimatedValue),
    factors: {
      location: Math.round(locationFactor * 100),
      condition: Math.round(yearFactor * 100),
      market: Math.round(typeFactor * 70),
      potential: Math.round((locationFactor + yearFactor + typeFactor) / 3 * 100)
    },
    priceHistory,
    similarProperties,
    forecast,
    riskAssessment: {
      score: Math.round((locationFactor + yearFactor + typeFactor) / 3 * 100),
      factors: [
        { name: 'Пазарна волатилност', impact: Math.round(Math.random() * 30 + 20) },
        { name: 'Инфраструктурно развитие', impact: Math.round(Math.random() * 30 + 40) },
        { name: 'Демографски тенденции', impact: Math.round(Math.random() * 20 + 60) }
      ]
    },
    investmentMetrics: {
      roi: 5.5 + Math.random() * 2,
      breakeven: Math.round(48 + Math.random() * 24),
      appreciation: 3.5 + Math.random() * 1.5
    }
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

      // Заглавна страница
      pdf.setFontSize(24);
      pdf.setTextColor(0, 51, 102);
      pdf.text('Детайлна оценка на имот', 20, 30);

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Изготвено от Homiq', 20, 40);
      pdf.text(`Дата: ${format(new Date(), 'dd.MM.yyyy')}`, 20, 50);

      // Основна информация
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.setTextColor(0, 51, 102);
      pdf.text('Оценка на стойността', 20, 20);

      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`€${analysis?.estimatedValue.toLocaleString() || 0}`, 20, 35);

      // Фактори
      pdf.setFontSize(14);
      pdf.text('Фактори за оценката:', 20, 50);
      pdf.text(`• Локация: ${analysis?.factors.location || 0}/100`, 25, 60);
      pdf.text(`• Състояние: ${analysis?.factors.condition || 0}/100`, 25, 70);
      pdf.text(`• Пазарни условия: ${analysis?.factors.market || 0}/100`, 25, 80);
      pdf.text(`• Потенциал за развитие: ${analysis?.factors.potential || 0}/100`, 25, 90);

      // Инвестиционни метрики
      pdf.text('Инвестиционен анализ:', 20, 110);
      pdf.text(`• Очаквана възвръщаемост: ${analysis?.investmentMetrics.roi.toFixed(1)}% годишно`, 25, 120);
      pdf.text(`• Период на изплащане: ${analysis?.investmentMetrics.breakeven} месеца`, 25, 130);
      pdf.text(`• Очаквано поскъпване: ${analysis?.investmentMetrics.appreciation.toFixed(1)}% годишно`, 25, 140);

      // Рискова оценка
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.setTextColor(0, 51, 102);
      pdf.text('Оценка на риска', 20, 20);

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Обща оценка на риска: ${analysis?.riskAssessment.score || 0}/100`, 20, 35);

      analysis?.riskAssessment.factors.forEach((factor, index) => {
        pdf.text(`• ${factor.name}: ${factor.impact}%`, 25, 50 + index * 10);
      });

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
                  Професионален анализ на стойността на вашия имот
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
                        Анализираме всички фактори за точна оценка
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
                          Оценена пазарна стойност
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="grid grid-cols-2 gap-4"
                      >
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-blue-500" />
                            <div className="flex-1">
                              <p className="font-medium">Локация</p>
                              <Progress value={analysis.factors.location} className="h-2 mt-2" />
                              <p className="text-sm text-gray-500 mt-1">
                                {analysis.factors.location}/100
                              </p>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <Home className="h-5 w-5 text-green-500" />
                            <div className="flex-1">
                              <p className="font-medium">Състояние</p>
                              <Progress value={analysis.factors.condition} className="h-2 mt-2" />
                              <p className="text-sm text-gray-500 mt-1">
                                {analysis.factors.condition}/100
                              </p>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                            <div className="flex-1">
                              <p className="font-medium">Пазар</p>
                              <Progress value={analysis.factors.market} className="h-2 mt-2" />
                              <p className="text-sm text-gray-500 mt-1">
                                {analysis.factors.market}/100
                              </p>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <ArrowUpRight className="h-5 w-5 text-orange-500" />
                            <div className="flex-1">
                              <p className="font-medium">Потенциал</p>
                              <Progress value={analysis.factors.potential} className="h-2 mt-2" />
                              <p className="text-sm text-gray-500 mt-1">
                                {analysis.factors.potential}/100
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                      >
                        <Card className="p-6">
                          <h4 className="font-medium mb-4">Прогноза за развитие на цената</h4>
                          <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={analysis.forecast}>
                                <defs>
                                  <linearGradient id="optimisticGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="conservativeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#003366" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#003366" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="date" 
                                  tick={{ fontSize: 12 }}
                                  interval={2}
                                />
                                <YAxis />
                                <Tooltip />
                                <Area
                                  type="monotone"
                                  dataKey="optimistic"
                                  stroke="#4CAF50"
                                  fill="url(#optimisticGradient)"
                                  strokeWidth={2}
                                  name="Оптимистична"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="conservative"
                                  stroke="#003366"
                                  fill="url(#conservativeGradient)"
                                  strokeWidth={2}
                                  name="Консервативна"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      >
                        <Card className="p-6">
                          <h4 className="font-medium mb-4">Инвестиционни метрики</h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-green-500" />
                                <span>Очаквана възвръщаемост</span>
                              </div>
                              <span className="font-medium">{analysis.investmentMetrics.roi.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                <span>Период на изплащане</span>
                              </div>
                              <span className="font-medium">{analysis.investmentMetrics.breakeven} месеца</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-purple-500" />
                                <span>Очаквано поскъпване</span>
                              </div>
                              <span className="font-medium">{analysis.investmentMetrics.appreciation.toFixed(1)}%</span>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-6">
                          <h4 className="font-medium mb-4">Оценка на риска</h4>
                          <div className="space-y-4">
                            {analysis.riskAssessment.factors.map((factor, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>{factor.name}</span>
                                  <span className="font-medium">{factor.impact}%</span>
                                </div>
                                <Progress value={factor.impact} className="h-2" />
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
                          Изтегли PDF отчет
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
              description="Нашият алгоритъм анализира множество фактори, включително локация, състояние на имота, пазарни тенденции и инвестиционен потенциал за максимално точна оценка."
            />
            <InstructionCard
              icon={<HelpCircle className="h-5 w-5 text-green-500" />}
              title="Как да използвате оценката?"
              description="Разгледайте прогнозите за развитие, инвестиционните метрики и оценката на риска за по-информирано решение. Можете да изтеглите подробен PDF отчет."
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
            Оценката включва детайлен анализ на множество фактори, прогнози за развитие и инвестиционни метрики.
            Разгледайте внимателно всички показатели за по-добро разбиране на стойността и потенциала на имота.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}