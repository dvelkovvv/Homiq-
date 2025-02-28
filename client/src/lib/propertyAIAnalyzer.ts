import { Property, Evaluation } from "@shared/schema";

export class PropertyAIAnalyzer {
  // Evaluation weights
  private static readonly DOCUMENTS_WEIGHT = 0.4;
  private static readonly MANUAL_DATA_WEIGHT = 0.3;
  private static readonly MARKET_TRENDS_WEIGHT = 0.2;
  private static readonly PHOTOS_WEIGHT = 0.1;

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

      // Calculate each component with weights
      const documentsAnalysis = await this.analyzeDocuments(property);
      const manualDataAnalysis = await this.analyzeManualData(property);
      const marketAnalysis = await this.analyzeMarketTrends(property);
      const photosAnalysis = await this.analyzePhotos(property);

      // Calculate weighted final value
      const estimatedValue = this.calculateWeightedValue(
        documentsAnalysis.value,
        manualDataAnalysis.value,
        marketAnalysis.value,
        photosAnalysis.value
      );

      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence({
        documents: documentsAnalysis.confidence,
        manualData: manualDataAnalysis.confidence,
        market: marketAnalysis.confidence,
        photos: photosAnalysis.confidence
      });

      return {
        estimatedValue,
        confidence,
        evaluationType: "quick",
        status: "pending",
        locationScore: manualDataAnalysis.locationScore,
        marketScore: marketAnalysis.score,
        infrastructureScore: marketAnalysis.infrastructureScore,
        buildingScore: manualDataAnalysis.buildingScore,
        amenitiesNearby: marketAnalysis.amenities,
        marketTrends: {
          pricePerSqm: marketAnalysis.pricePerSqm,
          yearlyChange: marketAnalysis.yearlyChange,
          demandLevel: marketAnalysis.demandLevel,
          supplyLevel: marketAnalysis.supplyLevel,
          averageDaysOnMarket: marketAnalysis.daysOnMarket
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

  private async analyzeDocuments(property: Property) {
    // Mock document analysis for now
    // This would be replaced with actual document processing logic
    return {
      value: property.squareMeters * 1000, // Base value from documents
      confidence: 0.85,
    };
  }

  private async analyzeManualData(property: Property) {
    const buildingScore = this.calculateBuildingScore(property);
    const locationScore = await this.calculateLocationScore(property.location);
    const basePrice = this.calculateBasePrice(property);

    return {
      value: basePrice * property.squareMeters * (locationScore / 5),
      confidence: 0.9,
      buildingScore,
      locationScore
    };
  }

  private async analyzeMarketTrends(property: Property) {
    // Mock market analysis data
    const marketTrends = {
      pricePerSqm: 1200,
      yearlyChange: 5.2,
      demandLevel: 85,
      supplyLevel: 70,
      daysOnMarket: 45
    };

    const amenities = {
      schools: 85,
      transport: 90,
      shopping: 75,
      healthcare: 80,
      recreation: 85
    };

    const score = (marketTrends.demandLevel - marketTrends.supplyLevel) * 0.1;

    return {
      value: property.squareMeters * marketTrends.pricePerSqm,
      confidence: 0.8,
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

  private async analyzePhotos(property: Property) {
    // Mock photo analysis for now
    // This would be replaced with actual image processing logic
    return {
      value: property.squareMeters * 900, // Conservative estimate from photos
      confidence: 0.7
    };
  }

  private calculateWeightedValue(
    documentsValue: number,
    manualDataValue: number,
    marketValue: number,
    photosValue: number
  ): number {
    return Math.round(
      documentsValue * PropertyAIAnalyzer.DOCUMENTS_WEIGHT +
      manualDataValue * PropertyAIAnalyzer.MANUAL_DATA_WEIGHT +
      marketValue * PropertyAIAnalyzer.MARKET_TRENDS_WEIGHT +
      photosValue * PropertyAIAnalyzer.PHOTOS_WEIGHT
    );
  }

  private calculateOverallConfidence(confidences: {
    documents: number;
    manualData: number;
    market: number;
    photos: number;
  }): number {
    return (
      confidences.documents * PropertyAIAnalyzer.DOCUMENTS_WEIGHT +
      confidences.manualData * PropertyAIAnalyzer.MANUAL_DATA_WEIGHT +
      confidences.market * PropertyAIAnalyzer.MARKET_TRENDS_WEIGHT +
      confidences.photos * PropertyAIAnalyzer.PHOTOS_WEIGHT
    );
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

    return Math.min(Math.max(score, 0), 10);
  }

  private calculateBasePrice(property: Property): number {
    const basePrices = {
      apartment: 1200,
      house: 1000,
      villa: 1500,
      agricultural: 50
    };

    return basePrices[property.type] || 1000;
  }

  private async calculateLocationScore(location: { lat: number, lng: number }): Promise<number> {
    const mockLocationData = {
      transportAccess: 0.85,  // 0-1 score for public transport
      amenities: 0.90,        // 0-1 score for nearby amenities
      neighborhood: 0.80,     // 0-1 score for neighborhood quality
      development: 0.75       // 0-1 score for area development
    };

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

    return Math.round(weightedScore * 100) / 10;
  }
}

export default PropertyAIAnalyzer.getInstance();