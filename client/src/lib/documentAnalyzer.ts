import { createWorker } from 'tesseract.js';

interface ExtractedPropertyData {
  squareMeters?: number;
  constructionYear?: number;
  address?: string;
  documentType?: string;
}

interface AnalysisResult {
  extractedData: ExtractedPropertyData;
  confidence: number;
}

export class DocumentAnalyzer {
  static async analyzeDocument(text: string): Promise<AnalysisResult> {
    const result: ExtractedPropertyData = {};
    let foundFields = 0;
    let totalFields = 3; // базови полета които търсим

    // Определяме типа на документа
    const lowerText = text.toLowerCase();
    if (lowerText.includes('нотариален акт')) {
      result.documentType = 'notary_act';
    } else if (lowerText.includes('скица')) {
      result.documentType = 'sketch';
    } else if (lowerText.includes('данъчна оценка')) {
      result.documentType = 'tax_assessment';
    }

    // Търсим квадратура
    const areaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:кв\.м|кв\.метра|m2|квадратни метра)/i);
    if (areaMatch) {
      result.squareMeters = parseFloat(areaMatch[1]);
      foundFields++;
    }

    // Търсим година на строителство
    const yearMatch = text.match(/построен(?:а|о)?\s*(?:през|в)?\s*(\d{4})/i);
    if (yearMatch) {
      result.constructionYear = parseInt(yearMatch[1]);
      foundFields++;
    }

    // Търсим адрес
    const addressMatch = text.match(/(?:адрес|находящ се|разположен)[:\s]+([^\n]+)/i);
    if (addressMatch) {
      result.address = addressMatch[1].trim();
      foundFields++;
    }

    return {
      extractedData: result,
      confidence: foundFields / totalFields
    };
  }
}