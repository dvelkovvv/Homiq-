import * as tf from '@tensorflow/tfjs';

interface RoomAnalysisResult {
  roomType: string;
  confidence: number;
  features: string[];
  detectedObjects: string[];
}

const CONFIDENCE_THRESHOLD = 0.75; // Минимална увереност за приемане на резултата

export class RoomImageAnalyzer {
  private static model: tf.LayersModel | null = null;
  private static isModelLoading = false;

  static async loadModel() {
    if (this.model || this.isModelLoading) return;

    try {
      this.isModelLoading = true;
      // Зареждаме предварително обучен MobileNet модел
      this.model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
      console.log('Моделът е зареден успешно');
    } catch (error) {
      console.error('Грешка при зареждане на модела:', error);
      throw error;
    } finally {
      this.isModelLoading = false;
    }
  }

  static async analyzeImage(imageFile: File): Promise<RoomAnalysisResult> {
    try {
      await this.loadModel();
      if (!this.model) throw new Error('Моделът не е зареден');

      // Зареждане и обработка на изображението
      const img = await window.createImageBitmap(imageFile);
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Преоразмеряване и нормализация на изображението
      ctx.drawImage(img, 0, 0, 224, 224);
      const imageData = ctx.getImageData(0, 0, 224, 224);
      const tensor = tf.browser.fromPixels(imageData)
        .expandDims(0)
        .toFloat()
        .div(255.0);

      // Анализ на изображението
      const predictions = await this.model.predict(tensor) as tf.Tensor;
      const detectedObjects = await this.processImagePredictions(predictions);

      // Определяне на типа помещение базирано на откритите обекти
      const roomTypeAnalysis = this.determineRoomType(detectedObjects);

      // Почистване на паметта
      tensor.dispose();
      predictions.dispose();

      return {
        roomType: roomTypeAnalysis.roomType,
        confidence: roomTypeAnalysis.confidence,
        features: this.detectFeatures(roomTypeAnalysis),
        detectedObjects
      };
    } catch (error) {
      console.error('Error analyzing room image:', error);
      throw error;
    }
  }

  private static async processImagePredictions(predictions: tf.Tensor): Promise<string[]> {
    const classes = await predictions.data();
    const indices = Array.from(classes)
      .map((prob, i) => ({ probability: prob, index: i }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);

    return indices.map(idx => this.getObjectClass(idx.index));
  }

  private static determineRoomType(detectedObjects: string[]): { roomType: string; confidence: number } {
    const roomScores = {
      entrance: 0,
      kitchen: 0,
      living: 0,
      bathroom: 0,
      bedroom: 0
    };

    // Точкова система за всеки тип стая базирана на откритите обекти
    for (const object of detectedObjects) {
      if (this.entranceObjects.includes(object)) roomScores.entrance += 1;
      if (this.kitchenObjects.includes(object)) roomScores.kitchen += 1;
      if (this.livingObjects.includes(object)) roomScores.living += 1;
      if (this.bathroomObjects.includes(object)) roomScores.bathroom += 1;
      if (this.bedroomObjects.includes(object)) roomScores.bedroom += 1;
    }

    // Намиране на стаята с най-висок резултат
    let maxScore = 0;
    let bestMatch = 'entrance';

    Object.entries(roomScores).forEach(([room, score]) => {
      if (score > maxScore) {
        maxScore = score;
        bestMatch = room;
      }
    });

    // Изчисляване на увереност
    const confidence = maxScore / detectedObjects.length;

    // Връщаме резултат само ако сме достатъчно уверени
    return {
      roomType: confidence >= CONFIDENCE_THRESHOLD ? bestMatch : 'unknown',
      confidence: confidence
    };
  }

  // Списъци с обекти характерни за всеки тип стая
  private static entranceObjects = [
    'door', 'doorway', 'entrance', 'hallway', 'coat_rack', 'shoe_rack'
  ];

  private static kitchenObjects = [
    'stove', 'oven', 'refrigerator', 'sink', 'cabinet', 'counter', 'microwave'
  ];

  private static livingObjects = [
    'sofa', 'couch', 'tv', 'television', 'coffee_table', 'bookshelf', 'armchair'
  ];

  private static bathroomObjects = [
    'toilet', 'sink', 'bath', 'shower', 'mirror', 'towel_rack', 'tile'
  ];

  private static bedroomObjects = [
    'bed', 'wardrobe', 'dresser', 'nightstand', 'lamp', 'pillow', 'curtain'
  ];

  private static getObjectClass(index: number): string {
    // Тук ще добавим mapping към класовете от MobileNet
    const classes = [
      'door', 'window', 'chair', 'table', 'bed', 'sofa',
      'toilet', 'sink', 'bathtub', 'shower', 'refrigerator',
      'oven', 'microwave', 'counter', 'cabinet', 'lamp',
      'television', 'curtain', 'pillow', 'mirror'
    ];
    return classes[index] || 'unknown';
  }

  static detectFeatures(result: { roomType: string; confidence: number }): string[] {
    const featuresByRoom: Record<string, string[]> = {
      entrance: ["входна врата", "антре", "закачалка", "шкаф за обувки"],
      kitchen: ["кухненски плот", "печка", "хладилник", "шкафове", "мивка"],
      living: ["диван", "телевизор", "масичка", "библиотека", "осветление"],
      bathroom: ["вана/душ", "тоалетна", "мивка", "плочки", "огледало"],
      bedroom: ["легло", "гардероб", "нощно шкафче", "прозорец", "осветление"]
    };

    return featuresByRoom[result.roomType] || [];
  }
}