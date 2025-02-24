import { createWorker } from 'tesseract.js';

interface ExtractedPropertyData {
  squareMeters?: number;
  constructionYear?: number;
  address?: string;
}

interface AnalysisResult {
  extractedData: ExtractedPropertyData;
  confidence: number;
}

export class DocumentAnalyzer {
  static async analyzeDocument(text: string): Promise<AnalysisResult> {
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
    const addressMatch = text.match(/(?:адрес|находящ се|разположен)[:\s]+([^\n]+)/i);
    if (addressMatch) {
      result.address = addressMatch[1].trim();
      confidenceScore += 1;
    }
    totalChecks++;

    return {
      extractedData: result,
      confidence: (confidenceScore / totalChecks)
    };
  }
}