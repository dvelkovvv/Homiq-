import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { motion } from "framer-motion";
import { ProgressSteps } from "@/components/progress-steps";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Calendar, Star, BadgeCheck, Building2, MapPin, TrendingUp, Shield, ArrowUpCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [, navigate] = useLocation();

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
    conditionScore: 7.8,
    demandLevel: 85
  };

  // Price history data
  const priceHistoryData = [
    { month: "Септ", value: mockEvaluation.estimatedValue * 0.90 },
    { month: "Окт", value: mockEvaluation.estimatedValue * 0.92 },
    { month: "Ное", value: mockEvaluation.estimatedValue * 0.95 },
    { month: "Дек", value: mockEvaluation.estimatedValue * 0.97 },
    { month: "Яну", value: mockEvaluation.estimatedValue * 0.98 },
    { month: "Фев", value: mockEvaluation.estimatedValue }
  ];

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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TabsTrigger value="overview" className="flex items-center gap-2 p-3">
                <Home className="h-5 w-5" />
                Обобщение
              </TabsTrigger>
              <TabsTrigger value="market" className="flex items-center gap-2 p-3">
                <TrendingUp className="h-5 w-5" />
                Пазарен анализ
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-2 p-3">
                <MapPin className="h-5 w-5" />
                Локация
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Ключови показатели</CardTitle>
                  <CardDescription>Обобщена информация за имота</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border">
                        <div className="text-center">
                          <div className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                            <ArrowUpCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="font-semibold text-xl text-green-600">
                            {mockEvaluation.demandLevel}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Ниво на търсене
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border">
                        <div className="text-center">
                          <div className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="font-semibold text-xl text-blue-600">
                            {formatCurrency(mockEvaluation.pricePerSqm)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Цена на кв.м
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border">
                        <div className="text-center">
                          <div className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                            <Building2 className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="font-semibold text-xl text-purple-600">
                            {propertyData.squareMeters}м²
                          </div>
                          <div className="text-sm text-gray-600">
                            Обща площ
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market">
              <Card>
                <CardHeader>
                  <CardTitle>Пазарен анализ</CardTitle>
                  <CardDescription>Динамика на цените през последните 6 месеца</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceHistoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K €`} />
                        <Tooltip
                          formatter={(value: any) => [`${formatCurrency(value)}`, "Стойност"]}
                          labelStyle={{ color: '#666' }}
                          contentStyle={{ background: 'white', border: '1px solid #ddd' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#003366"
                          strokeWidth={2}
                          dot={{ fill: "#003366" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle>Локация и достъпност</CardTitle>
                  <CardDescription>Анализ на местоположението</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground">
                    Предстои скоро...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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