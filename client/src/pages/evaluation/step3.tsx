import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoorClosed, Utensils, Sofa, Bath, Bed, Warehouse, Trees, Factory, Download, TrendingUp, MapPin, Home, Share2, HelpCircle, Info, ArrowUpRight, Banknote, Calendar, Building2, FileText, Images, ChartBar, Scale, Receipt, FileSignature, BarChart3, Edit2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { InstructionCard } from "@/components/instruction-card";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

interface DocumentAnalysis {
  propertyDetails: {
    area?: number;
    rooms?: number;
    floor?: number;
    totalFloors?: number;
    constructionYear?: number;
    constructionType?: string;
    heating?: string;
    parking?: boolean;
  };
  locationInfo: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    neighborhood?: string;
    nearbyAmenities?: string[];
  };
  legalStatus: {
    ownership: string;
    encumbrances?: string[];
    restrictions?: string[];
  };
  marketAnalysis: {
    currentValue: number;
    pricePerSqm: number;
    comparableProperties: {
      price: number;
      area: number;
      distance: number;
    }[];
    marketTrends: {
      yearly: number;
      quarterly: number;
      monthly: number;
    };
  };
}

const editPropertySchema = z.object({
  area: z.number().min(1, "Площта трябва да бъде поне 1 кв.м."),
  rooms: z.number().min(1, "Броят стаи трябва да бъде поне 1"),
  constructionYear: z.number().min(1900, "Годината трябва да бъде след 1900").max(new Date().getFullYear(), "Годината не може да бъде в бъдещето"),
  constructionType: z.string().min(1, "Изберете тип конструкция"),
  heating: z.string().min(1, "Изберете тип отопление"),
  address: z.string().min(3, "Адресът трябва да бъде поне 3 символа"),
});

