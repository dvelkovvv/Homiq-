import { type Property } from "@shared/schema";
import { format } from "date-fns";
import { bg } from "date-fns/locale";

export interface ExtractedPropertyData {
  squareMeters?: number;
  constructionYear?: number;
  address?: string;
  taxAssessment?: number;
  constructionType?: string;
}

export interface PropertyAnalysis {
  estimatedValue: number;
  confidence: number;
  factors: {
    location: number;
    condition: number;
    market: number;
    potential: number;
  };
  marketTrends: Array<{
    date: string;
    value: number;
    confidence: number;
  }>;
  riskAssessment: {
    score: number;
    factors: Array<{
      name: string;
      impact: number;
      confidence: number;
      details?: string;
    }>;
  };
  recommendations: string[];
}

export async function analyzePropertyWithAI(
  property: Property, 
  extractedData?: ExtractedPropertyData
): Promise<PropertyAnalysis> {
  // Базова цена на квадратен метър според локацията
  const getBasePrice = (location: string): number => {
    const priceMap: Record<string, number> = {
      'София': 2200,
      'Пловдив': 1500,
      'Варна': 1700,
      'Бургас': 1400,
      'default': 1000
    };
    return priceMap[location] || priceMap.default;
  };

  // Корекция според типа конструкция
  const getConstructionFactor = (type?: string): number => {
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

  // Корекция според годината на строителство
  const getAgeFactor = (year?: number): number => {
    if (!year) return 0.9;
    const age = new Date().getFullYear() - year;
    if (age < 5) return 1.3;
    if (age < 15) return 1.1;
    if (age < 30) return 0.9;
    if (age < 50) return 0.7;
    return 0.5;
  };

  // Анализ на локацията
  const analyzeLocation = (address?: string) => {
    const premiumLocations = ['витоша', 'лозенец', 'иван вазов', 'докторски паметник'];
    const goodLocations = ['младост', 'студентски град', 'център'];

    if (!address) return { factor: 1, confidence: 0.6 };

    const lowerAddress = address.toLowerCase();
    if (premiumLocations.some(loc => lowerAddress.includes(loc))) {
      return { factor: 1.2, confidence: 0.9 };
    }
    if (goodLocations.some(loc => lowerAddress.includes(loc))) {
      return { factor: 1.1, confidence: 0.85 };
    }
    return { factor: 1, confidence: 0.75 };
  };

  // Анализ на пазарни тенденции
  const generateMarketTrends = (basePrice: number) => {
    return Array.from({ length: 12 }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      const trend = 1 + (i * 0.005);
      const volatility = (Math.random() - 0.5) * 0.04;

      return {
        date: format(date, 'MMM yyyy', { locale: bg }),
        value: Math.round(basePrice * (trend + volatility)),
        confidence: 0.9 - (i * 0.05)
      };
    });
  };

  // Основни изчисления
  const basePrice = getBasePrice(property.location) * 
    (extractedData?.squareMeters || property.squareMeters);
  const constructionFactor = getConstructionFactor(extractedData?.constructionType);
  const ageFactor = getAgeFactor(extractedData?.constructionYear);
  const location = analyzeLocation(extractedData?.address);

  const estimatedValue = basePrice * constructionFactor * ageFactor * location.factor;

  // Генериране на препоръки
  const recommendations = [];
  if (ageFactor < 0.8) {
    recommendations.push("Препоръчва се основен ремонт за повишаване на стойността");
  }
  if (constructionFactor < 1) {
    recommendations.push("Инвестиция в енергийна ефективност би повишила стойността");
  }
  if (location.factor > 1.1) {
    recommendations.push("Районът има отлични перспективи за развитие");
  }

  // Оценка на потенциала
  const potential = Math.round(
    ((location.factor + constructionFactor + ageFactor) / 3) * 100
  );

  return {
    estimatedValue: Math.round(estimatedValue),
    confidence: Math.round((location.confidence + 0.8 + 0.9) / 3 * 100) / 100,
    factors: {
      location: Math.round(location.factor * 100),
      condition: Math.round(ageFactor * 100),
      market: Math.round(constructionFactor * 100),
      potential
    },
    marketTrends: generateMarketTrends(basePrice),
    riskAssessment: {
      score: Math.round((location.confidence + 0.8 + 0.9) / 3 * 100),
      factors: [
        {
          name: 'Локация',
          impact: Math.round(location.factor * 100),
          confidence: Math.round(location.confidence * 100),
          details: extractedData?.address ? `Базирано на адрес: ${extractedData.address}` : undefined
        },
        {
          name: 'Състояние',
          impact: Math.round(ageFactor * 100),
          confidence: 90,
          details: extractedData?.constructionYear ? 
            `Година на строителство: ${extractedData.constructionYear}` : undefined
        },
        {
          name: 'Конструкция',
          impact: Math.round(constructionFactor * 100),
          confidence: 85,
          details: extractedData?.constructionType ? 
            `Тип конструкция: ${extractedData.constructionType}` : undefined
        }
      ]
    },
    recommendations
  };
}