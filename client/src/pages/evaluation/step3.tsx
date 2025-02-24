import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Progress } from "@/components/ui/progress";
import { Download, TrendingUp, MapPin, Home, Calendar, Share2, HelpCircle, Info } from "lucide-react";
import jsPDF from 'jspdf';
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { InstructionCard } from "@/components/instruction-card";


interface EvaluationScore {
  locationScore: number;
  conditionScore: number;
  marketScore: number;
  totalScore: number;
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

      pdf.setFontSize(20);
      pdf.setTextColor(0, 51, 102);
      pdf.text('Оценка на имот', 20, 20);

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Оценена стойност: €${estimatedValue.toLocaleString()}`, 20, 40);
      pdf.text(`Обща оценка: ${evaluationScores.totalScore}/100`, 20, 50);

      pdf.setFontSize(12);
      pdf.text('Детайлни оценки:', 20, 70);
      pdf.text(`• Локация: ${evaluationScores.locationScore}/100`, 25, 80);
      pdf.text(`• Състояние: ${evaluationScores.conditionScore}/100`, 25, 90);
      pdf.text(`• Пазарни условия: ${evaluationScores.marketScore}/100`, 25, 100);

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
        text: `Оценена стойност на имота: €${estimatedValue.toLocaleString()}`,
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
                      transition={{ duration: 0.5 }}
                      className="space-y-4 text-center py-8"
                    >
                      <Progress value={45} className="w-full h-2" />
                      <p>Изчисляваме стойността на имота...</p>
                      <p className="text-sm text-gray-500">
                        Моля, изчакайте докато анализираме всички предоставени данни
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-8"
                    >
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-center"
                      >
                        <h3 className="text-3xl font-bold text-[#003366]">
                          €{estimatedValue.toLocaleString()}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                          Оценена стойност на имота
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                      >
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
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
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
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
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
                            <DialogHeader>
                              <DialogTitle>Сподели оценката</DialogTitle>
                              <DialogDescription>
                                Изберете как искате да споделите оценката
                              </DialogDescription>
                            </DialogHeader>
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
                  )}
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
              title="Как да разчетете оценката?"
              description="Анализът включва оценка на локацията, състоянието на имота и текущите пазарни условия. Всеки фактор допринася за крайната оценка."
            />
            <InstructionCard
              icon={<HelpCircle className="h-5 w-5 text-green-500" />}
              title="Какво следва?"
              description="Можете да изтеглите оценката като PDF или да я споделите с други. Препоръчваме периодично обновяване на оценката за по-точни резултати."
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
          <DialogHeader>
            <DialogTitle>Как да разчетете оценката?</DialogTitle>
            <DialogDescription>
              Анализът включва оценка на локацията, състоянието на имота и текущите пазарни условия.
              Можете да изтеглите подробен отчет или да споделите резултатите с други.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}