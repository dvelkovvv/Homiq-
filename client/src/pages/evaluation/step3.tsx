import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, FileText, Images, MapPin, BarChart3, Download, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { motion } from "framer-motion";
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

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
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get('propertyId');

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
      return;
    }

    // Симулираме зареждане
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, [propertyId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Progress value={30} className="w-60 h-2 mb-4" />
          <p className="text-gray-500">Зареждане на данни...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px] text-center">
          <CardHeader>
            <CardTitle className="text-red-500">Грешка</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={() => navigate('/evaluation/step1')}
              className="mt-4"
            >
              Към начало
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Оценка на имота
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Подробен анализ и оценка базирани на предоставените данни и пазарни тенденции
            </p>
          </header>

          <ProgressSteps steps={STEPS} currentStep={2} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Анализ на документите
                  </CardTitle>
                  <CardDescription>
                    Детайлна информация извлечена от предоставените документи
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="property" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 gap-2 bg-gray-50/50 p-1 rounded-lg">
                      <TabsTrigger value="property">
                        <Building2 className="h-5 w-5 mr-2" />
                        Имот
                      </TabsTrigger>
                      <TabsTrigger value="legal">
                        <FileText className="h-5 w-5 mr-2" />
                        Правен статус
                      </TabsTrigger>
                      <TabsTrigger value="location">
                        <MapPin className="h-5 w-5 mr-2" />
                        Локация
                      </TabsTrigger>
                      <TabsTrigger value="market">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Пазар
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="property">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-white rounded-lg shadow">
                          <h3 className="font-medium mb-4">Основна информация</h3>
                          <div className="space-y-2">
                            <p>Площ: 85 кв.м.</p>
                            <p>Етаж: 4 от 6</p>
                            <p>Брой стаи: 3</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="legal">
                      <div className="p-4 bg-white rounded-lg shadow">
                        <h3 className="font-medium mb-4">Правен статус</h3>
                        <div className="space-y-2">
                          <p>Собственост: Частна</p>
                          <p>Година на строителство: 2018</p>
                          <p>Тип строителство: Тухла</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="location">
                      <div className="p-4 bg-white rounded-lg shadow">
                        <h3 className="font-medium mb-4">Локация</h3>
                        <div className="space-y-2">
                          <p>Адрес: ул. Примерна 123, София</p>
                          <p>Квартал: Център</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="market">
                      <div className="p-4 bg-white rounded-lg shadow">
                        <h3 className="font-medium mb-4">Пазарни данни</h3>
                        <div className="space-y-2">
                          <p>Средна цена в района: €2000/кв.м.</p>
                          <p>Тенденция: Възходяща</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-8 overflow-hidden border border-gray-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle>Оценка на имота</CardTitle>
                  <CardDescription>
                    Изчислена на база предоставените данни
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center mb-8">
                    <p className="text-3xl font-bold text-primary">
                      €250,000
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Приблизителна пазарна стойност
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button className="w-full" onClick={() => toast({ title: "PDF генериран" })}>
                      <Download className="h-4 w-4 mr-2" />
                      Изтегли оценка
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Сподели
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}