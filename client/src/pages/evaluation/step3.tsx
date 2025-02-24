import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Progress } from "@/components/ui/progress";
import { Download, TrendingUp, MapPin, Home, Calendar, Share2, HelpCircle, Info, CheckCircle2 } from "lucide-react";
import jsPDF from 'jspdf';
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { InstructionCard } from "@/components/instruction-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyzePropertyWithAI } from '@/lib/ai-analysis';
import { Property } from '@shared/schema';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';


interface EvaluationScore {
  locationScore: number;
  conditionScore: number;
  marketScore: number;
  totalScore: number;
}

interface PropertyAnalysis {
  estimatedValue: number;
  confidence: number;
  factors: {
    location: number;
    condition: number;
    market: number;
  };
  marketTrends: { date: string; value: number }[];
  similarProperties: { price: number; distance: number; similarity: number }[];
  recommendations: string[];
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

    const fetchAnalysis = async () => {
      try {
        // TODO: Fetch actual property data from API
        const mockProperty: Property = {
          id: 1,
          type: "apartment",
          address: "Example Street",
          squareMeters: 85,
          yearBuilt: 2010,
          location: { lat: 42.6977, lng: 23.3219 },
          photos: [],
          documents: [],
          createdAt: new Date()
        };

        const result = await analyzePropertyWithAI(mockProperty);
        setAnalysis(result);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analysis:', error);
        toast({
          title: "Грешка при анализа",
          description: "Моля, опитайте отново по-късно.",
          variant: "destructive"
        });
      }
    };

    fetchAnalysis();
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
      pdf.text(`Обща оценка: ${analysis?.factors.location + analysis?.factors.condition + analysis?.factors.market || 0}/300`, 20, 50);

      pdf.setFontSize(12);
      pdf.text('Детайлни оценки:', 20, 70);
      pdf.text(`• Локация: ${analysis?.factors.location || 0}/100`, 25, 80);
      pdf.text(`• Състояние: ${analysis?.factors.condition || 0}/100`, 25, 90);
      pdf.text(`• Пазарни условия: ${analysis?.factors.market || 0}/100`, 25, 100);

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
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>Резултат от оценката</CardTitle>
                <CardDescription>
                  Детайлен AI анализ на стойността на вашия имот
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
                      <p>Анализираме данните за имота...</p>
                      <p className="text-sm text-gray-500">
                        Нашият AI асистент обработва информацията за точна оценка
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
                          <span className="ml-2 text-green-600">
                            ({analysis.confidence * 100}% точност)
                          </span>
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
                          <h4 className="font-medium mb-4">Пазарни тенденции</h4>
                          <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={analysis.marketTrends}>
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
                                <div className="text-right">
                                  <p className="text-sm font-medium text-green-600">
                                    {prop.similarity}% съвпадение
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
                      >
                        <Card className="p-6">
                          <h4 className="font-medium mb-4">Препоръки</h4>
                          <div className="space-y-2">
                            {analysis.recommendations.map((rec, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-gray-600"
                              >
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                <p>{rec}</p>
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
              title="AI Анализ"
              description="Нашият AI анализира множество фактори, включително локация, състояние, пазарни тенденции и подобни имоти в района за максимално точна оценка."
            />
            <InstructionCard
              icon={<HelpCircle className="h-5 w-5 text-green-500" />}
              title="Какво следва?"
              description="Можете да изтеглите подробен отчет в PDF формат или да споделите резултатите с други. Препоръчваме периодично обновяване на оценката."
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
            AI анализът включва оценка на локацията, състоянието на имота и текущите пазарни условия.
            Разгледайте графиките и препоръките за по-добро разбиране на оценката.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}