import * as tf from '@tensorflow/tfjs';

interface RoomAnalysisResult {
  roomType: string;
  confidence: number;
  features: string[];
}

export class RoomImageAnalyzer {
  static async analyzeImage(imageFile: File): Promise<RoomAnalysisResult> {
    try {
      // Зареждане на изображението
      const img = await window.createImageBitmap(imageFile);
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Преоразмеряване на изображението
      ctx.drawImage(img, 0, 0, 224, 224);

      // Конвертиране в тензор
      const imageData = ctx.getImageData(0, 0, 224, 224);
      const tensor = tf.browser.fromPixels(imageData)
        .expandDims(0)
        .div(255.0);

      // TODO: Тук ще добавим модела за класификация
      // Засега връщаме примерни данни
      const mockResult: RoomAnalysisResult = {
        roomType: "kitchen",
        confidence: 0.95,
        features: ["обзавеждане", "уреди", "осветление"]
      };

      // Почистване на паметта
      tensor.dispose();

      return mockResult;
    } catch (error) {
      console.error('Error analyzing room image:', error);
      throw error;
    }
  }

  static detectFeatures(result: RoomAnalysisResult): string[] {
    const featuresByRoom: Record<string, string[]> = {
      entrance: ["врата", "брава", "звънец", "антре"],
      kitchen: ["плот", "печка", "хладилник", "шкафове"],
      living: ["диван", "маса", "телевизор", "осветление"],
      bathroom: ["вана", "мивка", "тоалетна", "плочки"],
      bedroom: ["легло", "гардероб", "прозорец", "осветление"]
    };

    return featuresByRoom[result.roomType] || [];
  }
}