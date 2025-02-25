interface ExtractedData {
  squareMeters?: number;
  constructionYear?: number;
  address?: string;
  documentType?: string;
  price?: number;
  rooms?: number;
  floor?: number;
  totalFloors?: number;
}

export class DocumentAnalyzer {
  static async analyzeDocument(text: string): Promise<ExtractedData> {
    const data: ExtractedData = {};
    const lowerText = text.toLowerCase();

    // Определяме типа на документа
    if (lowerText.includes('нотариален акт') || lowerText.includes('нотариус')) {
      data.documentType = 'notary_act';
    } else if (lowerText.includes('скица') || lowerText.includes('кадастър')) {
      data.documentType = 'sketch';
    } else if (lowerText.includes('данъчна оценка')) {
      data.documentType = 'tax_assessment';
    }

    // Търсим квадратура (различни формати)
    const areaPatterns = [
      /(\d+(?:\.\d+)?)\s*(?:кв\.м|кв\.метра|m2|квадратни метра|кв\. м\.)/i,
      /площ от\s*(\d+(?:\.\d+)?)/i,
      /застроена площ[:\s]+(\d+(?:\.\d+)?)/i
    ];

    for (const pattern of areaPatterns) {
      const match = text.match(pattern);
      if (match) {
        const area = parseFloat(match[1]);
        if (area > 0 && area < 10000) { // Валидация на разумни стойности
          data.squareMeters = area;
          break;
        }
      }
    }

    // Търсим година на строителство
    const yearPatterns = [
      /построен(?:а|о)?\s*(?:през|в)?\s*(\d{4})/i,
      /година на построяване[:\s]+(\d{4})/i,
      /строителство[:\s]+(\d{4})/i
    ];

    for (const pattern of yearPatterns) {
      const match = text.match(pattern);
      if (match) {
        const year = parseInt(match[1]);
        if (year > 1800 && year <= new Date().getFullYear()) {
          data.constructionYear = year;
          break;
        }
      }
    }

    // Търсим адрес
    const addressPatterns = [
      /(?:адрес|находящ се|разположен)[:\s]+([^\n]+)/i,
      /град[:\s]+([^\n]+)/i,
      /ул\.[:\s]+([^\n]+)/i
    ];

    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match) {
        const address = match[1].trim();
        if (address.length > 5) { // Минимална валидация
          data.address = address;
          break;
        }
      }
    }

    // Търсим цена
    const pricePatterns = [
      /цена[:\s]+(\d+(?:\.\d+)?)\s*(?:лв\.|лева|EUR|евро)/i,
      /стойност[:\s]+(\d+(?:\.\d+)?)\s*(?:лв\.|лева|EUR|евро)/i
    ];

    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        const price = parseFloat(match[1]);
        if (price > 0) {
          data.price = price;
          break;
        }
      }
    }

    // Търсим брой стаи
    const roomPatterns = [
      /(\d+)\s*(?:стаен|стаи|стая)/i,
      /стаи[:\s]+(\d+)/i
    ];

    for (const pattern of roomPatterns) {
      const match = text.match(pattern);
      if (match) {
        const rooms = parseInt(match[1]);
        if (rooms > 0 && rooms < 20) {
          data.rooms = rooms;
          break;
        }
      }
    }

    // Търсим етаж
    const floorPattern = /(?:етаж|ет\.)[:\s]+(\d+)(?:\s*от\s*(\d+))?/i;
    const floorMatch = text.match(floorPattern);
    if (floorMatch) {
      const floor = parseInt(floorMatch[1]);
      if (floor >= 0 && floor < 100) {
        data.floor = floor;
        if (floorMatch[2]) {
          const totalFloors = parseInt(floorMatch[2]);
          if (totalFloors >= floor) {
            data.totalFloors = totalFloors;
          }
        }
      }
    }

    return data;
  }
}