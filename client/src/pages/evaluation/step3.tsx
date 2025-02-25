import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressSteps } from "@/components/progress-steps";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2, TrendingUp, MapPin, ChartBar, AlertTriangle,
  Download, Share2, Home, Euro, Calendar, BarChart4,
  ArrowUpCircle, BadgeCheck, Clock, Star, FileText, User, Hash
} from "lucide-react";
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
import { Logo } from "@/components/logo";
import { PropertyReport } from "@/components/property-report";

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
  const evaluationType = localStorage.getItem('evaluationType') || 'quick';
  const propertyType = propertyData.type || "apartment";

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

  // Price history data
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <ProgressSteps steps={STEPS} currentStep={3} />

          <PropertyReport
            propertyData={{
              ...propertyData,
              ...mockEvaluation
            }}
            evaluationType={evaluationType}
          />
          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-[#003366] to-[#002244] text-white overflow-hidden relative">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Home className="h-6 w-6" />
                    Оценка на имота
                  </CardTitle>
                  <CardDescription className="text-gray-200 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Генерирана на {new Date().toLocaleDateString('bg-BG')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 relative">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      <BadgeCheck className="h-4 w-4" />
                      {evaluationType === 'licensed' ? 'Лицензирана оценка' : 'Бърза оценка'}
                    </motion.div>

                    <motion.p
                      className="text-6xl font-bold mb-2"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {formatCurrency(mockEvaluation.estimatedValue)}
                    </motion.p>
                    <p className="text-xl text-gray-200 mb-8">
                      Приблизителна пазарна стойност
                    </p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                      <motion.div
                        className="text-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <div className="mb-2">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-2">
                            <Star className="h-6 w-6 text-yellow-400" />
                          </div>
                        </div>
                        <p className="text-4xl font-bold">
                          {Math.round(mockEvaluation.confidence * 100)}%
                        </p>
                        <p className="text-sm text-gray-200">Точност на оценката</p>
                      </motion.div>

                      <motion.div
                        className="text-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                      >
                        <div className="mb-2">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-2">
                            <BarChart4 className="h-6 w-6 text-green-400" />
                          </div>
                        </div>
                        <p className="text-4xl font-bold">{mockEvaluation.investmentRating}</p>
                        <p className="text-sm text-gray-200">Инвестиционен рейтинг</p>
                      </motion.div>

                      <motion.div
                        className="text-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.0 }}
                      >
                        <div className="mb-2">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-2">
                            <Home className="h-6 w-6 text-blue-400" />
                          </div>
                        </div>
                        <p className="text-4xl font-bold">{mockEvaluation.area}м²</p>
                        <p className="text-sm text-gray-200">Площ</p>
                      </motion.div>

                      <motion.div
                        className="text-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.1 }}
                      >
                        <div className="mb-2">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-2">
                            <MapPin className="h-6 w-6 text-red-400" />
                          </div>
                        </div>
                        <p className="text-4xl font-bold">{mockEvaluation.locationScore}</p>
                        <p className="text-sm text-gray-200">Локация (от 10)</p>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Tabs defaultValue="overview" className="space-y-8">
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border shadow-sm">
                <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  <TabsTrigger
                    value="overview"
                    className="flex items-center gap-3 p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-primary/5 data-[state=active]:text-primary hover:bg-gray-50 transition-all"
                  >
                    <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Обобщение</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="market"
                    className="flex items-center gap-3 p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-50 data-[state=active]:to-blue-50/50 data-[state=active]:text-blue-600 hover:bg-gray-50 transition-all"
                  >
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-lg">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Пазарен анализ</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="location"
                    className="flex items-center gap-3 p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-50 data-[state=active]:to-purple-50/50 data-[state=active]:text-purple-600 hover:bg-gray-50 transition-all"
                  >
                    <div className="p-2 bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-lg">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Локация</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="comparison"
                    className="flex items-center gap-3 p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-50 data-[state=active]:to-green-50/50 data-[state=active]:text-green-600 hover:bg-gray-50 transition-all"
                  >
                    <div className="p-2 bg-gradient-to-br from-green-50 to-green-50/50 rounded-lg">
                      <ChartBar className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Сравнение</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="risk"
                    className="flex items-center gap-3 p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-yellow-50 data-[state=active]:to-yellow-50/50 data-[state=active]:text-yellow-600 hover:bg-gray-50 transition-all"
                  >
                    <div className="p-2 bg-gradient-to-br from-yellow-50 to-yellow-50/50 rounded-lg">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Риск анализ</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="flex items-center gap-3 p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-50 data-[state=active]:to-orange-50/50 data-[state=active]:text-orange-600 hover:bg-gray-50 transition-all"
                  >
                    <div className="p-2 bg-gradient-to-br from-orange-50 to-orange-50/50 rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Документи</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <AnimatePresence mode="wait">
                <TabsContent value="overview">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="grid gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ArrowUpCircle className="h-5 w-5 text-green-500" />
                            Ключови фактори
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border">
                              <div className="text-center">
                                <div className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                                  <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="font-semibold text-xl text-green-600">
                                  +{mockEvaluation.yearlyAppreciation}%
                                </div>
                                <div className="text-sm text-gray-600">
                                  Годишна възвръщаемост
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border">
                              <div className="text-center">
                                <div className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                                  <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="font-semibold text-xl text-blue-600">
                                  {mockEvaluation.comparableProperties}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Сравними имоти
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border">
                              <div className="text-center">
                                <div className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                                  <MapPin className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="font-semibold text-xl text-purple-600">
                                  {mockEvaluation.locationScore}/10
                                </div>
                                <div className="text-sm text-gray-600">
                                  Рейтинг на локацията
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ChartBar className="h-5 w-5 text-blue-500" />
                            Пазарни индикатори
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border">
                              <div className="text-center">
                                <div className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                                  <TrendingUp className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="font-semibold text-lg text-blue-600">
                                  Възходящ
                                </div>
                                <div className="text-sm text-gray-600">
                                  Пазарен тренд
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border">
                              <div className="text-center">
                                <div className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                                  <ArrowUpCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="font-semibold text-lg text-green-600">
                                  Висока
                                </div>
                                <div className="text-sm text-gray-600">
                                  Ликвидност
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-yellow-50 to-white rounded-xl border">
                              <div className="text-center">
                                <div className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100">
                                  <Star className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div className="font-semibold text-lg text-yellow-600">
                                  Отличен
                                </div>
                                <div className="text-sm text-gray-600">
                                  Инвестиционен потенциал
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="market">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Пазарен анализ</CardTitle>
                        <CardDescription>
                          Динамика на цените в района
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={priceHistoryData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                              <XAxis
                                dataKey="month"
                                stroke="#666"
                                tick={{ fill: '#666' }}
                              />
                              <YAxis
                                stroke="#666"
                                tick={{ fill: '#666' }}
                                tickFormatter={(value) => `${value.toLocaleString()} €`}
                              />
                              <Tooltip
                                formatter={(value: any) => [`${value.toLocaleString()} €`, "Стойност"]}
                                labelStyle={{ color: '#666' }}
                                contentStyle={{ background: 'white', border: '1px solid #ddd' }}
                              />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#003366"
                                strokeWidth={3}
                                dot={{ fill: "#003366", strokeWidth: 2 }}
                                activeDot={{ r: 8 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="location">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Анализ на локацията</CardTitle>
                        <CardDescription>
                          Фактори на местоположението
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="p-6 border rounded-xl bg-gradient-to-br from-blue-50 to-white">
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-blue-500" />
                              Транспорт
                            </h4>
                            <Progress value={85} className="h-2 mb-2" />
                            <p className="text-sm text-gray-600">Отлична достъпност</p>
                          </div>
                          <div className="p-6 border rounded-xl bg-gradient-to-br from-green-50 to-white">
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                              <Building2 className="h-5 w-5 text-green-500" />
                              Инфраструктура
                            </h4>
                            <Progress value={90} className="h-2 mb-2" />
                            <p className="text-sm text-gray-600">Много добра</p>
                          </div>
                          <div className="p-6 border rounded-xl bg-gradient-to-br from-purple-50 to-white">
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                              <Home className="h-5 w-5 text-purple-500" />
                              Удобства
                            </h4>
                            <Progress value={75} className="h-2 mb-2" />
                            <p className="text-sm text-gray-600">Добри</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="comparison">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Сравнителен анализ</CardTitle>
                        <CardDescription>
                          Сравнение с подобни имоти
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={similarPropertiesData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                              <XAxis
                                dataKey="type"
                                stroke="#666"
                                tick={{ fill: '#666' }}
                              />
                              <YAxis
                                stroke="#666"
                                tick={{ fill: '#666' }}
                                tickFormatter={(value) => `${value.toLocaleString()} €`}
                              />
                              <Tooltip
                                formatter={(value: any) => [`${value.toLocaleString()} €`, "Стойност"]}
                                labelStyle={{ color: '#666' }}
                                contentStyle={{ background: 'white', border: '1px solid #ddd' }}
                              />
                              <Bar
                                dataKey="value"
                                fill="#003366"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="risk">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Анализ на риска</CardTitle>
                        <CardDescription>
                          Оценка на рисковите фактори
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {riskFactors.map((factor, index) => (
                            <motion.div
                              key={factor.factor}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="space-y-2"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{factor.factor}</span>
                                <span className="font-semibold text-blue-600">{factor.score}%</span>
                              </div>
                              <Progress value={factor.score} className="h-2" />
                              <p className="text-sm text-gray-500">
                                {factor.score >= 80 ? 'Отличен показател' :
                                  factor.score >= 60 ? 'Добър показател' : 'Нуждае се от внимание'}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="documents">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          Информация от документи
                        </CardTitle>
                        <CardDescription>
                          Данни извлечени от сканираните документи
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6">
                          {propertyData.documents?.map((doc: any, index: number) => (
                            <div key={index} className="border rounded-lg p-6 space-y-4">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{doc.type === 'notary_act' ? 'Нотариален акт' :
                                    doc.type === 'sketch' ? 'Скица' : 'Данъчна оценка'}</h4>
                                  {doc.extractedData?.documentDate && (
                                    <p className="text-sm text-muted-foreground">
                                      Дата: {doc.extractedData.documentDate}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                {/* Основна информация */}
                                {doc.extractedData?.owner && (
                                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <div>
                                      <p className="text-sm font-medium">Собственик</p>
                                      <p className="text-sm text-gray-600">{doc.extractedData.owner}</p>
                                    </div>
                                  </div>
                                )}

                                {doc.extractedData?.identifier && (
                                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Hash className="h-4 w-4 text-gray-500" />
                                    <div>
                                      <p className="text-sm font-medium">Идентификатор</p>
                                      <p className="text-sm text-gray-600">{doc.extractedData.identifier}</p>
                                    </div>
                                  </div>
                                )}

                                {doc.extractedData?.squareMeters && (
                                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Building2 className="h-4 w-4 text-gray-500" />
                                    <div>
                                      <p className="text-sm font-medium">Обща площ</p>
                                      <p className="text-sm text-gray-600">{doc.extractedData.squareMeters} кв.м</p>
                                    </div>
                                  </div>
                                )}

                                {doc.extractedData?.address && (
                                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <div>
                                      <p className="text-sm font-medium">Адрес</p>
                                      <p className="text-sm text-gray-600">{doc.extractedData.address}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Данни от нотариален акт */}
                                {doc.type === 'notary_act' && (
                                  <>
                                    {doc.extractedData?.notaryNumber && (
                                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <FileText className="h-4 w-4 text-gray-500" />
                                        <div>
                                          <p className="text-sm font-medium">Номер на акта</p>
                                          <p className="text-sm text-gray-600">{doc.extractedData.notaryNumber}</p>
                                        </div>
                                      </div>
                                    )}

                                    {doc.extractedData?.price && (
                                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <Euro className="h-4 w-4 text-gray-500" />
                                        <div>
                                          <p className="text-sm font-medium">Цена на имота</p>
                                          <p className="text-sm text-gray-600">
                                            {doc.extractedData.price.toLocaleString()} лв.
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                      <User className="h-4 w-4 text-gray-500" />
                                      <div>
                                        <p className="text-sm font-medium">Нотариус</p>
                                        <p className="textsm text-gray-600">{doc.extractedData.notaryName}</p>
                                      </div>
                                    </div>

                                    {doc.extractedData?.boundaries && doc.extractedData.boundaries.length > 0 && (
                                      <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium mb-2">Граници на имота</p>
                                        <ul className="list-disc list-inside text-sm text-gray-600">
                                          {doc.extractedData.boundaries.map((boundary, idx) => (
                                            <li key={idx}>{boundary}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Данни от скица */}
                                {doc.type === 'sketch' && (
                                  <>
                                    {doc.extractedData?.purpose && (
                                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <Building2 className="h-4 w-4 text-gray-500" />
                                        <div>
                                          <p className="text-sm font-medium">Предназначение</p>
                                          <p className="text-sm text-gray-600">{doc.extractedData.purpose}</p>
                                        </div>
                                      </div>
                                    )}

                                    {doc.extractedData?.builtUpArea && (
                                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <Building2 className="h-4 w-4 text-gray-500" />
                                        <div>
                                          <p className="text-sm font-medium">Застроена площ</p>
                                          <p className="text-sm text-gray-600">{doc.extractedData.builtUpArea} кв.м</p>
                                        </div>
                                      </div>
                                    )}

                                    {doc.extractedData?.commonParts && (
                                      <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium">Общи части</p>
                                        <p className="text-sm text-gray-600">{doc.extractedData.commonParts}</p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          ))}

                          {(!propertyData.documents || propertyData.documents.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground">
                              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>Няма сканирани документи</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>

            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
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
                className="bg-[#003366] hover:bg-[#002244] flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Към начало
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}