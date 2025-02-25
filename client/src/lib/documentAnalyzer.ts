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
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')  // Нормализиране на интервалите
      .replace(/[""„"]/g, '"') // Нормализиране на кавички
      .replace(/['']/g, "'")  // Нормализиране на апострофи
      .trim();
  }

  private static isValidDate(dateStr: string): boolean {
    const parts = dateStr.split(/[\/\.-]/);
    if (parts.length !== 3) return false;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;

    return true;
  }

  private static isValidPrice(price: number): boolean {
    return !isNaN(price) && price > 0 && price < 100000000; // Разумен диапазон за цени
  }

  private static isValidArea(area: number): boolean {
    return !isNaN(area) && area > 0 && area < 10000; // Разумен диапазон за площи
  }

  static async analyzeDocument(text: string): Promise<ExtractedData> {
    const data: ExtractedData = {};
    const cleanedText = this.cleanText(text);
    const lowerText = cleanedText.toLowerCase();

    // Определяме типа на документа с разширени шаблони
    if (lowerText.includes('нотариален акт') || 
        lowerText.includes('нотариус') || 
        lowerText.includes('нот. акт')) {
      data.documentType = 'notary_act';
    } else if (lowerText.includes('скица') || 
               lowerText.includes('кадастър') ||
               lowerText.includes('кадастрална карта')) {
      data.documentType = 'sketch';
    } else if (lowerText.includes('данъчна оценка') ||
               lowerText.includes('удостоверение за данъчна оценка')) {
      data.documentType = 'tax_assessment';
    }

    // Търсим собственик/ци с подобрени шаблони
    const ownerPatterns = [
      /(?:собственик|собственици|притежател|притежатели)(?:\(ци\))?:?\s*([^\n,\.;]+)/i,
      /купувач(?:\(и\))?:?\s*([^\n,\.;]+)/i,
      /имотът\s+(?:се\s+)?(?:притежава|придобива)\s+от\s+([^\n,\.;]+)/i
    ];

    for (const pattern of ownerPatterns) {
      const match = cleanedText.match(pattern);
      if (match) {
        const owner = match[1].trim();
        if (owner.length > 2 && !/^\d+$/.test(owner)) { // Проверка дали не е само цифри
          data.owner = owner;
          break;
        }
      }
    }

    // Търсим кадастрален номер и идентификатор с подобрени шаблони
    const identifierPatterns = [
      /(?:идентификатор|кад\.\s*№|кадастрален номер):?\s*([\d\.]+)/i,
      /поземлен имот (?:с )?(?:идентификатор )?(?:№|номер )?:?\s*([\d\.]+)/i,
      /пи с идентификатор:?\s*([\d\.]+)/i
    ];

    for (const pattern of identifierPatterns) {
      const match = cleanedText.match(pattern);
      if (match) {
        const identifier = match[1].trim();
        if (/^\d+(\.\d+)*$/.test(identifier)) { // Валидация на формата
          data.identifier = identifier;
          data.cadastralNumber = identifier;
          break;
        }
      }
    }

    // Търсим дата на документа с подобрена валидация
    const datePatterns = [
      /(?:дата|издаден(?:а|о)? на|от дата):?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i,
      /днес,?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i,
      /(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})\s*(?:г\.|година)?/i
    ];

    for (const pattern of datePatterns) {
      const match = cleanedText.match(pattern);
      if (match) {
        const dateStr = match[1].trim();
        if (this.isValidDate(dateStr)) {
          data.documentDate = dateStr;
          break;
        }
      }
    }

    // Данни за нотариален акт
    if (data.documentType === 'notary_act') {
      // Номер на акта с подобрена валидация
      const notaryPatterns = [
        /(?:акт|нотариален акт)\s*(?:№|номер):?\s*(\d+)/i,
        /№:?\s*(\d+)(?:\s*от|,)/i
      ];

      for (const pattern of notaryPatterns) {
        const match = cleanedText.match(pattern);
        if (match) {
          const number = parseInt(match[1]);
          if (!isNaN(number) && number > 0) {
            data.notaryNumber = match[1].trim();
            break;
          }
        }
      }

      // Том и страница с подобрена валидация
      const volumeMatch = cleanedText.match(/том:?\s*([IVXLCDM\d]+)/i);
      if (volumeMatch) {
        const volume = volumeMatch[1].trim().toUpperCase();
        if (/^[IVXLCDM\d]+$/.test(volume)) {
          data.actVolume = volume;
        }
      }

      const pageMatch = cleanedText.match(/(?:стр|страница|стр\.|на страница):?\s*(\d+)/i);
      if (pageMatch) {
        const page = parseInt(pageMatch[1]);
        if (!isNaN(page) && page > 0) {
          data.actPage = pageMatch[1].trim();
        }
      }

      // Нотариус с подобрена валидация
      const notaryMatch = cleanedText.match(/(?:нотариус|от нотариус):?\s*([^\n,\.;]+)/i);
      if (notaryMatch) {
        const notaryName = notaryMatch[1].trim();
        if (notaryName.length > 5 && !/^\d+$/.test(notaryName)) {
          data.notaryName = notaryName;
        }
      }

      // Вписване с подобрена валидация
      const registryMatch = cleanedText.match(/(?:вх\.\s*рег\.\s*№|вписване):?\s*([^\n,\.;]+)/i);
      if (registryMatch) {
        data.registryEntry = registryMatch[1].trim();
      }

      // Граници на имота с подобрена обработка
      const boundariesMatch = cleanedText.match(/(?:граничи|граници|при граници|при съседи):?\s*([^\n\.]+)/i);
      if (boundariesMatch) {
        data.boundaries = boundariesMatch[1]
          .split(/[,;]/)
          .map(b => b.trim())
          .filter(b => b.length > 0 && !/^\d+$/.test(b));
      }
    }

    // Данни за скица с подобрена валидация
    if (data.documentType === 'sketch') {
      // Предназначение
      const purposePatterns = [
        /(?:предназначение|начин на трайно ползване|нтп):?\s*([^\n,\.;]+)/i,
        /имотът\s+(?:се\s+)?използва\s+за\s+([^\n,\.;]+)/i
      ];

      for (const pattern of purposePatterns) {
        const match = cleanedText.match(pattern);
        if (match) {
          const purpose = match[1].trim();
          if (purpose.length > 3 && !/^\d+$/.test(purpose)) {
            data.purpose = purpose;
            break;
          }
        }
      }

      // Застроена площ с подобрена валидация
      const builtUpAreaPatterns = [
        /застроена площ:?\s*(\d+(?:[,.]\d+)?)/i,
        /площ на сградата:?\s*(\d+(?:[,.]\d+)?)/i
      ];

      for (const pattern of builtUpAreaPatterns) {
        const match = cleanedText.match(pattern);
        if (match) {
          const area = parseFloat(match[1].replace(',', '.'));
          if (this.isValidArea(area)) {
            data.builtUpArea = area;
            break;
          }
        }
      }

      // Общи части
      const commonPartsMatch = cleanedText.match(/(?:общи части|идеални части):?\s*([^\n,\.;]+)/i);
      if (commonPartsMatch) {
        data.commonParts = commonPartsMatch[1].trim();
      }
    }

    // Търсим квадратура с подобрена валидация
    const areaPatterns = [
      /(?:обща\s+)?площ:?\s*(\d+(?:[,.]\d+)?)\s*(?:кв\.м|кв\.метра|m2|квадратни метра|кв\. м\.)/i,
      /площ от\s*(\d+(?:[,.]\d+)?)/i,
      /имот с площ:?\s*(\d+(?:[,.]\d+)?)/i
    ];

    for (const pattern of areaPatterns) {
      const match = cleanedText.match(pattern);
      if (match) {
        const area = parseFloat(match[1].replace(',', '.'));
        if (this.isValidArea(area)) {
          data.squareMeters = area;
          break;
        }
      }
    }

    // Търсим цена с подобрена валидация
    const pricePatterns = [
      /(?:цена|стойност|продажна цена):?\s*(\d+(?:[,.]\d+)?)\s*(?:лв\.|лева|EUR|евро)/i,
      /имотът\s+(?:се\s+)?(?:продава|оценява)\s+за\s*(\d+(?:[,.]\d+)?)\s*(?:лв\.|лева|EUR|евро)/i
    ];

    for (const pattern of pricePatterns) {
      const match = cleanedText.match(pattern);
      if (match) {
        const price = parseFloat(match[1].replace(',', '.'));
        if (this.isValidPrice(price)) {
          data.price = price;
          break;
        }
      }
    }

    return data;
  }
}