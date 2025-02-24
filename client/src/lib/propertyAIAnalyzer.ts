import { Property } from "@shared/schema";
import { format } from "date-fns";
import { bg } from "date-fns/locale";

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export interface DocumentAnalysis {
  type: 'notary_act' | 'sketch' | 'tax_assessment' | 'other';
  confidence: number;
  extractedData: {
    squareMeters?: number;
    constructionYear?: number;
    address?: string;
    taxAssessment?: number;
    constructionType?: string;
    landArea?: number;
    buildingRights?: string;
    propertyType?: string;
    floorNumber?: number;
    totalFloors?: number;
    parkingSpots?: number;
    buildingEntrance?: string;
    cadastralNumber?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    buildingFootprint?: number;
    buildingHeight?: number;
    allowedUsage?: string[];
    developmentDensity?: number;
    floorAreaRatio?: number;
    neighboringProperties?: Array<{
      cadastralNumber: string;
      type: string;
    }>;
  };
}

export interface AIPropertyAnalysis {
  estimatedValue: number;
  confidence: number;
  valueRange: {
    min: number;
    max: number;
  };
  documentAnalysis: {
    totalDocuments: number;
    averageConfidence: number;
    documentScores: {
      [key: string]: {
        relevance: number;
        confidence: number;
        impact: number;
      };
    };
  };
  locationAnalysis: {
    score: number;
    confidence: number;
    details: {
      accessibility: number;
      infrastructure: number;
      development: number;
      greenAreas: number;
    };
    nearbyAmenities: Array<{
      type: string;
      distance: number;
      impact: number;
    }>;
  };
  constructionAnalysis: {
    score: number;
    confidence: number;
    details: {
      buildingQuality: number;
      maintenanceLevel: number;
      energyEfficiency: number;
      seismicStability: number;
    };
    recommendations: string[];
  };
  marketAnalysis: {
    currentTrend: 'rising' | 'stable' | 'declining';
    confidence: number;
    details: {
      demandLevel: number;
      supplyLevel: number;
      priceVolatility: number;
      averageDaysOnMarket: number;
    };
    forecast: Array<{
      period: string;
      predictedValue: number;
      confidence: number;
    }>;
  };
  legalAnalysis: {
    score: number;
    confidence: number;
    details: {
      ownershipStatus: string;
      encumbrances: string[];
      regulatoryCompliance: number;
      zoningStatus: string;
    };
    risks: string[];
  };
  investmentAnalysis: {
    score: number;
    confidence: number;
    details: {
      rentalYield: number;
      appreciationPotential: number;
      cashFlowPotential: number;
      breakEvenPeriod: number;
    };
    scenarios: {
      conservative: {
        returnRate: number;
        predictedValue: number;
        timeline: number;
      };
      moderate: {
        returnRate: number;
        predictedValue: number;
        timeline: number;
      };
      aggressive: {
        returnRate: number;
        predictedValue: number;
        timeline: number;
      };
    };
  };
}

export class PropertyAIAnalyzer {
  private static instance: PropertyAIAnalyzer;
  private readonly CONFIDENCE_THRESHOLD = 0.75;

  private constructor() {}

  public static getInstance(): PropertyAIAnalyzer {
    if (!PropertyAIAnalyzer.instance) {
      PropertyAIAnalyzer.instance = new PropertyAIAnalyzer();
    }
    return PropertyAIAnalyzer.instance;
  }

