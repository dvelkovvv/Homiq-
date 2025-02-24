import { createWorker } from 'tesseract.js';

interface ExtractedPropertyData {
  squareMeters?: number;
  constructionYear?: number;
  address?: string;
  taxAssessment?: number;
  constructionType?: string;
}

interface AnalysisResult {
  extractedData: ExtractedPropertyData;
  confidence: number;
}

export class DocumentAnalyzer {
  private static readonly CONSTRUCTION_TYPES = [
    'ЕПК',
    'тухла',
    'панел',
    'гредоред',
    'стоманобетон',
    'масивна конструкция'
  ];

  private static readonly ADDRESS_MARKERS = [
    'адрес',
    'находящ се',
    'разположен',
    'ул.',
    'бул.',
    'ж.к.'
  ];

  static async analyzeDocument(text: string): Promise<AnalysisResult> {
    const lines = text.split('\n').map(line => line.toLowerCase().trim());
    const result: ExtractedPropertyData = {};
    let confidenceScore = 0;
    let totalChecks = 0;

    // Търсим квадратура
    const areaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:кв\.м|кв\.метра|m2|квадратни метра)/i);
    if (areaMatch) {
      result.squareMeters = parseFloat(areaMatch[1]);
      confidenceScore += 1;
    }
    totalChecks++;

    // Търсим година на строителство
    const yearMatch = text.match(/построен(?:а|о)?\s*(?:през|в)?\s*(\d{4})/i);
    if (yearMatch) {
      result.constructionYear = parseInt(yearMatch[1]);
      confidenceScore += 1;
    }
    totalChecks++;

    // Търсим адрес
    for (const line of lines) {
      if (DocumentAnalyzer.ADDRESS_MARKERS.some(marker => line.includes(marker))) {
        result.address = line
          .replace(/[^\wа-яА-Я\s.,\-]/g, '')
          .trim();
        confidenceScore += 1;
        break;
      }
    }
    totalChecks++;

    // Търсим данъчна оценка
    const taxMatch = text.match(/данъчна\s*оценка[:\s]*(\d+(?:\s*\d+)*(?:\.\d+)?)/i);
    if (taxMatch) {
      result.taxAssessment = parseFloat(taxMatch[1].replace(/\s/g, ''));
      confidenceScore += 1;
    }
    totalChecks++;

    // Търсим тип конструкция
    for (const type of DocumentAnalyzer.CONSTRUCTION_TYPES) {
      if (text.toLowerCase().includes(type.toLowerCase())) {
        result.constructionType = type;
        confidenceScore += 1;
        break;
      }
    }
    totalChecks++;

    return {
      extractedData: result,
      confidence: (confidenceScore / totalChecks) * 100
    };
  }

  static validateData(data: ExtractedPropertyData): string[] {
    const warnings: string[] = [];

    if (!data.squareMeters) {
      warnings.push("Не беше открита информация за квадратурата");
    } else if (data.squareMeters < 20 || data.squareMeters > 500) {
      warnings.push("Открита е необичайна квадратура");
    }

    if (data.constructionYear) {
      const currentYear = new Date().getFullYear();
      if (data.constructionYear < 1900 || data.constructionYear > currentYear) {
        warnings.push("Открита е невалидна година на строителство");
      }
    }

    if (data.taxAssessment && data.taxAssessment <= 0) {
      warnings.push("Открита е невалидна данъчна оценка");
    }

    return warnings;
  }
}
