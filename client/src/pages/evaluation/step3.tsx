import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, TrendingUp, MapPin, Home, Share2, HelpCircle, Info, ArrowUpRight, Banknote, Calendar } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentDataSection } from "@/components/property-analysis/document-data-section";
import { InstructionCard } from "@/components/instruction-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { InvestmentScenarios } from "@/components/property-analysis/investment-scenarios";
import { NeighborhoodAnalysis } from "@/components/property-analysis/neighborhood-analysis";

interface ExtractedPropertyData {
  squareMeters?: number;
  constructionYear?: number;
  address?: string;
  taxAssessment?: number;
  constructionType?: string;
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

async function generateProfessionalReport(analysis: PropertyAnalysis) {
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
}

export default function Step3() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<PropertyAnalysis | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [documentAnalysis, setDocumentAnalysis] = useState<any>(null);
  const propertyId = new URLSearchParams(window.location.search).get('propertyId');
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
      return;
    }

    // Parse extracted data from URL if available
    const params = new URLSearchParams(window.location.search);
    const extractedDataParam = params.get('extractedData');
    const documentAnalysisParam = params.get('documentAnalysis');

    if (extractedDataParam) {
      try {
        setExtractedData(JSON.parse(extractedDataParam));
      } catch (error) {
        console.error('Error parsing extracted data:', error);
      }
    }

    if (documentAnalysisParam) {
      try {
        setDocumentAnalysis(JSON.parse(documentAnalysisParam));
      } catch (error) {
        console.error('Error parsing document analysis:', error);
      }
    }

    const timer = setTimeout(async () => {
      const mockProperty = {
        type: "apartment",
        squareMeters: 85,
        yearBuilt: 2010,
        location: "София"
      };

      try {
        const result = await calculatePropertyValue(mockProperty, extractedData);
        setAnalysis(result);
      } catch (error) {
        console.error('Error calculating property value:', error);
        toast({
          title: "Грешка при изчисляване",
          description: "Моля, опитайте отново по-късно.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [propertyId, navigate]);

  const generatePDF = async () => {
    try {
      if (analysis) {
        await generateProfessionalReport(analysis);
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

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <ProgressSteps currentStep={3} steps={STEPS} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {(extractedData || documentAnalysis) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <DocumentDataSection 
                  extractedData={extractedData}
                  documentAnalysis={documentAnalysis}
                />
              </motion.div>
            )}

            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>Резултат от оценката</CardTitle>
                <CardDescription>
                  Професионален анализ на стойността на вашия имот
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

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                      >
                        <InvestmentScenarios scenarios={analysis.investmentMetrics.investmentScenarios} />
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                      >
                        <NeighborhoodAnalysis analysis={analysis.neighborhoodAnalysis} />
                      </motion.div>

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
                                  <linearGradient id="conservativeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#003366" stopOpacity={0.1}/>
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
                        <Button
                          onClick={generatePDF}
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
              title="Как се изчислява оценката?"
              description="Нашият алгоритъм анализира множество фактори, включително локация, състояние на имота, пазарни тенденции и инвестиционен потенциал за максимално точна оценка."
            />
            <InstructionCard
              icon={<HelpCircle className="h-5 w-5 text-green-500" />}
              title="Как да използвате оценката?"
              description="Разгледайте прогнозите за развитие, инвестиционните метрики и оценката на риска за по-информирано решение. Можете да изтеглите подробен PDF отчет."
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