import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressSteps } from "@/components/progress-steps";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, TrendingUp, MapPin, ChartBar, AlertTriangle, Download, Share2, Home } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { toast } from "@/hooks/use-toast";

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

  // Get property data from localStorage
  const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');

  // Mock data based on property type and characteristics
  const mockEvaluation = {
    estimatedValue: Math.floor(Math.random() * (500000 - 100000) + 100000),
    confidence: Math.random() * (0.95 - 0.75) + 0.75,
    currency: "EUR",
    status: "completed",
    marketTrend: "rising",
    locationScore: 8.5,
    investmentRating: "A",
    yearlyAppreciation: 5.2,
    comparableProperties: 12,
    propertyType: propertyData.type || "apartment",
    area: propertyData.squareMeters || 0
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('bg-BG', {
      style: 'currency',
      currency: mockEvaluation.currency,
      maximumFractionDigits: 0
    });
  };

  // Price history data - could be based on real market data later
  const priceHistoryData = [
    { month: "Яну", value: mockEvaluation.estimatedValue * 0.9 },
    { month: "Фев", value: mockEvaluation.estimatedValue * 0.92 },
    { month: "Мар", value: mockEvaluation.estimatedValue * 0.95 },
    { month: "Апр", value: mockEvaluation.estimatedValue * 0.97 },
    { month: "Май", value: mockEvaluation.estimatedValue * 0.98 },
    { month: "Юни", value: mockEvaluation.estimatedValue }
  ];

  const similarPropertiesData = [
    { type: "Текущ имот", value: mockEvaluation.estimatedValue },
    { type: "Среден за района", value: mockEvaluation.estimatedValue * 0.95 },
    { type: "Най-висок", value: mockEvaluation.estimatedValue * 1.25 },
    { type: "Най-нисък", value: mockEvaluation.estimatedValue * 0.75 }
  ];

  const riskFactors = [
    { factor: "Локация", score: 85 },
    { factor: "Състояние", score: 75 },
    { factor: "Ликвидност", score: 90 },
    { factor: "Пазарна стабилност", score: 80 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <ProgressSteps steps={STEPS} currentStep={3} />

          <div className="grid gap-6">
            {/* Main Evaluation Card */}
            <Card className="bg-gradient-to-br from-[#003366] to-[#002244] text-white overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Home className="h-6 w-6" />
                  Оценка на имота
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Генерирана на {new Date().toLocaleDateString('bg-BG')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-5xl font-bold">
                    {formatCurrency(mockEvaluation.estimatedValue)}
                  </p>
                  <p className="text-xl text-gray-200 mt-2">
                    Приблизителна пазарна стойност
                  </p>
                  <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-4xl font-bold">
                        {Math.round(mockEvaluation.confidence * 100)}%
                      </p>
                      <p className="text-sm text-gray-200">Точност на оценката</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold">{mockEvaluation.investmentRating}</p>
                      <p className="text-sm text-gray-200">Инвестиционен рейтинг</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold">{mockEvaluation.area}м²</p>
                      <p className="text-sm text-gray-200">Площ</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold">{mockEvaluation.locationScore}</p>
                      <p className="text-sm text-gray-200">Локация (от 10)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Обобщение</span>
                </TabsTrigger>
                <TabsTrigger value="market" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Пазарен анализ</span>
                </TabsTrigger>
                <TabsTrigger value="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Локация</span>
                </TabsTrigger>
                <TabsTrigger value="comparison" className="flex items-center gap-2">
                  <ChartBar className="h-4 w-4" />
                  <span>Сравнение</span>
                </TabsTrigger>
                <TabsTrigger value="risk" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Риск анализ</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Обобщен анализ</CardTitle>
                    <CardDescription>
                      Основни показатели за имота
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Ключови фактори</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Годишна възвръщаемост</span>
                            <span className="font-semibold text-green-600">
                              +{mockEvaluation.yearlyAppreciation}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Сравними имоти</span>
                            <span className="font-semibold">
                              {mockEvaluation.comparableProperties}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Рейтинг на локацията</span>
                            <span className="font-semibold">
                              {mockEvaluation.locationScore}/10
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold">Пазарни индикатори</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Пазарен тренд</span>
                            <span className="font-semibold text-blue-600">
                              Възходящ
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Ликвидност</span>
                            <span className="font-semibold">Висока</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Инвестиционен потенциал</span>
                            <span className="font-semibold text-green-600">
                              Отличен
                            </span>
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
                    <CardDescription>
                      Динамика на цените в района
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceHistoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location">
                <Card>
                  <CardHeader>
                    <CardTitle>Анализ на локацията</CardTitle>
                    <CardDescription>
                      Фактори на местоположението
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Транспорт</h4>
                        <Progress value={85} className="h-2" />
                        <p className="text-sm text-gray-600 mt-1">Отлична достъпност</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Инфраструктура</h4>
                        <Progress value={90} className="h-2" />
                        <p className="text-sm text-gray-600 mt-1">Много добра</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Удобства</h4>
                        <Progress value={75} className="h-2" />
                        <p className="text-sm text-gray-600 mt-1">Добри</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comparison">
                <Card>
                  <CardHeader>
                    <CardTitle>Сравнителен анализ</CardTitle>
                    <CardDescription>
                      Сравнение с подобни имоти
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={similarPropertiesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#003366" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risk">
                <Card>
                  <CardHeader>
                    <CardTitle>Анализ на риска</CardTitle>
                    <CardDescription>
                      Оценка на рисковите фактори
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {riskFactors.map((factor) => (
                        <div key={factor.factor} className="space-y-2">
                          <div className="flex justify-between">
                            <span>{factor.factor}</span>
                            <span className="font-semibold">{factor.score}%</span>
                          </div>
                          <Progress value={factor.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  // Here we could generate a PDF report
                  toast({
                    title: "Изтегляне на оценка",
                    description: "Започна изтеглянето на оценката във формат PDF.",
                  });
                }}
              >
                <Download className="h-4 w-4" />
                Изтегли оценка
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  // Here we could implement sharing functionality
                  toast({
                    title: "Споделяне",
                    description: "Копиран линк за споделяне.",
                  });
                }}
              >
                <Share2 className="h-4 w-4" />
                Сподели
              </Button>
              <Button
                onClick={() => navigate("/")}
                className="bg-[#003366] hover:bg-[#002244]"
              >
                Към начало
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}