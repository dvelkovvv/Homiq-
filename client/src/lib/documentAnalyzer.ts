interface ExtractedData {
  squareMeters?: number;
  constructionYear?: number;
  address?: string;
  documentType?: string;
}

export class DocumentAnalyzer {
  static async analyzeDocument(text: string): Promise<ExtractedData> {
    const data: ExtractedData = {};

    // Определяме типа на документа
    const lowerText = text.toLowerCase();
    if (lowerText.includes('нотариален акт')) {
      data.documentType = 'notary_act';
    } else if (lowerText.includes('скица')) {
      data.documentType = 'sketch';
    } else if (lowerText.includes('данъчна оценка')) {
      data.documentType = 'tax_assessment';
    }

    // Търсим квадратура
    const areaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:кв\.м|кв\.метра|m2|квадратни метра)/i);
    if (areaMatch) {
      data.squareMeters = parseFloat(areaMatch[1]);
    }

    // Търсим година на строителство
    const yearMatch = text.match(/построен(?:а|о)?\s*(?:през|в)?\s*(\d{4})/i);
    if (yearMatch) {
      data.constructionYear = parseInt(yearMatch[1]);
    }

    // Търсим адрес
    const addressMatch = text.match(/(?:адрес|находящ се|разположен)[:\s]+([^\n]+)/i);
    if (addressMatch) {
      data.address = addressMatch[1].trim();
    }

    return data;
  }
}