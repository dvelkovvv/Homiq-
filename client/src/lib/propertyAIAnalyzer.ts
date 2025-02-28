import { Property, Evaluation } from "@shared/schema";

export class PropertyAIAnalyzer {
  private static readonly CONFIDENCE_THRESHOLD = 0.75;
  private static instance: PropertyAIAnalyzer;

  private constructor() {}

  public static getInstance(): PropertyAIAnalyzer {
    if (!PropertyAIAnalyzer.instance) {
      PropertyAIAnalyzer.instance = new PropertyAIAnalyzer();
    }
    return PropertyAIAnalyzer.instance;
  }

  public async analyzeProperty(property: Property): Promise<Partial<Evaluation>> {
    try {
      // Validate input data
      this.validatePropertyData(property);

      // Calculate base metrics
      const baseMetrics = await this.calculateBaseMetrics(property);

      // Calculate location score with more precise factors
      const locationScore = await this.calculateLocationScore(property.location);

      // Get market analysis data
      const marketMetrics = await this.calculateMarketMetrics(property);

      // Calculate final estimated value
      const estimatedValue = this.calculateEstimatedValue(
        property,
        baseMetrics,
        locationScore,
        marketMetrics
      );

      return {
        estimatedValue,
        confidence: this.calculateConfidence(baseMetrics, locationScore, marketMetrics),
        evaluationType: "quick",
        status: "pending",
        locationScore,
        marketScore: marketMetrics.score,
        infrastructureScore: marketMetrics.infrastructureScore,
        buildingScore: baseMetrics.buildingScore,
        amenitiesNearby: marketMetrics.amenities,
        marketTrends: {
          pricePerSqm: marketMetrics.pricePerSqm,
          yearlyChange: marketMetrics.yearlyChange,
          demandLevel: marketMetrics.demandLevel,
          supplyLevel: marketMetrics.supplyLevel,
          averageDaysOnMarket: marketMetrics.daysOnMarket
        }
      };
    } catch (error) {
      console.error('Error in property analysis:', error);
      throw new Error('Failed to analyze property');
    }
  }

  private validatePropertyData(property: Property): void {
    if (!property.squareMeters || property.squareMeters <= 0) {
      throw new Error('Invalid property area');
    }
    if (!property.location || !property.location.lat || !property.location.lng) {
      throw new Error('Invalid property location');
    }
  }

  private async calculateBaseMetrics(property: Property) {
    // Calculate base price per square meter based on property type and characteristics
    const basePrice = this.calculateBasePrice(property);

    // Calculate building quality score
    const buildingScore = this.calculateBuildingScore(property);

    // Calculate age factor
    const ageFactor = this.calculateAgeFactor(property.yearBuilt);

    return {
      basePrice: basePrice * ageFactor,
      buildingScore,
      ageFactor
    };
  }

  private calculateBasePrice(property: Property): number {
    // Base prices per square meter for different property types
    const basePrices = {
      apartment: 1200,
      house: 1000,
      villa: 1500,
      agricultural: 50
    };

    return basePrices[property.type] || 1000;
  }

  private calculateBuildingScore(property: Property): number {
    let score = 7.5; // Base score

    // Adjust based on building type
    if (property.buildingType) {
      const buildingTypeScores = {
        brick: 1.5,
        concrete: 1.0,
        panel: 0.5,
        wooden: 0
      };
      score += buildingTypeScores[property.buildingType] || 0;
    }

    // Adjust based on condition
    if (property.condition) {
      const conditionScores = {
        excellent: 2.0,
        good: 1.0,
        needs_repair: -1.0,
        needs_renovation: -2.0
      };
      score += conditionScores[property.condition] || 0;
    }

    // Ensure score is between 0 and 10
    return Math.min(Math.max(score, 0), 10);
  }

  private calculateAgeFactor(yearBuilt?: number): number {
    if (!yearBuilt) return 0.9;

    const age = new Date().getFullYear() - yearBuilt;

    if (age <= 5) return 1.2;  // New construction premium
    if (age <= 10) return 1.1; // Nearly new
    if (age <= 20) return 1.0; // Modern
    if (age <= 40) return 0.9; // Middle-aged
    if (age <= 60) return 0.8; // Older
    return 0.7; // Historic
  }

  private async calculateLocationScore(location: { lat: number, lng: number }): Promise<number> {
    // TODO: In the future, this will integrate with external APIs for location data
    // For now, using mock data with realistic scoring
    const mockLocationData = {
      transportAccess: 0.85,  // 0-1 score for public transport
      amenities: 0.90,        // 0-1 score for nearby amenities
      neighborhood: 0.80,     // 0-1 score for neighborhood quality
      development: 0.75       // 0-1 score for area development
    };

    // Weighted average of location factors
    const weights = {
      transportAccess: 0.3,
      amenities: 0.25,
      neighborhood: 0.25,
      development: 0.2
    };

    const weightedScore = Object.entries(mockLocationData)
      .reduce((score, [key, value]) => {
        return score + value * weights[key as keyof typeof weights];
      }, 0);

    // Convert to 0-10 scale and round to 1 decimal
    return Math.round(weightedScore * 100) / 10;
  }

  private async calculateMarketMetrics(property: Property) {
    // Mock market analysis data - to be replaced with real market data API
    const marketTrends = {
      pricePerSqm: 1200,
      yearlyChange: 5.2,
      demandLevel: 85,
      supplyLevel: 70,
      daysOnMarket: 45
    };

    const amenities = {
      schools: 85,   // Score 0-100
      transport: 90,
      shopping: 75,
      healthcare: 80,
      recreation: 85
    };

    // Calculate overall market score
    const score = (marketTrends.demandLevel - marketTrends.supplyLevel) * 0.1;

    return {
      score: Math.min(Math.max(score, 0), 10),
      infrastructureScore: 8.5,
      pricePerSqm: marketTrends.pricePerSqm,
      yearlyChange: marketTrends.yearlyChange,
      demandLevel: marketTrends.demandLevel,
      supplyLevel: marketTrends.supplyLevel,
      daysOnMarket: marketTrends.daysOnMarket,
      amenities
    };
  }

  private calculateEstimatedValue(
    property: Property,
    baseMetrics: { basePrice: number, buildingScore: number },
    locationScore: number,
    marketMetrics: { score: number }
  ): number {
    const locationFactor = (locationScore / 5) + 0.5; // Convert 0-10 score to 0.5-2.5 factor
    const marketFactor = (marketMetrics.score / 5) + 0.5;
    const buildingFactor = (baseMetrics.buildingScore / 5) + 0.5;

    const adjustedPricePerSqm = baseMetrics.basePrice * 
      locationFactor * 
      marketFactor * 
      buildingFactor;

    return Math.round(adjustedPricePerSqm * property.squareMeters);
  }

  private calculateConfidence(
    baseMetrics: { buildingScore: number },
    locationScore: number,
    marketMetrics: { score: number }
  ): number {
    const weights = {
      building: 0.3,
      location: 0.4,
      market: 0.3
    };

    const confidence = 
      (baseMetrics.buildingScore / 10 * weights.building) +
      (locationScore / 10 * weights.location) +
      (marketMetrics.score / 10 * weights.market);

    return Math.min(Math.max(confidence, 0), 1);
  }
}

export default PropertyAIAnalyzer.getInstance();