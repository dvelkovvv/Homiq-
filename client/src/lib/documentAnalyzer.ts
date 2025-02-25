interface ExtractedData {
  squareMeters?: number;
  constructionYear?: number;
  address?: string;
  documentType?: string;
  price?: number;
  rooms?: number;
  floor?: number;
  totalFloors?: number;
  owner?: string;
  identifier?: string;
  cadastralNumber?: string;
  documentDate?: string;
  notaryNumber?: string;
  taxAssessmentValue?: number;
  boundaries?: string[];
  purpose?: string;
  builtUpArea?: number;
  totalArea?: number;
  commonParts?: string;
  notaryName?: string;
  actVolume?: string;
  actPage?: string;
  registryEntry?: string;
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

    // Търсим собственик/ци
    const ownerPatterns = [
      /собственик(?:\(ци\))?:?\s*([^\n,\.]+)/i,
      /притежател(?:\(и\))?:?\s*([^\n,\.]+)/i,
      /лице:?\s*([^\n,\.]+)/i,
      /купувач(?:\(и\))?:?\s*([^\n,\.]+)/i
    ];

    for (const pattern of ownerPatterns) {
      const match = text.match(pattern);
      if (match) {
        const owner = match[1].trim();
        if (owner.length > 2) {
          data.owner = owner;
          break;
        }
      }
    }

    // Търсим кадастрален номер и идентификатор
    const identifierPatterns = [
      /(?:идентификатор|кад\. *№):?\s*([\d\.]+)/i,
      /кадастрален номер:?\s*([\d\.]+)/i,
      /номер на имота:?\s*([\d\.]+)/i,
      /поземлен имот с идентификатор:?\s*([\d\.]+)/i
    ];

    for (const pattern of identifierPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.identifier = match[1].trim();
        data.cadastralNumber = match[1].trim();
        break;
      }
    }

    // Търсим дата на документа
    const datePatterns = [
      /дата:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i,
      /издаден(?:а|о)? на:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i,
      /днес,?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.documentDate = match[1].trim();
        break;
      }
    }

    // Търсим данни за нотариален акт
    if (data.documentType === 'notary_act') {
      // Номер на акта
      const notaryPatterns = [
        /акт №:?\s*(\d+)/i,
        /нотариален акт:?\s*(?:№|номер):?\s*(\d+)/i
      ];

      for (const pattern of notaryPatterns) {
        const match = text.match(pattern);
        if (match) {
          data.notaryNumber = match[1].trim();
          break;
        }
      }

      // Том и страница
      const volumeMatch = text.match(/том:?\s*(\w+)/i);
      if (volumeMatch) data.actVolume = volumeMatch[1].trim();

      const pageMatch = text.match(/стр(?:аница)?:?\s*(\d+)/i);
      if (pageMatch) data.actPage = pageMatch[1].trim();

      // Нотариус
      const notaryMatch = text.match(/нотариус:?\s*([^\n,\.]+)/i);
      if (notaryMatch) data.notaryName = notaryMatch[1].trim();

      // Вписване
      const registryMatch = text.match(/вх\. рег\. №:?\s*([^\n,\.]+)/i);
      if (registryMatch) data.registryEntry = registryMatch[1].trim();

      // Граници на имота
      const boundariesMatch = text.match(/граници:?\s*([^\n]+)/i);
      if (boundariesMatch) {
        data.boundaries = boundariesMatch[1]
          .split(/[,;]/)
          .map(b => b.trim())
          .filter(b => b.length > 0);
      }
    }

    // Данни за скица
    if (data.documentType === 'sketch') {
      // Предназначение
      const purposeMatch = text.match(/(?:предназначение|начин на трайно ползване):?\s*([^\n,\.]+)/i);
      if (purposeMatch) data.purpose = purposeMatch[1].trim();

      // Застроена площ
      const builtUpAreaMatch = text.match(/застроена площ:?\s*(\d+(?:\.\d+)?)/i);
      if (builtUpAreaMatch) data.builtUpArea = parseFloat(builtUpAreaMatch[1]);

      // Общи части
      const commonPartsMatch = text.match(/общи части:?\s*([^\n,\.]+)/i);
      if (commonPartsMatch) data.commonParts = commonPartsMatch[1].trim();
    }

    // Търсим квадратура (различни формати)
    const areaPatterns = [
      /(?:обща\s+)?площ:?\s*(\d+(?:\.\d+)?)\s*(?:кв\.м|кв\.метра|m2|квадратни метра|кв\. м\.)/i,
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
      /(?:адрес|находящ[а-я]* се|разположен[а-я]*)[:\s]+([^\n]+)/i,
      /град[:\s]+([^\n]+)/i,
      /(?:ул|бул|ж\.к)\.[:\s]+([^\n]+)/i
    ];

    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match) {
        const address = match[1].trim();
        if (address.length > 5) {
          data.address = address;
          break;
        }
      }
    }

    // Търсим цена
    const pricePatterns = [
      /(?:цена|стойност|продажна цена)[:\s]+(\d+(?:\.\d+)?)\s*(?:лв\.|лева|EUR|евро)/i,
      /имота се оценява на[:\s]+(\d+(?:\.\d+)?)\s*(?:лв\.|лева|EUR|евро)/i
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

    return data;
  }
}