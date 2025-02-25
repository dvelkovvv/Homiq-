import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoorClosed, Utensils, Sofa, Bath, Bed, Warehouse, Trees, Factory, Download, TrendingUp, MapPin, Home, Share2, HelpCircle, Info, ArrowUpRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { motion } from "framer-motion";
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { InstructionCard } from "@/components/instruction-card";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const RESIDENTIAL_ROOM_TYPES = [
  { id: "entrance", name: "Входна врата", icon: DoorClosed },
  { id: "kitchen", name: "Кухня", icon: Utensils },
  { id: "living", name: "Хол", icon: Sofa },
  { id: "bathroom", name: "Баня", icon: Bath },
  { id: "bedroom", name: "Спалня", icon: Bed }
];

const INDUSTRIAL_ROOM_TYPES = [
  { id: "production", name: "Производствена зона", icon: Factory },
  { id: "storage", name: "Складова зона", icon: Warehouse },
  { id: "loading", name: "Товаро-разтоварна зона", icon: Warehouse },
  { id: "office", name: "Офис част", icon: DoorClosed }
];

const AGRICULTURAL_ROOM_TYPES = [
  { id: "field", name: "Обработваема земя", icon: Trees },
  { id: "irrigation", name: "Напоителна система", icon: Factory },
  { id: "storage", name: "Складови съоръжения", icon: Warehouse }
];

const DOCUMENT_TYPES = {
  sketch: "Скица",
  notary_act: "Нотариален акт",
  tax_assessment: "Данъчна оценка",
  other: "Други документи"
};

interface ExtractedPropertyData {
  squareMeters?: number;
  constructionYear?: number;
  address?: string;
  taxAssessment?: number;
  constructionType?: string;
}

interface PropertyAnalysis {
  estimatedValue: number;
  factors: {
    location: number;
    condition: number;
    market: number;
    potential: number;
  };
  priceHistory: { date: string; value: number }[];
  similarProperties: {
    price: number;
    distance: number;
    features: string[];
    prediction: {
      oneYear: number;
      threeYears: number;
      fiveYears: number;
    };
  }[];
  forecast: {
    date: string;
    optimistic: number;
    conservative: number;
    marketTrend: number;
  }[];
  riskAssessment: {
    score: number;
    factors: { name: string; impact: number; details?: string }[];
    marketVolatility: number;
    economicFactors: {
      interestRates: number;
      economicGrowth: number;
      inflation: number;
    };
  };
  investmentMetrics: {
    roi: number;
    breakeven: number;
    appreciation: number;
    rentalYield: number;
    cashFlow: {
      monthly: number;
      annual: number;
    };
    investmentScenarios: {
      conservative: {
        returnRate: number;
        totalReturn: number;
        timeline: number;
      };
      moderate: {
        returnRate: number;
        totalReturn: number;
        timeline: number;
      };
      aggressive: {
        returnRate: number;
        totalReturn: number;
        timeline: number;
      };
    };
  };
  neighborhoodAnalysis: {
    score: number;
    amenities: {
      type: string;
      distance: number;
      impact: number;
    }[];
    development: {
      planned: string[];
      impact: number;
    };
    demographics: {
      population: number;
      growth: number;
      income: number;
    };
  };
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
  const [propertyData, setPropertyData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get('propertyId');
  const propertyType = params.get('type') || 'apartment';
  const evaluationType = params.get('evaluationType') || 'quick';

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
      return;
    }

