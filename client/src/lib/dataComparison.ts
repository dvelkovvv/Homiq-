import { toast } from "@/hooks/use-toast";

interface PropertyData {
  address?: string;
  squareMeters?: number;
  type?: string;
  rooms?: number;
  floor?: number;
  totalFloors?: number;
  constructionYear?: number;
  price?: number;
}

export class DataComparison {
  static extractDataFromDocument(text: string): PropertyData {
    const data: PropertyData = {};

    // Извличане на адрес
    const addressRegex = /(?:адрес|находящ се в|находящ се на)[:\s]+([^\n,.]+)/i;
    const addressMatch = text.match(addressRegex);
    if (addressMatch) {
      data.address = addressMatch[1].trim();
    }

    // Извличане на квадратура
    const areaRegex = /(\d+(?:[.,]\d+)?)\s*(?:кв\.м|кв\.метра|квадратни метра|м2)/i;
    const areaMatch = text.match(areaRegex);
    if (areaMatch) {
      data.squareMeters = parseFloat(areaMatch[1].replace(',', '.'));
    }

    // Извличане на брой стаи
    const roomsRegex = /(\d+)[-\s](?:стаен|стайно|стаи|стая)/i;
    const roomsMatch = text.match(roomsRegex);
    if (roomsMatch) {
      data.rooms = parseInt(roomsMatch[1]);
    }

    // Извличане на етаж
    const floorRegex = /(?:на\s)?(\d+)(?:[-.ия\s]+)?(?:етаж|ет)/i;
    const floorMatch = text.match(floorRegex);
    if (floorMatch) {
      data.floor = parseInt(floorMatch[1]);
    }

    // Извличане на общ брой етажи
    const totalFloorsRegex = /(?:в\s)?(\d+)[-\s]етажна|от\s(\d+)\sетажа/i;
    const totalFloorsMatch = text.match(totalFloorsRegex);
    if (totalFloorsMatch) {
      data.totalFloors = parseInt(totalFloorsMatch[1] || totalFloorsMatch[2]);
    }

    // Извличане на година на строителство
    const yearRegex = /(?:построен[а]?\s+(?:през)?\s*|строителство\s+от\s+)(\d{4})/i;
    const yearMatch = text.match(yearRegex);
    if (yearMatch) {
      data.constructionYear = parseInt(yearMatch[1]);
    }

    // Извличане на цена
    const priceRegex = /(?:цена|стойност|оценка)[:\s]+(?:лв\.|BGN|EUR|€)?\s*(\d+(?:[.,]\d+)?)/i;
    const priceMatch = text.match(priceRegex);
    if (priceMatch) {
      data.price = parseFloat(priceMatch[1].replace(',', '.'));
    }

    return data;
  }

  static autofillFormData(documentData: PropertyData): void {
    // Вземаме съществуващите данни от localStorage
    const existingData = JSON.parse(localStorage.getItem('propertyData') || '{}');

    // Сливаме новите данни със съществуващите
    const mergedData = {
      ...existingData,
      ...documentData
    };

    // Запазваме обратно в localStorage
    localStorage.setItem('propertyData', JSON.stringify(mergedData));

    // Показваме съобщение за успешно попълване
    toast({
      title: "Данните са извлечени успешно",
      description: "Формата е попълнена автоматично с данните от документа.",
      variant: "success",
    });
  }

  static compareAddresses(address1: string, address2: string): number {
    // Remove special characters and extra spaces
    const normalize = (addr: string) => {
      return addr
        .toLowerCase()
        .replace(/[^\wабвгдежзийклмнопрстуфхцчшщъьюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const addr1 = normalize(address1);
    const addr2 = normalize(address2);

    // Simple Levenshtein distance implementation
    const matrix = Array(addr1.length + 1).fill(null).map(() =>
      Array(addr2.length + 1).fill(null)
    );

    for (let i = 0; i <= addr1.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= addr2.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= addr1.length; i++) {
      for (let j = 1; j <= addr2.length; j++) {
        const cost = addr1[i - 1] === addr2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    // Calculate similarity percentage
    const maxLength = Math.max(addr1.length, addr2.length);
    const similarity = 1 - (matrix[addr1.length][addr2.length] / maxLength);
    return similarity;
  }

  static compareData(formData: PropertyData, documentData: PropertyData): void {
    const discrepancies: string[] = [];

    // Compare addresses if both exist
    if (formData.address && documentData.address) {
      const addressSimilarity = this.compareAddresses(formData.address, documentData.address);
      if (addressSimilarity < 0.8) {
        discrepancies.push(`Разлика в адресите:
          - Въведен: ${formData.address}
          - От документ: ${documentData.address}`);
      }
    }

    // Compare square meters
    if (formData.squareMeters && documentData.squareMeters) {
      const difference = Math.abs(formData.squareMeters - documentData.squareMeters);
      const percentDiff = (difference / formData.squareMeters) * 100;

      if (percentDiff > 5) { // More than 5% difference
        discrepancies.push(`Разлика в площта:
          - Въведена: ${formData.squareMeters}м²
          - От документ: ${documentData.squareMeters}м²`);
      }
    }

    // Compare other numeric values
    if (formData.rooms && documentData.rooms && formData.rooms !== documentData.rooms) {
      discrepancies.push(`Разлика в броя стаи: ${formData.rooms} vs ${documentData.rooms}`);
    }

    if (formData.floor && documentData.floor && formData.floor !== documentData.floor) {
      discrepancies.push(`Разлика в етажа: ${formData.floor} vs ${documentData.floor}`);
    }

    // Show discrepancies if any found
    if (discrepancies.length > 0) {
      toast({
        title: "Открити са несъответствия в данните",
        description: (
          <div className="space-y-2">
            <p className="font-medium">Моля, проверете следните разлики:</p>
            {discrepancies.map((disc, index) => (
              <p key={index} className="text-sm">{disc}</p>
            ))}
          </div>
        ),
        variant: "warning",
        duration: 10000,
      });
    }
  }

  static calculateBaseEvaluation(formData: PropertyData, documentData: PropertyData): number {
    // Use the most reliable square meters value
    const squareMeters = documentData.squareMeters || formData.squareMeters || 0;

    // Base price per square meter depending on property type
    const basePrices: Record<string, number> = {
      apartment: 1200,
      house: 1000,
      villa: 1100,
      agricultural: 50,
      industrial: 800,
    };

    const basePrice = basePrices[formData.type || 'apartment'] || 1000;
    let estimatedValue = squareMeters * basePrice;

    // Apply modifiers based on available data
    if (formData.floor) {
      // Higher floors typically have higher value
      const floorModifier = 1 + (formData.floor / (formData.totalFloors || 10)) * 0.1;
      estimatedValue *= floorModifier;
    }

    if (formData.rooms) {
      // More rooms typically mean better layout
      const roomModifier = 1 + (formData.rooms - 1) * 0.05;
      estimatedValue *= roomModifier;
    }

    return Math.round(estimatedValue);
  }
}