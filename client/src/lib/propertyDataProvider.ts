import { format, subMonths } from 'date-fns';
import { bg } from 'date-fns/locale';

export interface PropertyMarketData {
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  priceHistory: {
    date: string;
    value: number;
  }[];
  similarProperties: {
    price: number;
    location: string;
    features: string[];
    source: string;
    url?: string;
  }[];
  marketTrends: {
    monthlyGrowth: number;
    yearlyGrowth: number;
    demandScore: number;
  };
}

// Адаптер интерфейс за различни източници на данни
export interface PropertyDataSource {
  getMarketData(location: string, propertyType: string, size: number): Promise<PropertyMarketData>;
}

// Имплементация за реални API-та (когато са налични)
export class RealEstateAPISource implements PropertyDataSource {
  async getMarketData(location: string, propertyType: string, size: number): Promise<PropertyMarketData> {
    // TODO: Имплементация на реални API извиквания
    throw new Error("API source not implemented");
  }
}

// Имплементация за уеб скрапинг (като резервен вариант)
export class WebScrapingSource implements PropertyDataSource {
  async getMarketData(location: string, propertyType: string, size: number): Promise<PropertyMarketData> {
    // TODO: Имплементация на уеб скрапинг
    throw new Error("Web scraping source not implemented");
  }
}

// Mock имплементация с реалистични данни базирани на пазарни тенденции
export class MockDataSource implements PropertyDataSource {
  async getMarketData(location: string, propertyType: string, size: number): Promise<PropertyMarketData> {
    // Базова цена според локацията
    const basePrice = this.getBasePriceForLocation(location);
    const pricePerSqm = basePrice * this.getPropertyTypeMultiplier(propertyType);
    const totalPrice = pricePerSqm * size;

    // Генериране на реалистична ценова история
    const priceHistory = this.generatePriceHistory(totalPrice);
    
    // Генериране на подобни имоти
    const similarProperties = this.generateSimilarProperties(totalPrice, location, propertyType);

    return {
      averagePrice: totalPrice,
      priceRange: {
        min: totalPrice * 0.9,
        max: totalPrice * 1.1
      },
      priceHistory,
      similarProperties,
      marketTrends: {
        monthlyGrowth: 0.5 + Math.random() * 0.5,
        yearlyGrowth: 5 + Math.random() * 3,
        demandScore: 75 + Math.random() * 20
      }
    };
  }

  private getBasePriceForLocation(location: string): number {
    const priceMap: Record<string, number> = {
      'София': 2200,
      'Пловдив': 1500,
      'Варна': 1700,
      'Бургас': 1400,
      'default': 1000
    };
    return priceMap[location] || priceMap.default;
  }

  private getPropertyTypeMultiplier(type: string): number {
    const multipliers: Record<string, number> = {
      'apartment': 1,
      'house': 0.8,
      'villa': 1.2,
      'studio': 1.1,
      'default': 1
    };
    return multipliers[type] || multipliers.default;
  }

  private generatePriceHistory(currentPrice: number): { date: string; value: number }[] {
    return Array.from({ length: 24 }).map((_, i) => {
      const date = subMonths(new Date(), 23 - i);
      // Добавяме реалистични флуктуации
      const monthlyChange = (Math.random() * 2 - 1) * 0.02; // ±2% месечна промяна
      const trendFactor = 1 + (i * 0.003); // Общ тренд нагоре
      const value = currentPrice * (1 + monthlyChange) * trendFactor;

      return {
        date: format(date, 'MMM yyyy', { locale: bg }),
        value: Math.round(value)
      };
    });
  }

  private generateSimilarProperties(basePrice: number, location: string, type: string): PropertyMarketData['similarProperties'] {
    const sources = ['imot.bg', 'imoti.net', 'homes.bg'];
    const features = [
      'Южно изложение',
      'Обзаведен',
      'Асансьор',
      'Паркомясто',
      'След ремонт',
      'С АКТ 16',
      'Нова сграда',
      'Контролиран достъп'
    ];

    return Array.from({ length: 5 }).map(() => {
      const priceVariation = 0.85 + Math.random() * 0.3; // ±15% вариация
      const source = sources[Math.floor(Math.random() * sources.length)];
      
      return {
        price: Math.round(basePrice * priceVariation),
        location: `${location}, ${this.getRandomNeighborhood(location)}`,
        features: this.getRandomSubset(features, 3),
        source,
        url: `https://${source}/property-${Math.random().toString(36).substring(7)}`
      };
    });
  }

  private getRandomNeighborhood(city: string): string {
    const neighborhoods: Record<string, string[]> = {
      'София': ['Лозенец', 'Витоша', 'Младост', 'Люлин', 'Дружба', 'Център'],
      'Пловдив': ['Тракия', 'Смирненски', 'Център', 'Кючук Париж'],
      'Варна': ['Чайка', 'Левски', 'Владислав Варненчик', 'Младост'],
      'default': ['Център', 'Запад', 'Изток']
    };
    
    const cityNeighborhoods = neighborhoods[city] || neighborhoods.default;
    return cityNeighborhoods[Math.floor(Math.random() * cityNeighborhoods.length)];
  }

  private getRandomSubset<T>(array: T[], count: number): T[] {
    return array.sort(() => Math.random() - 0.5).slice(0, count);
  }
}

// Фасада за достъп до данни с кеширане
export class PropertyDataProvider {
  private static instance: PropertyDataProvider;
  private cache: Map<string, { data: PropertyMarketData; timestamp: number }>;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 час

  private constructor(private dataSource: PropertyDataSource) {
    this.cache = new Map();
  }

  static getInstance(source: PropertyDataSource = new MockDataSource()): PropertyDataProvider {
    if (!PropertyDataProvider.instance) {
      PropertyDataProvider.instance = new PropertyDataProvider(source);
    }
    return PropertyDataProvider.instance;
  }

  async getMarketData(location: string, propertyType: string, size: number): Promise<PropertyMarketData> {
    const cacheKey = `${location}-${propertyType}-${size}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const data = await this.dataSource.getMarketData(location, propertyType, size);
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching property data:', error);
      // Ако основният източник на данни се провали, връщаме mock данни
      const fallbackSource = new MockDataSource();
      return fallbackSource.getMarketData(location, propertyType, size);
    }
  }
}