    try {
      // Parse data from URL
      const roomPhotosParam = params.get('roomPhotos');
      const documentsParam = params.get('documents');
      const extractedDataParam = params.get('extractedData');

      const data: any = {};

      if (roomPhotosParam) {
        try {
          data.roomPhotos = JSON.parse(roomPhotosParam);
        } catch (error) {
          console.error('Error parsing room photos:', error);
          toast({
            title: "Грешка при обработка на снимките",
            description: "Моля, опитайте отново",
            variant: "destructive"
          });
        }
      }

      if (documentsParam) {
        try {
          data.documents = JSON.parse(documentsParam);
        } catch (error) {
          console.error('Error parsing documents:', error);
          toast({
            title: "Грешка при обработка на документите",
            description: "Моля, опитайте отново",
            variant: "destructive"
          });
        }
      }

      if (extractedDataParam) {
        try {
          data.extractedData = JSON.parse(extractedDataParam);
        } catch (error) {
          console.error('Error parsing extracted data:', error);
          toast({
            title: "Грешка при обработка на данните",
            description: "Моля, опитайте отново",
            variant: "destructive"
          });
        }
      }

      setPropertyData(data);

      // Simulate API call
      setTimeout(() => {
        setAnalysis({
          estimatedValue: 250000,
          factors: {
            location: 85,
            condition: 75,
            market: 80,
            potential: 82
          },
          priceHistory: Array.from({ length: 12 }).map((_, i) => ({
            date: format(new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000), 'MMM yyyy', { locale: bg }),
            value: 250000 // Placeholder value
          })),
          similarProperties: Array.from({ length: 5 }).map(() => ({
            price: 230000, // Placeholder value
            distance: 2,    // Placeholder value
            features: ['feature1', 'feature2'], // Placeholder values
            prediction: {
              oneYear: 260000, // Placeholder value
              threeYears: 280000, // Placeholder value
              fiveYears: 300000 // Placeholder value
            }
          })),
          forecast: Array.from({ length: 24 }).map((_, i) => ({
            date: format(new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000), 'MMM yyyy', { locale: bg }),
            optimistic: 250000 + (i * 5000), // Placeholder values
            conservative: 250000 + (i * 3000), // Placeholder values
            marketTrend: 250000 + (i * 4000) // Placeholder values
          })),
          riskAssessment: {
            score: 80, // Placeholder value
            factors: [
              { name: 'Локация', impact: 85, details: 'София' },
              { name: 'Година на строителство', impact: 70, details: '2010' },
              { name: 'Конструкция', impact: 90, details: 'Тухла' }
            ],
            marketVolatility: 15, // Placeholder value
            economicFactors: {
              interestRates: 3.5, // Placeholder value
              economicGrowth: 2.8, // Placeholder value
              inflation: 3.2 // Placeholder value
            }
          },
          investmentMetrics: {
            roi: 6.2, // Placeholder value
            breakeven: 60, // Placeholder value
            appreciation: 4.0, // Placeholder value
            rentalYield: 5.0, // Placeholder value
            cashFlow: {
              monthly: 1000, // Placeholder value
              annual: 12000 // Placeholder value
            },
            investmentScenarios: {
              conservative: { returnRate: 4, totalReturn: 300000, timeline: 5 },
              moderate: { returnRate: 6, totalReturn: 337500, timeline: 5 },
              aggressive: { returnRate: 8, totalReturn: 375000, timeline: 5 }
            }
          },
          neighborhoodAnalysis: {
            score: 90, // Placeholder value
            amenities: [
              { type: 'Транспорт', distance: 0.5, impact: 80 },
              { type: 'Училища', distance: 1.0, impact: 90 },
              { type: 'Магазини', distance: 0.2, impact: 85 },
              { type: 'Паркове', distance: 0.8, impact: 75 }
            ],
            development: { planned: ['Метро', 'Парк'], impact: 10 },
            demographics: { population: 20000, growth: 2.0, income: 65000 }
          }
        });
        setLoading(false);
      }, 1500);

    } catch (error) {
      console.error('Error in Step3:', error);
      setError('Възникна грешка при зареждане на данните');
      setLoading(false);
    }
  }, [propertyId, navigate, propertyType, params]);

  const getRoomTypes = () => {
    switch (propertyType) {
      case 'apartment':
      case 'house':
      case 'villa':
        return RESIDENTIAL_ROOM_TYPES;
      case 'industrial':
        return INDUSTRIAL_ROOM_TYPES;
      case 'agricultural':
        return AGRICULTURAL_ROOM_TYPES;
      default:
        return [];
    }
  };

  const generatePDF = async () => {
    try {
      if (analysis) {
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFontSize(24);
        doc.setTextColor(0, 51, 102);
        doc.text('Професионален анализ на имот', 20, 30);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Изготвено от Homiq', 20, 45);
        doc.text(`Дата: ${format(new Date(), 'dd.MM.yyyy')}`, 20, 55);

        doc.addPage();
        doc.setFontSize(20);
        doc.text('Оценка на стойността', 20, 20);
        doc.setFontSize(16);
        doc.text(`€${analysis.estimatedValue.toLocaleString()}`, 20, 35);

        doc.addPage();
        doc.setFontSize(20);
        doc.text('Инвестиционен анализ', 20, 20);
        doc.setFontSize(12);
        const investmentData = [
          { metric: 'Очаквана възвръщаемост', value: `${analysis.investmentMetrics.roi.toFixed(1)}%` },
          { metric: 'Наем (месечно)', value: `€${analysis.investmentMetrics.cashFlow.monthly}` },
          { metric: 'Наем (годишно)', value: `€${analysis.investmentMetrics.cashFlow.annual}` },
          { metric: 'Период на изплащане', value: `${analysis.investmentMetrics.breakeven} месеца` },
          { metric: 'Очаквано поскъпване', value: `${analysis.investmentMetrics.appreciation.toFixed(1)}%` },
          { metric: 'Доход от наем', value: `${analysis.investmentMetrics.rentalYield.toFixed(1)}%` },
        ];
        autoTable(doc, {
          head: [['Метрика', 'Стойност']],
          body: investmentData.map(item => [item.metric, item.value]),
          startY: 40
        });

        doc.addPage();
        doc.setFontSize(20);
        doc.text('Оценка на риска', 20, 20);
        doc.setFontSize(12);
        const riskData = [
          { factor: 'Обща оценка на риска', value: `${analysis.riskAssessment.score}/100` },
          ...analysis.riskAssessment.factors.map(factor => ({ factor: factor.name, value: `${factor.impact}% ${factor.details ? `(${factor.details})` : ''}` })),
          { factor: 'Пазарна волатилност', value: `${analysis.riskAssessment.marketVolatility}%` },
          { factor: 'Лихвени проценти', value: `${analysis.riskAssessment.economicFactors.interestRates}%` },
          { factor: 'Икономически растеж', value: `${analysis.riskAssessment.economicFactors.economicGrowth}%` },
          { factor: 'Инфлация', value: `${analysis.riskAssessment.economicFactors.inflation}%` },
        ];

        autoTable(doc, {
          head: [['Фактор', 'Стойност']],
          body: riskData.map(item => [item.factor, item.value]),
          startY: 40
        });

        doc.addPage();
        doc.setFontSize(20);
        doc.text('Анализ на района', 20, 20);
        doc.setFontSize(12);
        const neighborhoodData = [
          { item: 'Оценка на района', value: `${analysis.neighborhoodAnalysis.score}/100` },
          ...analysis.neighborhoodAnalysis.amenities.map(amenity => ({ item: amenity.type, value: `${amenity.distance}км (Влияние: ${amenity.impact}%)` })),
          { item: 'Планирано развитие', value: analysis.neighborhoodAnalysis.development.planned.join(', ') },
          { item: 'Влияние на развитието', value: `${analysis.neighborhoodAnalysis.development.impact}%` },
          { item: 'Население', value: analysis.neighborhoodAnalysis.demographics.population },
          { item: 'Растеж на населението', value: `${analysis.neighborhoodAnalysis.demographics.growth}%` },
          { item: 'Доходи', value: analysis.neighborhoodAnalysis.demographics.income },
        ];
        autoTable(doc, {
          head: [['Фактор', 'Стойност']],
          body: neighborhoodData.map(item => [item.item, item.value]),
          startY: 40
        });


        doc.save('homiq-оценка.pdf');
        toast({
          title: "PDF генериран успешно",
          description: "Можете да изтеглите оценката във формат PDF.",
        });
      } else {
        toast({
          title: "Грешка",
          description: "Няма данни за генериране на PDF.",
          variant: "destructive"
        });
      }
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Грешка</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button
              className="mt-4"
              onClick={() => navigate('/evaluation/step1')}
            >
              Започнете отначало
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <ProgressSteps currentStep={3} steps={STEPS} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {propertyData?.documents && propertyData.documents.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Анализ на документите</CardTitle>
                  <CardDescription>
                    Информация извлечена от предоставените документи
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="documents" className="w-full">
                    <TabsList>
                      <TabsTrigger value="documents">Документи</TabsTrigger>
                      <TabsTrigger value="extracted">Извлечени данни</TabsTrigger>
                    </TabsList>
                    <TabsContent value="documents">
                      <div className="space-y-4">
                        {Object.entries(DOCUMENT_TYPES).map(([type, label]) => {
                          const docs = propertyData.documents.filter((doc: any) => doc.type === type);
                          if (docs.length === 0) return null;

                          return (
                            <div key={type} className="border rounded-lg p-4">
                              <h3 className="font-medium mb-2">{label}</h3>
                              <div className="space-y-2">
                                {docs.map((doc: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <span>{doc.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(doc.url)}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Изтегли
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </TabsContent>
                    <TabsContent value="extracted">
                      {propertyData.extractedData && (
                        <div className="space-y-4">
                          {Object.entries(propertyData.extractedData).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="font-medium">{key}</span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {propertyData?.roomPhotos && propertyData.roomPhotos.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Снимки по помещения</CardTitle>
                  <CardDescription>
                    {propertyType === 'industrial' ? 'Снимки на производствените зони' :
                     propertyType === 'agricultural' ? 'Снимки на земеделските площи' :
                     'Снимки на помещенията'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {propertyData.roomPhotos.map((room: any) => {
                      const roomType = getRoomTypes().find(rt => rt.id === room.roomType);
                      if (!roomType) return null;

                      const Icon = roomType.icon;

                      return (
                        <div key={room.roomType} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-5 w-5" />
                            <h3 className="font-medium">{roomType.name}</h3>
                          </div>
                          {room.description && (
                            <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            {room.photos.map((photo: string, index: number) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`${roomType.name} ${index + 1}`}
                                className="w-full h-32 object-cover rounded"
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>Резултат от оценката</CardTitle>
                <CardDescription>
                  {evaluationType === 'quick' 
                    ? 'Бърза оценка базирана на локация и основна информация'
                    : 'Професионален анализ базиран на всички предоставени документи'}
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

                      <InvestmentScenarios scenarios={analysis.investmentMetrics.investmentScenarios} />
                      <NeighborhoodAnalysis analysis={analysis.neighborhoodAnalysis} />

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
                                  <linearGradient id="conservativeGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#003366" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#003366" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="marketTrendGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FF9800" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#FF9800" stopOpacity={0}/>
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
                                <Area
                                  type="monotone"
                                  dataKey="marketTrend"
                                  stroke="#FF9800"
                                  fill="url(#marketTrendGradient)"
                                  strokeWidth={2}
                                  name="Пазарен тренд"
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-purple-500" />
                                <span>Доход от наем</span>
                              </div>
                              <span className="font-medium">{analysis.investmentMetrics.rentalYield.toFixed(1)}%</span>
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
                                  <span className="font-medium">{factor.impact}% {factor.details ? `(${factor.details})` : ''}</span>
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
                        <Button                        onClick={generatePDF}
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
              title="Детайли за оценката"
              description={
                evaluationType === 'quick' ?
                  "Бърза оценка базирана на локация и основна информация за имота" :
                  "Пълен анализ базиран на всички предоставени документи и снимки"
              }
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

//This is a placeholder.  Replace with your actual data provider.
class PropertyDataProvider {
  private static instance: PropertyDataProvider;
  private constructor() {}
  public static getInstance(): PropertyDataProvider {
    if (!PropertyDataProvider.instance) {
      PropertyDataProvider.instance = new PropertyDataProvider();
    }
    return PropertyDataProvider.instance;
  }
  public async getMarketData(location: string, type: string, squareMeters: number): Promise<{averagePrice: number}> {
    // Replace this with your actual data fetching logic.  This is a stub.
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const averagePrice = squareMeters * 1200 + (location === "София" ? 50000 : 0); //Example calculation
    return { averagePrice };
  }
}

function calculatePropertyValue(property: any, extractedData?: ExtractedPropertyData): Promise<PropertyAnalysis> {
  const getMarketData = async () => {
    const dataProvider = PropertyDataProvider.getInstance();
    return await dataProvider.getMarketData(
      property.location,
      property.type,
      extractedData?.squareMeters || property.squareMeters
    );
  };

  const marketDataPromise = getMarketData();
  const basePricePromise = marketDataPromise.then(data => data.averagePrice);

  // Коефициенти за оценка базирани на реални данни
  const getLocationFactor = (address?: string) => {
    if (!address) return 0.9;
    // Прецизна оценка базирана на адреса
    const premiumLocations = ['витоша', 'лозенец', 'докторски паметник', 'иван вазов'];
    const normalLocations = ['младост', 'люлин', 'дружба', 'надежда'];

    const lowerAddress = address.toLowerCase();
    if (premiumLocations.some(loc => lowerAddress.includes(loc))) return 1.2;
    if (normalLocations.some(loc => lowerAddress.includes(loc))) return 1.0;
    return 0.9;
  };

  const getYearFactor = (year?: number) => {
    if (!year) return Math.max(0.7, 1 - (new Date().getFullYear() - property.yearBuilt) / 100);
    const age = new Date().getFullYear() - year;
    // По-прецизна оценка на състоянието според годината
    if (age < 5) return 1.3; // Нова сграда
    if (age < 15) return 1.1; // Относително нова
    if (age < 30) return 0.9; // Средна възраст
    if (age < 50) return 0.7; // По-стара сграда
    return 0.5; // Много стара сграда
  };

  const getConstructionTypeFactor = (type?: string) => {
    if (!type) return 1;
    const factors: Record<string, number> = {
      'тухла': 1.2,
      'стоманобетон': 1.15,
      'панел': 0.9,
      'ЕПК': 0.95,
      'гредоред': 0.85
    };
    return factors[type.toLowerCase()] || 1;
  };

  return basePricePromise.then(basePrice => {
    const locationFactor = getLocationFactor(extractedData?.address);
    const yearFactor = getYearFactor(extractedData?.constructionYear);
    const constructionTypeFactor = getConstructionTypeFactor(extractedData?.constructionType);

    const estimatedValue = basePrice * locationFactor * yearFactor * constructionTypeFactor;

    // Останалата част от кода остава същата, само добавяме нови данни
    const riskAssessment = {
      score: Math.round((locationFactor + yearFactor + constructionTypeFactor) / 3 * 100),
      factors: [
        { 
          name: 'Локация', 
          impact: Math.round(locationFactor * 100),
          details: extractedData?.address ? `Базирано на адрес: ${extractedData.address}` : undefined
        },
        { 
          name: 'Година на строителство', 
          impact: Math.round(yearFactor * 100),
          details: extractedData?.constructionYear ? 
            `Построена през ${extractedData.constructionYear}` : undefined
        },
        { 
          name: 'Конструкция', 
          impact: Math.round(constructionTypeFactor * 100),
          details: extractedData?.constructionType ? 
            `Тип конструкция: ${extractedData.constructionType}` : undefined
        }
      ],
      marketVolatility: Math.round(Math.random() * 20 + 10),
      economicFactors: {
        interestRates: 3.5,
        economicGrowth: 2.8,
        inflation: 3.2
      }
    };

    const forecast = Array.from({ length: 24 }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const trend = 1 + (i * 0.005);
      return {
        date: format(date, 'MMM yyyy', { locale: bg }),
        optimistic: Math.round(estimatedValue * trend * 1.1),
        conservative: Math.round(estimatedValue * trend * 0.9),
        marketTrend: Math.round(estimatedValue * trend)
      };
    });

    const neighborhoodAnalysis = {
      score: Math.round(Math.random() * 20 + 80),
      amenities: [
        { type: "Транспорт", distance: 0.3, impact: 85 },
        { type: "Училища", distance: 0.5, impact: 90 },
        { type: "Магазини", distance: 0.2, impact: 88 },
        { type: "Паркове", distance: 0.8, impact: 75 }
      ],
      development: {
        planned: [
          "Нова метро станция (2026)",
          "Търговски център (2025)",
          "Обновяване на инфраструктура"
        ],
        impact: 15
      },
      demographics: {
        population: 25000,
        growth: 2.5,
        income: 75000
      }
    };

    const investmentMetrics = {
      roi: 5.5 + Math.random() * 2,
      breakeven: Math.round(48 + Math.random() * 24),
      appreciation: 3.5 + Math.random() * 1.5,
      rentalYield: 4.5 + Math.random() * 1.5,
      cashFlow: {
        monthly: Math.round(estimatedValue * 0.004),
        annual: Math.round(estimatedValue * 0.048)
      },
      investmentScenarios: {
        conservative: {
          returnRate: 4 + Math.random() * 2,
          totalReturn: Math.round(estimatedValue * 1.2),
          timeline: 5
        },
        moderate: {
          returnRate: 6 + Math.random() * 2,
          totalReturn: Math.round(estimatedValue * 1.35),
          timeline: 5
        },
        aggressive: {
          returnRate: 8 + Math.random() * 2,
          totalReturn: Math.round(estimatedValue * 1.5),
          timeline: 5
        }
      }
    };


    return {
      estimatedValue: Math.round(estimatedValue),
      factors: {
        location: Math.round(locationFactor * 100),
        condition: Math.round(yearFactor * 100),
        market: Math.round(constructionTypeFactor * 70),
        potential: Math.round((locationFactor + yearFactor + constructionTypeFactor) / 3 * 100)
      },
      priceHistory: Array.from({ length: 12 }).map((_, i) => ({
        date: format(new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000), 'MMM yyyy', { locale: bg }),
        value: Math.round(estimatedValue * (0.95 + Math.random() * 0.1))
      })),
      similarProperties: Array.from({ length: 5 }).map(() => ({
        price: Math.round(estimatedValue * (0.9 + Math.random() * 0.2)),
        distance: Math.round(1 + Math.random() * 4),
        features: [
          'Сходна квадратура',
          'Близка локация',
          'Подобно състояние',
          'Сходна година на строеж'
        ].sort(() => Math.random() - 0.5).slice(0, 2),
        prediction: {
          oneYear: Math.round(estimatedValue * 1.05),
          threeYears: Math.round(estimatedValue * 1.15),
          fiveYears: Math.round(estimatedValue * 1.25)
        }
      })),
      forecast,
      riskAssessment,
      investmentMetrics,
      neighborhoodAnalysis
    };
  });
}

function InvestmentScenarios({scenarios}: {scenarios: PropertyAnalysis['investmentMetrics']['investmentScenarios']}) {
  return (
    <Card className="p-6">
      <h4 className="font-medium mb-4">Инвестиционни сценарии</h4>
      <div className="space-y-4">
        {Object.entries(scenarios).map(([scenario, data]) => (
          <div key={scenario} className="flex items-center justify-between">
            <span className="font-medium">{scenario.charAt(0).toUpperCase() + scenario.slice(1)} сценарий</span>
            <span className="font-medium">
              {data.returnRate.toFixed(1)}% възвръщаемост за {data.timeline} години (€{data.totalReturn.toLocaleString()})
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function NeighborhoodAnalysis({analysis}: {analysis: PropertyAnalysis['neighborhoodAnalysis']}) {
  return (
    <Card className="p-6">
      <h4 className="font-medium mb-4">Анализ на квартала</h4>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Оценка на района</span>
          <span className="font-medium">{analysis.score}/100</span>
        </div>
        <div className="space-y-2">
          {analysis.amenities.map((amenity, index) => (
            <div key={index} className="flex items-center justify-between">
              <span>{amenity.type}</span>
              <span>{amenity.distance} км ({amenity.impact}%)</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Планирано развитие</span>
          <span className="font-medium">{analysis.development.planned.join(', ')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Влияние на развитието</span>
          <span className="font-medium">{analysis.development.impact}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Население</span>
          <span className="font-medium">{analysis.demographics.population}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Растеж на населението</span>
          <span className="font-medium">{analysis.demographics.growth}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Доходи</span>
          <span className="font-medium">{analysis.demographics.income}</span>
        </div>
      </div>
    </Card>
  );
}