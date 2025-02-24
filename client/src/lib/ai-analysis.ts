```typescript
import { type Property } from "@shared/schema";
import { format } from "date-fns";
import { bg } from "date-fns/locale";

export interface PropertyAnalysis {
  estimatedValue: number;
  confidence: number;
  factors: {
    location: number;
    condition: number;
    market: number;
  };
  similarProperties: Array<{
    price: number;
    distance: number;
    similarity: number;
  }>;
  marketTrends: Array<{
    date: string;
    value: number;
  }>;
  recommendations: string[];
}

// Временна функция за генериране на анализ без OpenAI
export async function analyzeProperty(property: Property): Promise<PropertyAnalysis> {
  // Симулираме AI анализ с правдоподобни данни
  const basePrice = property.squareMeters * 1000; // База цена на кв.м.
  
  // Фактори влияещи на цената
  const locationFactor = 0.85 + Math.random() * 0.3;
  const conditionFactor = property.yearBuilt ? 
    Math.max(0.7, 1 - (new Date().getFullYear() - property.yearBuilt) * 0.01) : 
    0.8;
  const marketFactor = 0.9 + Math.random() * 0.2;

  // Генериране на тренд данни за последните 12 месеца
  const trendData = Array.from({ length: 12 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      date: format(date, 'MMM yyyy', { locale: bg }),
      value: basePrice * (0.95 + Math.random() * 0.1)
    };
  });

  // Генериране на подобни имоти
  const similarProperties = Array.from({ length: 3 }).map(() => ({
    price: basePrice * (0.9 + Math.random() * 0.2),
    distance: Math.round(Math.random() * 5 * 10) / 10,
    similarity: Math.round((0.7 + Math.random() * 0.3) * 100)
  }));

  // Изчисляване на крайната цена
  const estimatedValue = basePrice * locationFactor * conditionFactor * marketFactor;

  const recommendations = [
    "Имотът е в район с добра инфраструктура",
    "Близостта до градски транспорт повишава стойността",
    "Препоръчва се енергийна ефективност за по-висока оценка"
  ];

  return {
    estimatedValue: Math.round(estimatedValue),
    confidence: Math.round(Math.min(0.85 + Math.random() * 0.1, 0.95) * 100) / 100,
    factors: {
      location: Math.round(locationFactor * 100),
      condition: Math.round(conditionFactor * 100),
      market: Math.round(marketFactor * 100)
    },
    similarProperties,
    marketTrends: trendData,
    recommendations
  };
}

// Когато OpenAI API ключът е конфигуриран, ще използваме истински AI анализ
export async function analyzePropertyWithAI(property: Property): Promise<PropertyAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    return analyzeProperty(property);
  }

  // TODO: Имплементация на AI анализ с OpenAI
  return analyzeProperty(property);
}
```
