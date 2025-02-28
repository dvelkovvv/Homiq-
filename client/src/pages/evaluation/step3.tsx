import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { motion } from "framer-motion";
import { ProgressSteps } from "@/components/progress-steps";
import { Home, Calendar, Star, BadgeCheck, Building2, MapPin, TrendingUp, Shield } from "lucide-react";

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
  const [, navigate] = useLocation();

  // Get property data from localStorage with safer parsing
  const propertyData = (() => {
    try {
      return JSON.parse(localStorage.getItem('propertyData') || '{}');
    } catch (e) {
      console.error('Error parsing propertyData:', e);
      return {};
    }
  })();

  const evaluationType = localStorage.getItem('evaluationType') || 'quick';

  // Enhanced mock data
  const mockEvaluation = {
    estimatedValue: Math.floor(Math.random() * (500000 - 100000) + 100000),
    confidence: Math.random() * (0.95 - 0.75) + 0.75,
    currency: "EUR",
    pricePerSqm: Math.floor(Math.random() * (2000 - 1000) + 1000),
    locationScore: 8.5,
    conditionScore: 7.8
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('bg-BG', {
      style: 'currency',
      currency: mockEvaluation.currency,
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-8"
        >
          <div className="hidden sm:block">
            <ProgressSteps steps={STEPS} currentStep={3} />
          </div>

          <Card className="bg-gradient-to-br from-[#003366] to-[#002244] text-white overflow-hidden">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Home className="h-5 w-5 sm:h-6 sm:w-6" />
                Оценка на имота
              </CardTitle>
              <CardDescription className="text-gray-200 text-sm sm:text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Генерирана на {new Date().toLocaleDateString('bg-BG')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 sm:py-8 relative">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-4 right-0 sm:-right-4 bg-green-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2"
                >
                  <BadgeCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                  {evaluationType === 'licensed' ? 'Лицензирана оценка' : 'Бърза оценка'}
                </motion.div>

                <p className="text-4xl sm:text-6xl font-bold mb-2">{formatCurrency(mockEvaluation.estimatedValue)}</p>
                <p className="text-lg sm:text-xl text-gray-200">Приблизителна пазарна стойност</p>

                <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                  <span className="text-base sm:text-lg">
                    {Math.round(mockEvaluation.confidence * 100)}% точност на оценката
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="p-4 bg-white/10 rounded-lg text-center">
                    <Building2 className="h-5 w-5 mx-auto mb-2 text-blue-400" />
                    <div className="text-lg sm:text-xl font-bold">{propertyData.squareMeters}м²</div>
                    <div className="text-sm text-gray-300">Площ</div>
                  </div>

                  <div className="p-4 bg-white/10 rounded-lg text-center">
                    <TrendingUp className="h-5 w-5 mx-auto mb-2 text-green-400" />
                    <div className="text-lg sm:text-xl font-bold">{formatCurrency(mockEvaluation.pricePerSqm)}/м²</div>
                    <div className="text-sm text-gray-300">Цена на кв.м</div>
                  </div>

                  <div className="p-4 bg-white/10 rounded-lg text-center">
                    <MapPin className="h-5 w-5 mx-auto mb-2 text-red-400" />
                    <div className="text-lg sm:text-xl font-bold">{mockEvaluation.locationScore}/10</div>
                    <div className="text-sm text-gray-300">Локация</div>
                  </div>

                  <div className="p-4 bg-white/10 rounded-lg text-center">
                    <Shield className="h-5 w-5 mx-auto mb-2 text-purple-400" />
                    <div className="text-lg sm:text-xl font-bold">{mockEvaluation.conditionScore}/10</div>
                    <div className="text-sm text-gray-300">Състояние</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/evaluation/step2")}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Назад
            </Button>
            <Button
              className="w-full sm:w-auto bg-[#003366] hover:bg-[#002244] order-1 sm:order-2"
              onClick={() => navigate("/dashboard")}
            >
              Към начало
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}