  private async callDeepSeekAPI(prompt: string): Promise<any> {
    if (!DEEPSEEK_API_KEY) {
      console.warn('DeepSeek API key not found, using fallback extraction');
      throw new Error('DeepSeek API key not configured');
    }

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are a specialized real estate document analyzer. Extract specific information from the document and return it in JSON format. Pay special attention to numbers, measurements, and technical specifications."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw error;
    }
  }

  private async extractDataFromText(text: string, documentType: DocumentAnalysis['type']): Promise<DocumentAnalysis['extractedData']> {
    try {
      if (!DEEPSEEK_API_KEY) {
        return this.fallbackExtraction(text, documentType);
      }

      const prompt = this.generatePromptForDocumentType(text, documentType);
      const result = await this.callDeepSeekAPI(prompt);
      return this.validateAndCleanData(result, documentType);
    } catch (error) {
      console.error('Error analyzing document with AI:', error);
      return this.fallbackExtraction(text, documentType);
    }
  }

  private generatePromptForDocumentType(text: string, documentType: DocumentAnalysis['type']): string {
    switch (documentType) {
      case 'sketch':
        return `Analyze this cadastral sketch and extract the following information in JSON format:
          - cadastralNumber (string): The cadastral identifier
          - buildingFootprint (number): Built-up area in square meters
          - landArea (number): Total land area in square meters
          - buildingHeight (number): Building height in meters
          - allowedUsage (array): Allowed usage types
          - developmentDensity (number): Development density percentage
          - floorAreaRatio (number): Floor area ratio
          - neighboringProperties (array): Array of neighboring properties with their cadastral numbers and types

          Document text:
          ${text}`;

      case 'notary_act':
        return `Analyze this notary act and extract the following information in JSON format:
          - address (string): Full property address
          - propertyType (string): Type of property
          - squareMeters (number): Total area in square meters
          - constructionYear (number): Year of construction
          - constructionType (string): Type of construction
          - floorNumber (number): Floor number
          - totalFloors (number): Total floors in building

          Document text:
          ${text}`;

      case 'tax_assessment':
        return `Analyze this tax assessment document and extract the following information in JSON format:
          - taxAssessment (number): Tax assessment value
          - cadastralNumber (string): Cadastral identifier
          - squareMeters (number): Property area
          - constructionYear (number): Year of construction

          Document text:
          ${text}`;

      default:
        return `Analyze this real estate document and extract any relevant property information in JSON format.
          Document text:
          ${text}`;
    }
  }

  private validateAndCleanData(data: any, documentType: DocumentAnalysis['type']): DocumentAnalysis['extractedData'] {
    const cleanData: DocumentAnalysis['extractedData'] = {};

    if (typeof data.squareMeters === 'number' && data.squareMeters > 0) {
      cleanData.squareMeters = data.squareMeters;
    }
    if (typeof data.constructionYear === 'number' && data.constructionYear > 1800) {
      cleanData.constructionYear = data.constructionYear;
    }
    if (typeof data.address === 'string' && data.address.length > 5) {
      cleanData.address = data.address;
    }

    switch (documentType) {
      case 'sketch':
        if (typeof data.buildingFootprint === 'number' && data.buildingFootprint > 0) {
          cleanData.buildingFootprint = data.buildingFootprint;
        }
        if (typeof data.landArea === 'number' && data.landArea > 0) {
          cleanData.landArea = data.landArea;
        }
        if (Array.isArray(data.allowedUsage)) {
          cleanData.allowedUsage = data.allowedUsage;
        }
        if (typeof data.developmentDensity === 'number' && data.developmentDensity > 0) {
          cleanData.developmentDensity = data.developmentDensity;
        }
        if (typeof data.cadastralNumber === 'string' && data.cadastralNumber.length > 0) {
          cleanData.cadastralNumber = data.cadastralNumber;
        }
        break;

      case 'notary_act':
        if (typeof data.propertyType === 'string') {
          cleanData.propertyType = data.propertyType;
        }
        if (typeof data.constructionType === 'string') {
          cleanData.constructionType = data.constructionType;
        }
        if (typeof data.floorNumber === 'number') {
          cleanData.floorNumber = data.floorNumber;
        }
        if (typeof data.totalFloors === 'number') {
          cleanData.totalFloors = data.totalFloors;
        }
        break;

      case 'tax_assessment':
        if (typeof data.taxAssessment === 'number' && data.taxAssessment > 0) {
          cleanData.taxAssessment = data.taxAssessment;
        }
        break;
    }

    return cleanData;
  }

  private fallbackExtraction(text: string, documentType: DocumentAnalysis['type']): DocumentAnalysis['extractedData'] {
    const data: DocumentAnalysis['extractedData'] = {};

    const areaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:кв\.м|кв\.метра|m2|квадратни метра)/i);
    if (areaMatch) {
      data.squareMeters = parseFloat(areaMatch[1]);
    }

    const yearMatch = text.match(/построен(?:а|о)?\s*(?:през|в)?\s*(\d{4})/i);
    if (yearMatch) {
      data.constructionYear = parseInt(yearMatch[1]);
    }

    const cadastralMatch = text.match(/(?:кадастрален номер|идентификатор)[:\s]+([0-9.]+)/i);
    if (cadastralMatch) {
      data.cadastralNumber = cadastralMatch[1];
    }

    if (documentType === 'tax_assessment') {
      const taxMatch = text.match(/данъчна\s*оценка[:\s]*(\d+(?:\s*\d+)*(?:\.\d+)?)/i);
      if (taxMatch) {
        data.taxAssessment = parseFloat(taxMatch[1].replace(/\s/g, ''));
      }
    }

    return data;
  }

  public async analyzeDocument(text: string, documentType: DocumentAnalysis['type'] = 'other'): Promise<DocumentAnalysis> {
    try {
      const extractedData = await this.extractDataFromText(text, documentType);

      const totalFields = Object.keys(extractedData).length;
      const expectedFields = documentType === 'sketch' ? 8 :
                           documentType === 'notary_act' ? 7 :
                           documentType === 'tax_assessment' ? 4 : 3;

      const confidence = Math.min(totalFields / expectedFields, 1);

      return {
        type: documentType,
        confidence,
        extractedData
      };
    } catch (error) {
      console.error('Error in document analysis:', error);
      return {
        type: documentType,
        confidence: 0,
        extractedData: {}
      };
    }
  }

  public async analyzeProperty(
    property: Property,
    documents: DocumentAnalysis[]
  ): Promise<AIPropertyAnalysis> {
    const consolidatedData = this.consolidateDocumentData(documents);
    const baseAnalysis = await this.calculateBaseValue(property, consolidatedData);
    const locationAnalysis = await this.analyzeLocation(
      consolidatedData.address || property.location
    );
    const constructionAnalysis = await this.analyzeConstruction(
      consolidatedData,
      property
    );
    const marketAnalysis = await this.analyzeMarket(
      property,
      consolidatedData,
      locationAnalysis
    );
    const legalAnalysis = await this.analyzeLegalAspects(documents);
    const investmentAnalysis = await this.analyzeInvestmentPotential(
      baseAnalysis,
      marketAnalysis,
      locationAnalysis
    );

    return {
      estimatedValue: baseAnalysis.estimatedValue,
      confidence: this.calculateOverallConfidence([
        baseAnalysis.confidence,
        locationAnalysis.confidence,
        constructionAnalysis.confidence,
        marketAnalysis.confidence
      ]),
      valueRange: {
        min: baseAnalysis.estimatedValue * 0.95,
        max: baseAnalysis.estimatedValue * 1.05
      },
      documentAnalysis: {
        totalDocuments: documents.length,
        averageConfidence: this.calculateAverageConfidence(documents),
        documentScores: this.calculateDocumentScores(documents)
      },
      locationAnalysis,
      constructionAnalysis,
      marketAnalysis,
      legalAnalysis,
      investmentAnalysis
    };
  }

  private consolidateDocumentData(documents: DocumentAnalysis[]): Record<string, any> {
    const consolidatedData: Record<string, any> = {};
    const confidenceMap: Record<string, number> = {};

    for (const doc of documents) {
      for (const [key, value] of Object.entries(doc.extractedData)) {
        if (!value) continue;

        if (!consolidatedData[key] || doc.confidence > (confidenceMap[key] || 0)) {
          consolidatedData[key] = value;
          confidenceMap[key] = doc.confidence;
        }
      }
    }

    return consolidatedData;
  }

  private async calculateBaseValue(
    property: Property,
    consolidatedData: Record<string, any>
  ) {
    const basePrice = this.getLocationBasePrice(property.location);
    const constructionFactor = this.getConstructionFactor(
      consolidatedData.constructionType
    );
    const ageFactor = this.getAgeFactor(consolidatedData.constructionYear);
    const area = consolidatedData.squareMeters || property.squareMeters;

    const estimatedValue = basePrice * area * constructionFactor * ageFactor;

    return {
      estimatedValue,
      confidence: this.calculateConfidenceScore([
        constructionFactor !== 1 ? 0.9 : 0.7,
        consolidatedData.constructionYear ? 0.9 : 0.7,
        consolidatedData.squareMeters ? 0.95 : 0.8
      ])
    };
  }

  private getLocationBasePrice(location: string): number {
    const priceMap: Record<string, number> = {
      'София': 2200,
      'Пловдив': 1500,
      'Варна': 1700,
      'Бургас': 1400,
      'default': 1000
    };
    return priceMap[location] || priceMap.default;
  }

  private getConstructionFactor(type?: string): number {
    if (!type) return 1;
    const factors: Record<string, number> = {
      'тухла': 1.2,
      'стоманобетон': 1.15,
      'панел': 0.9,
      'ЕПК': 0.95,
      'гредоред': 0.85
    };
    return factors[type.toLowerCase()] || 1;
  }

  private getAgeFactor(year?: number): number {
    if (!year) return 0.9;
    const age = new Date().getFullYear() - year;
    if (age < 5) return 1.3;
    if (age < 15) return 1.1;
    if (age < 30) return 0.9;
    if (age < 50) return 0.7;
    return 0.5;
  }

  private async analyzeLocation(location: string) {
    const premiumLocations = ['витоша', 'лозенец', 'иван вазов', 'докторски паметник'];
    const goodLocations = ['младост', 'студентски град', 'център'];

    const lowerLocation = location.toLowerCase();
    let score = 0.75;

    if (premiumLocations.some(loc => lowerLocation.includes(loc))) {
      score = 0.95;
    } else if (goodLocations.some(loc => lowerLocation.includes(loc))) {
      score = 0.85;
    }

    return {
      score: score * 100,
      confidence: 0.85,
      details: {
        accessibility: Math.round(Math.random() * 20 + 80),
        infrastructure: Math.round(Math.random() * 20 + 75),
        development: Math.round(Math.random() * 20 + 70),
        greenAreas: Math.round(Math.random() * 30 + 60)
      },
      nearbyAmenities: [
        { type: "Метро", distance: 0.3, impact: 90 },
        { type: "Училище", distance: 0.5, impact: 85 },
        { type: "Парк", distance: 0.7, impact: 80 },
        { type: "Търговски център", distance: 1.2, impact: 75 }
      ]
    };
  }

  private async analyzeConstruction(
    consolidatedData: Record<string, any>,
    property: Property
  ) {
    const constructionYear = consolidatedData.constructionYear || property.yearBuilt;
    const constructionType = consolidatedData.constructionType;

    const age = constructionYear ? new Date().getFullYear() - constructionYear : 20;
    const buildingQuality = this.calculateBuildingQuality(constructionType, age);

    return {
      score: buildingQuality * 100,
      confidence: constructionYear ? 0.9 : 0.7,
      details: {
        buildingQuality: Math.round(buildingQuality * 100),
        maintenanceLevel: Math.round(Math.max(0.5, 1 - age / 100) * 100),
        energyEfficiency: Math.round(Math.max(0.4, 1 - age / 80) * 100),
        seismicStability: Math.round(this.getConstructionFactor(constructionType) * 100)
      },
      recommendations: this.generateConstructionRecommendations(age, constructionType)
    };
  }

  private calculateBuildingQuality(type?: string, age: number = 20): number {
    const baseQuality = this.getConstructionFactor(type);
    const ageFactor = Math.max(0.6, 1 - age / 100);
    return (baseQuality + ageFactor) / 2;
  }

  private generateConstructionRecommendations(age: number, type?: string): string[] {
    const recommendations: string[] = [];

    if (age > 30) {
      recommendations.push("Препоръчва се основен ремонт за подобряване на състоянието");
    }
    if (age > 20) {
      recommendations.push("Енергийна ефективност може да бъде подобрена");
    }
    if (type?.toLowerCase() === 'панел') {
      recommendations.push("Препоръчва се саниране на сградата");
    }

    return recommendations;
  }

  private async analyzeMarket(
    property: Property,
    consolidatedData: Record<string, any>,
    locationAnalysis: any
  ) {
    const basePrice = this.getLocationBasePrice(property.location);
    const currentYear = new Date().getFullYear();

    return {
      currentTrend: 'rising' as const,
      confidence: 0.85,
      details: {
        demandLevel: Math.round(locationAnalysis.score * 0.9),
        supplyLevel: Math.round(Math.random() * 20 + 60),
        priceVolatility: Math.round(Math.random() * 10 + 5),
        averageDaysOnMarket: Math.round(Math.random() * 30 + 60)
      },
      forecast: Array.from({ length: 12 }).map((_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() + i);
        const trend = 1 + (i * 0.005);
        const volatility = (Math.random() - 0.5) * 0.02;

        return {
          period: format(month, 'MMM yyyy', { locale: bg }),
          predictedValue: Math.round(basePrice * (trend + volatility)),
          confidence: 0.9 - (i * 0.05)
        };
      })
    };
  }

  private async analyzeLegalAspects(documents: DocumentAnalysis[]) {
    const notaryActs = documents.filter(doc => doc.type === 'notary_act');
    const hasValidNotaryAct = notaryActs.length > 0;

    return {
      score: hasValidNotaryAct ? 90 : 70,
      confidence: hasValidNotaryAct ? 0.9 : 0.7,
      details: {
        ownershipStatus: hasValidNotaryAct ? "Чиста собственост" : "Непълна документация",
        encumbrances: [],
        regulatoryCompliance: hasValidNotaryAct ? 95 : 75,
        zoningStatus: "Жилищна зона"
      },
      risks: this.generateLegalRisks(documents)
    };
  }

  private generateLegalRisks(documents: DocumentAnalysis[]): string[] {
    const risks: string[] = [];
    const hasAllDocs = new Set(documents.map(d => d.type));

    if (!hasAllDocs.has('notary_act')) {
      risks.push("Липсва нотариален акт");
    }
    if (!hasAllDocs.has('sketch')) {
      risks.push("Липсва актуална скица");
    }
    if (!hasAllDocs.has('tax_assessment')) {
      risks.push("Липсва данъчна оценка");
    }

    return risks;
  }

  private async analyzeInvestmentPotential(
    baseAnalysis: { estimatedValue: number; confidence: number },
    marketAnalysis: any,
    locationAnalysis: any
  ) {
    const rentalYield = 5 + Math.random() * 2;
    const monthlyRent = (baseAnalysis.estimatedValue * (rentalYield / 100)) / 12;

    return {
      score: Math.round((locationAnalysis.score + marketAnalysis.details.demandLevel) / 2),
      confidence: 0.85,
      details: {
        rentalYield,
        appreciationPotential: marketAnalysis.details.demandLevel * 0.8,
        cashFlowPotential: monthlyRent,
        breakEvenPeriod: Math.round(baseAnalysis.estimatedValue / (monthlyRent * 12))
      },
      scenarios: {
        conservative: {
          returnRate: 4 + Math.random() * 2,
          predictedValue: Math.round(baseAnalysis.estimatedValue * 1.2),
          timeline: 5
        },
        moderate: {
          returnRate: 6 + Math.random() * 2,
          predictedValue: Math.round(baseAnalysis.estimatedValue * 1.35),
          timeline: 5
        },
        aggressive: {
          returnRate: 8 + Math.random() * 2,
          predictedValue: Math.round(baseAnalysis.estimatedValue * 1.5),
          timeline: 5
        }
      }
    };
  }

  private calculateOverallConfidence(confidences: number[]): number {
    return Math.round(
      (confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100
    ) / 100;
  }

  private calculateAverageConfidence(documents: DocumentAnalysis[]): number {
    return documents.reduce((sum, doc) => sum + doc.confidence, 0) / documents.length;
  }

  private calculateDocumentScores(documents: DocumentAnalysis[]): Record<string, any> {
    const scores: Record<string, any> = {};

    for (const doc of documents) {
      scores[doc.type] = {
        relevance: this.calculateDocumentRelevance(doc),
        confidence: doc.confidence,
        impact: this.calculateDocumentImpact(doc)
      };
    }

    return scores;
  }

  private calculateDocumentRelevance(doc: DocumentAnalysis): number {
    const weights: Record<string, number> = {
      'notary_act': 1,
      'sketch': 0.8,
      'tax_assessment': 0.7,
      'other': 0.5
    };
    return weights[doc.type] || 0.5;
  }

  private calculateDocumentImpact(doc: DocumentAnalysis): number {
    const dataPoints = Object.values(doc.extractedData).filter(v => v !== undefined).length;
    const maxDataPoints = Object.keys(doc.extractedData).length;
    return Math.round((dataPoints / maxDataPoints) * 100);
  }

  private calculateConfidenceScore(scores: number[]): number {
    return Math.round(
      (scores.reduce((a, b) => a + b, 0) / scores.length) * 100
    ) / 100;
  }
}