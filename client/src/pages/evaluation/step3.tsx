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
  BadgeCheck
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

interface EvaluationMetrics {
  locationScore: number;
  infrastructureScore: number;
  conditionScore: number;
  marketScore: number;
}

interface PriceHistory {
  month: string;
  value: number;
}

export default function Step3() {
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

  // Mock evaluation data
  const mockEvaluation = {
    estimatedValue: Math.floor(Math.random() * (500000 - 100000) + 100000),
    confidence: Math.random() * (0.95 - 0.75) + 0.75,
    currency: "EUR",
    status: "completed",
    metrics: {
      locationScore: 8.5,
      infrastructureScore: 9.0,
      conditionScore: 7.5,
      marketScore: 8.0
    } as EvaluationMetrics
  };

  // Price history data
  const priceHistoryData: PriceHistory[] = [
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
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" />
                  {evaluationType === 'licensed' ? 'Лицензирана оценка' : 'Бърза оценка'}
                </div>

                <p className="text-6xl font-bold mb-2">{formatCurrency(mockEvaluation.estimatedValue)}</p>
                <p className="text-xl text-gray-200">Приблизителна пазарна стойност</p>

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

          <Card>
            <CardHeader>
              <CardTitle>Ценова динамика</CardTitle>
              <CardDescription>Изменение на стойността през последните 6 месеца</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
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

          <Card>
            <CardHeader>
              <CardTitle>Анализ на локацията</CardTitle>
              <CardDescription>Оценка на ключови фактори</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Локация</span>
                    <span className="font-medium">{mockEvaluation.metrics.locationScore * 10}%</span>
                  </div>
                  <Progress value={mockEvaluation.metrics.locationScore * 10} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Инфраструктура</span>
                    <span className="font-medium">{mockEvaluation.metrics.infrastructureScore * 10}%</span>
                  </div>
                  <Progress value={mockEvaluation.metrics.infrastructureScore * 10} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Състояние</span>
                    <span className="font-medium">{mockEvaluation.metrics.conditionScore * 10}%</span>
                  </div>
                  <Progress value={mockEvaluation.metrics.conditionScore * 10} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Пазарни условия</span>
                    <span className="font-medium">{mockEvaluation.metrics.marketScore * 10}%</span>
                  </div>
                  <Progress value={mockEvaluation.metrics.marketScore * 10} />
                </div>
              </div>
            </CardContent>
          </Card>

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