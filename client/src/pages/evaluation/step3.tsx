import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/logo";
import { motion } from "framer-motion";
import { ProgressSteps } from "@/components/progress-steps";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  TrendingUp,
  MapPin,
  ChartBar,
  AlertTriangle,
  Home,
  Calendar,
  Star,
  BadgeCheck,
  TrendingDown,
  ArrowUpCircle,
  Bus,
  School,
  ShoppingBag,
  Park
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
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
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

interface PropertyData {
  type: string;
  squareMeters?: number;
  rooms?: number;
  address?: string;
}

interface LocationMetrics {
  transport: number;
  education: number;
  shopping: number;
  recreation: number;
  healthcare: number;
}

interface EvaluationMetrics {
  locationScore: number;
  infrastructureScore: number;
  conditionScore: number;
  marketScore: number;
  locationMetrics: LocationMetrics;
  pricePerSqm: number;
  marketTrend: 'up' | 'down' | 'stable';
  demandLevel: number;
}

interface PriceHistory {
  month: string;
  value: number;
}

interface SimilarProperty {
  address: string;
  price: number;
  squareMeters: number;
  pricePerSqm: number;
  distance: number;
}

export default function Step3() {
  const [activeTab, setActiveTab] = useState("overview");
  const [, navigate] = useLocation();

  // Get property data from localStorage with safer parsing
  const propertyData: PropertyData = (() => {
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
    status: "completed",
    metrics: {
      locationScore: 8.5,
      infrastructureScore: 9.0,
      conditionScore: 7.5,
      marketScore: 8.0,
      locationMetrics: {
        transport: 85,
        education: 90,
        shopping: 75,
        recreation: 80,
        healthcare: 85
      },
      pricePerSqm: 1200,
      marketTrend: 'up',
      demandLevel: 85
    } as EvaluationMetrics
  };

  // Similar properties data
  const similarProperties: SimilarProperty[] = [
    {
      address: "ул. Витоша 45",
      price: mockEvaluation.estimatedValue * 0.95,
      squareMeters: 85,
      pricePerSqm: 1150,
      distance: 0.5
    },
    {
      address: "бул. България 72",
      price: mockEvaluation.estimatedValue * 1.05,
      squareMeters: 90,
      pricePerSqm: 1250,
      distance: 0.8
    },
    {
      address: "ул. Граф Игнатиев 12",
      price: mockEvaluation.estimatedValue * 1.1,
      squareMeters: 95,
      pricePerSqm: 1300,
      distance: 1.2
    }
  ];

  // Price history data
  const priceHistoryData: PriceHistory[] = [
    { month: "Септ", value: mockEvaluation.estimatedValue * 0.90 },
    { month: "Окт", value: mockEvaluation.estimatedValue * 0.92 },
    { month: "Ное", value: mockEvaluation.estimatedValue * 0.95 },
    { month: "Дек", value: mockEvaluation.estimatedValue * 0.97 },
    { month: "Яну", value: mockEvaluation.estimatedValue * 0.98 },
    { month: "Фев", value: mockEvaluation.estimatedValue }
  ];

  // Location metrics for radar chart
  const locationMetricsData = [
    { subject: 'Транспорт', value: mockEvaluation.metrics.locationMetrics.transport },
    { subject: 'Образование', value: mockEvaluation.metrics.locationMetrics.education },
    { subject: 'Магазини', value: mockEvaluation.metrics.locationMetrics.shopping },
    { subject: 'Отдих', value: mockEvaluation.metrics.locationMetrics.recreation },
    { subject: 'Здраве', value: mockEvaluation.metrics.locationMetrics.healthcare }
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

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <ProgressSteps steps={STEPS} currentStep={3} />

          <Card className="bg-gradient-to-br from-[#003366] to-[#002244] text-white overflow-hidden">
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
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  <BadgeCheck className="h-4 w-4" />
                  {evaluationType === 'licensed' ? 'Лицензирана оценка' : 'Бърза оценка'}
                </motion.div>

                <p className="text-6xl font-bold mb-2">{formatCurrency(mockEvaluation.estimatedValue)}</p>
                <p className="text-xl text-gray-200">Приблизителна пазарна стойност</p>
                <p className="text-sm text-gray-300 mt-2">
                  {formatCurrency(mockEvaluation.metrics.pricePerSqm)}/м²
                </p>

                <div className="mt-8 flex items-center justify-center gap-2">
                  <Star className="h-6 w-6 text-yellow-400" />
                  <span className="text-lg">
                    {Math.round(mockEvaluation.confidence * 100)}% точност на оценката
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <div className="p-4 bg-white/10 rounded-lg text-center">
                  <Building2 className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-2xl font-bold">{propertyData.squareMeters}м²</div>
                  <div className="text-sm text-gray-300">Площ</div>
                </div>

                <div className="p-4 bg-white/10 rounded-lg text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2 text-red-400" />
                  <div className="text-2xl font-bold">{mockEvaluation.metrics.locationScore}</div>
                  <div className="text-sm text-gray-300">Локация</div>
                </div>

                <div className="p-4 bg-white/10 rounded-lg text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-400" />
                  <div className="text-2xl font-bold">{mockEvaluation.metrics.marketScore}</div>
                  <div className="text-sm text-gray-300">Пазарен индекс</div>
                </div>

                <div className="p-4 bg-white/10 rounded-lg text-center">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                  <div className="text-2xl font-bold">{mockEvaluation.metrics.conditionScore}</div>
                  <div className="text-sm text-gray-300">Състояние</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TabsTrigger value="overview" className="flex items-center gap-2 p-3">
                <Home className="h-5 w-5" />
                Обобщение
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-2 p-3">
                <MapPin className="h-5 w-5" />
                Локация
              </TabsTrigger>
              <TabsTrigger value="market" className="flex items-center gap-2 p-3">
                <TrendingUp className="h-5 w-5" />
                Пазар
              </TabsTrigger>
              <TabsTrigger value="similar" className="flex items-center gap-2 p-3">
                <Building2 className="h-5 w-5" />
                Сравнение
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Обобщена информация</CardTitle>
                  <CardDescription>Основни показатели за имота</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border">
                        <div className="text-center">
                          <div className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                            <ArrowUpCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="font-semibold text-xl text-green-600">
                            {mockEvaluation.metrics.demandLevel}%
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
                            {formatCurrency(mockEvaluation.metrics.pricePerSqm)}
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
                            {similarProperties.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Сравними имоти
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle>Анализ на локацията</CardTitle>
                  <CardDescription>Детайлна оценка на местоположението</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                        <Bus className="h-6 w-6 text-blue-500" />
                        <div>
                          <h4 className="font-medium">Транспорт</h4>
                          <Progress value={mockEvaluation.metrics.locationMetrics.transport} className="mt-2" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                        <School className="h-6 w-6 text-green-500" />
                        <div>
                          <h4 className="font-medium">Образование</h4>
                          <Progress value={mockEvaluation.metrics.locationMetrics.education} className="mt-2" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                        <ShoppingBag className="h-6 w-6 text-purple-500" />
                        <div>
                          <h4 className="font-medium">Търговски обекти</h4>
                          <Progress value={mockEvaluation.metrics.locationMetrics.shopping} className="mt-2" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                        <Park className="h-6 w-6 text-yellow-500" />
                        <div>
                          <h4 className="font-medium">Зони за отдих</h4>
                          <Progress value={mockEvaluation.metrics.locationMetrics.recreation} className="mt-2" />
                        </div>
                      </div>
                    </div>

                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={locationMetricsData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis domain={[0, 100]} />
                          <Radar
                            name="Оценка"
                            dataKey="value"
                            stroke="#003366"
                            fill="#003366"
                            fillOpacity={0.6}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
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
                  <div className="h-[400px]">
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

            <TabsContent value="similar">
              <Card>
                <CardHeader>
                  <CardTitle>Сравними имоти</CardTitle>
                  <CardDescription>Анализ на подобни имоти в района</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {similarProperties.map((property, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{property.address}</h4>
                            <p className="text-sm text-gray-500">
                              {property.squareMeters}м² • {property.distance}км от имота
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(property.price)}</p>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(property.pricePerSqm)}/м²
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/evaluation/step2")}>
              Назад
            </Button>
            <Button
              className="bg-[#003366] hover:bg-[#002244]"
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