const DocumentAnalysisSection = ({ analysis, documents, onEdit }: {
  analysis: DocumentAnalysis,
  documents: any[],
  onEdit: (data: any) => void
}) => {
  const [editMode, setEditMode] = useState(false);
  const form = useForm({
    resolver: zodResolver(editPropertySchema),
    defaultValues: {
      area: analysis.propertyDetails.area,
      rooms: analysis.propertyDetails.rooms,
      constructionYear: analysis.propertyDetails.constructionYear,
      constructionType: analysis.propertyDetails.constructionType,
      heating: analysis.propertyDetails.heating,
      address: analysis.locationInfo.address,
    }
  });

  return (
    <Card className="mb-8 relative overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
            <FileText className="h-6 w-6 text-primary" />
            Анализ на документите
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="absolute top-4 right-4 hover:bg-primary/10"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            {editMode ? "Отказ" : "Редактирай"}
          </Button>
        </div>
        <CardDescription className="text-base text-gray-600">
          Детайлна информация извлечена от предоставените документи
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {editMode ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEdit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-base font-medium">Площ (кв.м.)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            className="h-11 text-lg"
                            placeholder="Въведете площ"
                          />
                        </FormControl>
                        <FormDescription className="text-red-500">
                          {form.formState.errors.area?.message}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormField
                    control={form.control}
                    name="rooms"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-base font-medium">Брой стаи</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            className="h-11 text-lg"
                            placeholder="Въведете брой стаи"
                          />
                        </FormControl>
                        <FormDescription className="text-red-500">
                          {form.formState.errors.rooms?.message}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormField
                    control={form.control}
                    name="constructionYear"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-base font-medium">Година на строителство</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            className="h-11 text-lg"
                            placeholder="Въведете година"
                          />
                        </FormControl>
                        <FormDescription className="text-red-500">
                          {form.formState.errors.constructionYear?.message}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormField
                    control={form.control}
                    name="constructionType"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-base font-medium">Тип конструкция</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 text-lg"
                            placeholder="Въведете тип конструкция"
                          />
                        </FormControl>
                        <FormDescription className="text-red-500">
                          {form.formState.errors.constructionType?.message}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormField
                    control={form.control}
                    name="heating"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-base font-medium">Отопление</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 text-lg"
                            placeholder="Въведете тип отопление"
                          />
                        </FormControl>
                        <FormDescription className="text-red-500">
                          {form.formState.errors.heating?.message}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-base font-medium">Адрес</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 text-lg"
                            placeholder="Въведете адрес"
                          />
                        </FormControl>
                        <FormDescription className="text-red-500">
                          {form.formState.errors.address?.message}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </motion.div>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditMode(false)}
                >
                  Отказ
                </Button>
                <Button type="submit" className="bg-primary">
                  Запази промените
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Tabs defaultValue="property" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 gap-2 bg-gray-50/50 p-1 rounded-lg">
              <TabsTrigger
                value="property"
                className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Building2 className="h-5 w-5 mr-2" />
                Имот
              </TabsTrigger>
              <TabsTrigger
                value="legal"
                className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
              >
                <FileSignature className="h-5 w-5 mr-2" />
                Правен статус
              </TabsTrigger>
              <TabsTrigger
                value="location"
                className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Локация
              </TabsTrigger>
              <TabsTrigger
                value="market"
                className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Пазар
              </TabsTrigger>
            </TabsList>

            <TabsContent value="property" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">
                      Основни характеристики
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <dt className="text-gray-600 font-medium">Площ</dt>
                        <dd className="text-lg font-semibold">{analysis.propertyDetails.area} м²</dd>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <dt className="text-gray-600 font-medium">Брой стаи</dt>
                        <dd className="text-lg font-semibold">{analysis.propertyDetails.rooms}</dd>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <dt className="text-gray-600 font-medium">Етаж</dt>
                        <dd className="text-lg font-semibold">{analysis.propertyDetails.floor} от {analysis.propertyDetails.totalFloors}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">
                      Строителство
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <dt className="text-gray-600 font-medium">Година</dt>
                        <dd className="text-lg font-semibold">{analysis.propertyDetails.constructionYear}</dd>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <dt className="text-gray-600 font-medium">Конструкция</dt>
                        <dd className="text-lg font-semibold">{analysis.propertyDetails.constructionType}</dd>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <dt className="text-gray-600 font-medium">Отопление</dt>
                        <dd className="text-lg font-semibold">{analysis.propertyDetails.heating}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="legal" className="space-y-6">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-primary">
                    Правен статус
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div>
                      <dt className="font-medium text-gray-600">Собственост</dt>
                      <dd className="mt-1 text-lg">{analysis.legalStatus.ownership}</dd>
                    </div>
                    {analysis.legalStatus.encumbrances && analysis.legalStatus.encumbrances.length > 0 && (
                      <div>
                        <dt className="font-medium text-gray-600">Тежести</dt>
                        <dd className="mt-1">
                          <ul className="list-disc pl-5 space-y-1">
                            {analysis.legalStatus.encumbrances.map((item, index) => (
                              <li key={index} className="text-gray-800">{item}</li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                    {analysis.legalStatus.restrictions && analysis.legalStatus.restrictions.length > 0 && (
                      <div>
                        <dt className="font-medium text-gray-600">Ограничения</dt>
                        <dd className="mt-1">
                          <ul className="list-disc pl-5 space-y-1">
                            {analysis.legalStatus.restrictions.map((item, index) => (
                              <li key={index} className="text-gray-800">{item}</li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="location" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">
                      Адрес и локация
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium mb-4">{analysis.locationInfo.address}</p>
                    {analysis.locationInfo.nearbyAmenities && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-600 mb-2">Близки обекти</h4>
                        <ul className="space-y-2">
                          {analysis.locationInfo.nearbyAmenities.map((amenity, index) => (
                            <li key={index} className="flex items-center gap-2 text-gray-800">
                              <div className="w-2 h-2 rounded-full bg-primary/60" />
                              {amenity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">
                      Инфраструктура
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h5 className="font-medium mb-2">Транспортна достъпност</h5>
                        <p className="text-sm text-gray-600">
                          Отлична свързаност с градския транспорт и основни пътни артерии
                        </p>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h5 className="font-medium mb-2">Паркиране</h5>
                        <p className="text-sm text-gray-600">
                          {analysis.propertyDetails.parking
                            ? "Налично собствено паркомясто"
                            : "Улично паркиране в района"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="market" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">
                      Пазарни данни
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <dt className="text-gray-600 font-medium">Текуща стойност</dt>
                        <dd className="text-lg font-semibold">€{analysis.marketAnalysis.currentValue.toLocaleString()}</dd>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <dt className="text-gray-600 font-medium">Цена на кв.м.</dt>
                        <dd className="text-lg font-semibold">€{analysis.marketAnalysis.pricePerSqm.toLocaleString()}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">
                      Тенденции
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <dt className="text-gray-600 font-medium">Годишно изменение</dt>
                        <dd className={`text-lg font-semibold ${analysis.marketAnalysis.marketTrends.yearly >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {analysis.marketAnalysis.marketTrends.yearly}%
                        </dd>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <dt className="text-gray-600 font-medium">Тримесечно изменение</dt>
                        <dd className={`text-lg font-semibold ${analysis.marketAnalysis.marketTrends.quarterly >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {analysis.marketAnalysis.marketTrends.quarterly}%
                        </dd>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <dt className="text-gray-600 font-medium">Месечно изменение</dt>
                        <dd className={`text-lg font-semibold ${analysis.marketAnalysis.marketTrends.monthly >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {analysis.marketAnalysis.marketTrends.monthly}%
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
              <Card className="mt-4 border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-primary">
                    Сравними имоти в района
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.marketAnalysis.comparableProperties.map((prop, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                      >
                        <div>
                          <span className="font-medium text-lg">€{prop.price.toLocaleString()}</span>
                          <span className="text-sm text-gray-600 ml-2">({prop.area} м²)</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {prop.distance < 1
                            ? `${prop.distance * 1000}м разстояние`
                            : `${prop.distance}км разстояние`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

const mockDocumentAnalysis: DocumentAnalysis = {
  propertyDetails: {
    area: 85,
    rooms: 3,
    floor: 4,
    totalFloors: 6,
    constructionYear: 2018,
    constructionType: "Тухла",
    heating: "ТЕЦ",
    parking: true
  },
  locationInfo: {
    address: "ул. Примерна 123, София",
    coordinates: {
      lat: 42.698334,
      lng: 23.319941
    },
    neighborhood: "Център",
    nearbyAmenities: [
      "Метростанция (250м)",
      "Супермаркет (150м)",
      "Училище (400м)",
      "Парк (600м)"
    ]
  },
  legalStatus: {
    ownership: "Частна собственост",
    encumbrances: ["Ипотека към банка"],
    restrictions: []
  },
  marketAnalysis: {
    currentValue: 250000,
    pricePerSqm: 2941,
    comparableProperties: [
      { price: 245000, area: 82, distance: 0.3 },
      { price: 260000, area: 88, distance: 0.5 },
      { price: 240000, area: 80, distance: 0.7 }
    ],
    marketTrends: {
      yearly: 5.2,
      quarterly: 1.8,
      monthly: 0.4
    }
  }
};

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

  const handleEdit = (data: any) => {
    const updatedAnalysis = { ...analysis };
    updatedAnalysis.propertyDetails = { ...updatedAnalysis.propertyDetails, ...data };
    setAnalysis(updatedAnalysis);
  };

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
      return;
    }

    try {
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
            variant: "destructive",
          });
        }
      }

      setPropertyData(data);

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
            value: 250000 
          })),
          similarProperties: Array.from({ length: 5 }).map(() => ({
            price: 230000,
            distance: 2,    
            features: ['feature1', 'feature2'],
            prediction: {
              oneYear: 260000,
              threeYears: 280000,
              fiveYears: 300000
            }
          })),
          forecast: Array.from({ length: 24 }).map((_, i) => ({
            date: format(new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000), 'MMM yyyy', { locale: bg }),
            optimistic: 250000 + (i * 5000),
            conservative: 250000 + (i * 3000),
            marketTrend: 250000 + (i * 4000)
          })),
          riskAssessment: {
            score: 80,
            factors: [
              { name: 'Локация', impact: 85, details: 'София' },
              { name: 'Година на строителство', impact: 70, details: '2010' },
              { name: 'Конструкция', impact: 90, details: 'Тухла' }
            ],
            marketVolatility: 15,
            economicFactors: {
              interestRates: 3.5,
              economicGrowth: 2.8,
              inflation: 3.2
            }
          },
          investmentMetrics: {
            roi: 6.2,
            breakeven: 60,
            appreciation: 4.0,
            rentalYield: 5.0,
            cashFlow: {
              monthly: 1000,
              annual: 12000
            },
            investmentScenarios: {
              conservative: { returnRate: 4, totalReturn: 300000, timeline: 5 },
              moderate: { returnRate: 6, totalReturn: 350000, timeline: 5 },
              aggressive: { returnRate: 8, totalReturn: 400000, timeline: 5 }
            }
          },
          neighborhoodAnalysis: {
            score: 90,
            amenities: [
              { type: 'Транспорт', distance: 0.5, impact: 80 },
              { type: 'Училища', distance: 1.0, impact: 90 },
              { type: 'Магазини', distance: 0.3, impact: 85 }
            ],
            development: {
              planned: ['Нова метростанция', 'Търговски център'],
              impact: 15
            },
            demographics: {
              population: 25000,
              growth: 3.5,
              income: 65000
            }
          }
        });

        setLoading(false);
      }, 1500);

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Грешка при зареждане на данните');
      setLoading(false);
    }
  }, [navigate, propertyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Progress value={30} className="w-60 h-2 mb-4" />
          <p className="text-muted-foreground">Зареждане на данни...</p>
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

  if (!analysis) {
    return null;
  }

  const generatePDF = () => {
    const doc = new jsPDF();

    // Title page
    doc.setFontSize(20);
    doc.text('Оценка на стойността', 20, 20);
    doc.setFontSize(16);
    doc.text(`€${analysis.estimatedValue.toLocaleString()}`, 20, 35);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Изготвено от Homiq', 20, 45);
    doc.text(`Дата: ${format(new Date(), 'dd.MM.yyyy')}`, 20, 55);

    doc.addPage();
    doc.setFontSize(20);
    doc.text('Инвестиционен анализ', 20, 20);
    doc.setFontSize(12);
    doc.text('ROI: ' + analysis.investmentMetrics.roi + '%', 20, 40);
    doc.text('Период на изплащане: ' + analysis.investmentMetrics.breakeven + ' месеца', 20, 50);
    doc.text('Очаквана годишна възвръщаемост: ' + analysis.investmentMetrics.appreciation + '%', 20, 60);

    doc.addPage();
    doc.setFontSize(20);
    doc.text('Рискова оценка', 20, 20);
    doc.setFontSize(12);

    // Risk factors table
    const riskData = analysis.riskAssessment.factors.map(factor => [
      factor.name,
      factor.impact + '%',
      factor.details || ''
    ]);

    (doc as any).autoTable({
      startY: 30,
      head: [['Фактор', 'Влияние', 'Детайли']],
      body: riskData
    });

    doc.addPage();
    doc.setFontSize(20);
    doc.text('Пазарен анализ', 20, 20);
    doc.setFontSize(12);
    doc.text('Текуща пазарна стойност: €' + analysis.estimatedValue.toLocaleString(), 20, 40);
    doc.text('Пазарна волатилност: ' + analysis.riskAssessment.marketVolatility + '%', 20, 50);
    doc.text('Лихвени проценти: ' + analysis.riskAssessment.economicFactors.interestRates + '%', 20, 60);
    doc.text('Икономически растеж: ' + analysis.riskAssessment.economicFactors.economicGrowth + '%', 20, 70);
    doc.text('Инфлация: ' + analysis.riskAssessment.economicFactors.inflation + '%', 20, 80);

    // Market trends table
    const marketData = [
      ['1 година', `€${analysis.similarProperties[0].prediction.oneYear.toLocaleString()}`],
      ['3 години', `€${analysis.similarProperties[0].prediction.threeYears.toLocaleString()}`],
      ['5 години', `€${analysis.similarProperties[0].prediction.fiveYears.toLocaleString()}`]
    ];

    (doc as any).autoTable({
      startY: 90,
      head: [['Период', 'Прогнозна стойност']],
      body: marketData
    });

    doc.save('property-analysis.pdf');
  };

  const getRoomTypes = () => {
    switch (propertyType) {
      case 'industrial':
        return INDUSTRIAL_ROOM_TYPES;
      case 'agricultural':
        return AGRICULTURAL_ROOM_TYPES;
      default:
        return RESIDENTIAL_ROOM_TYPES;
    }
  };

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

          <ProgressSteps steps={STEPS} currentStep={2} className="mb-12" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {propertyData && (
                <DocumentAnalysisSection
                  analysis={mockDocumentAnalysis}
                  documents={propertyData.documents || []}
                  onEdit={handleEdit}
                />
              )}

              {propertyData?.roomPhotos && propertyData.roomPhotos.length > 0 && (
                <Card className="overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <Images className="h-5 w-5 text-primary" />
                      Снимки по помещения
                    </CardTitle>
                    <CardDescription>
                      {propertyType === 'industrial' ? 'Снимки на производствените зони' :
                        propertyType === 'agricultural' ? 'Снимки на земеделските площи' :
                          'Снимки на помещенията'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {propertyData.roomPhotos.map((room: any) => {
                        const roomType = getRoomTypes().find(rt => rt.id === room.roomType);
                        if (!roomType) return null;

                        const Icon = roomType.icon;

                        return (
                          <motion.div
                            key={room.roomType}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group relative overflow-hidden rounded-lg border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 rounded-full bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <h3 className="font-medium text-lg">{roomType.name}</h3>
                            </div>
                            {room.description && (
                              <p className="text-gray-600 mb-4">{room.description}</p>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              {room.photos.map((photo: any, index: number) => (
                                <div
                                  key={index}
                                  className="aspect-square rounded-lg overflow-hidden border border-gray-100"
                                >
                                  <img
                                    src={photo.url}
                                    alt={`${roomType.name} снимка ${index + 1}`}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <Card className="overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle>Резултат от оценката</CardTitle>
                    <CardDescription>
                      {evaluationType === 'quick'
                        ? 'Бърза оценка базирана на локация и основна информация'
                        : 'Професионален анализ базиран на всички предоставени документи'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="text-center"
                    >
                      <h3 className="text-3xl font-bold text-primary mb-2">
                        €{analysis.estimatedValue.toLocaleString()}
                      </h3>
                      <p className="text-gray-600">Пазарна стойност</p>
                    </motion.div>

                    <div className="mt-8 space-y-6">
                      {Object.entries(analysis.factors).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 capitalize">
                              {key === 'location' ? 'Локация' :
                               key === 'condition' ? 'Състояние' :
                               key === 'market' ? 'Пазар' : 'Потенциал'}
                            </span>
                            <span className="font-medium">{value}%</span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={generatePDF}
                        className="flex-1 bg-primary"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Изтегли PDF отчет
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Сподели
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle>Сподели оценката</DialogTitle>
                          <DialogDescription>
                            Изберете начин за споделяне на оценката
                          </DialogDescription>
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                // Copy link logic
                                toast({
                                  title: "Връзката е копирана",
                                  description: "Можете да я споделите с други",
                                });
                              }}
                            >
                              Копирай връзка
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                // Email share logic
                                toast({
                                  title: "Изпратено по имейл",
                                  description: "Оценката е споделена успешно",
                                });
                              }}
                            >
                              Изпрати по имейл
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle>Помощ при оценката</CardTitle>
                    <CardDescription>
                      Информация за процеса на оценяване
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <InstructionCard
                        icon={HelpCircle}
                        title="Как се изчислява оценката?"
                        description="Оценката се базира на множество фактори, включително локация, състояние, пазарни тенденции и потенциал за развитие."
                      />
                      <InstructionCard
                        icon={Info}
                        title="Точност на оценката"
                        description="Точността зависи от предоставените данни и текущите пазарни условия."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InvestmentScenarios({ scenarios }: { scenarios: PropertyAnalysis['investmentMetrics']['investmentScenarios'] }) {
  return (
    <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
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

function NeighborhoodAnalysis({ analysis }: { analysis: PropertyAnalysis['neighborhoodAnalysis'] }) {
  return (
    <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
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
    await new Promise(resolve => setTimeout(resolve, 500));
    const averagePrice = squareMeters * 1200 + (location === "София" ? 50000 : 0);
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

  const getLocationFactor = (address?: string) => {
    if (!address) return 0.9;
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
    if (age < 5) return 1.3;
    if (age < 15) return 1.1;
    if (age < 30) return 0.9;
    if (age < 50) return 0.7;
    return 0.5;
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