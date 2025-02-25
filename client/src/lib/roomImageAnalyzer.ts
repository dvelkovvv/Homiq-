import * as tf from '@tensorflow/tfjs';

interface RoomAnalysisResult {
  roomType: string;
  confidence: number;
  features: string[];
  detectedObjects: string[];
}

const CONFIDENCE_THRESHOLD = 0.75;

export class RoomImageAnalyzer {
  private static model: tf.LayersModel | null = null;
  private static isModelLoading = false;

  static async loadModel() {
    if (this.model || this.isModelLoading) return;

    try {
      this.isModelLoading = true;
      // Използваме по-точен модел - EfficientNet
      this.model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/efficientnet_v2_imagenet21k_s_classification_5_20220421/model.json');
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

      const img = await window.createImageBitmap(imageFile);
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(img, 0, 0, 224, 224);
      const imageData = ctx.getImageData(0, 0, 224, 224);
      const tensor = tf.browser.fromPixels(imageData)
        .expandDims(0)
        .toFloat()
        .div(255.0);

      const predictions = await this.model!.predict(tensor) as tf.Tensor;
      const detectedObjects = await this.processImagePredictions(predictions);
      const roomTypeAnalysis = this.determineRoomType(detectedObjects);

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

    // Подобрена точкова система за всеки тип стая
    for (const object of detectedObjects) {
      // Даваме повече точки за ключови обекти
      const weight = this.getObjectWeight(object);

      if (this.entranceObjects.includes(object)) roomScores.entrance += weight;
      if (this.kitchenObjects.includes(object)) roomScores.kitchen += weight;
      if (this.livingObjects.includes(object)) roomScores.living += weight;
      if (this.bathroomObjects.includes(object)) roomScores.bathroom += weight;
      if (this.bedroomObjects.includes(object)) roomScores.bedroom += weight;
    }

    let maxScore = 0;
    let bestMatch = 'unknown';

    Object.entries(roomScores).forEach(([room, score]) => {
      if (score > maxScore) {
        maxScore = score;
        bestMatch = room;
      }
    });

    // Изчисляване на увереност с нормализация
    const totalPossibleScore = detectedObjects.length * 2; // Максимален възможен резултат
    const confidence = maxScore / totalPossibleScore;

    return {
      roomType: confidence >= CONFIDENCE_THRESHOLD ? bestMatch : 'unknown',
      confidence: confidence
    };
  }

  // Определяме тежест на различните обекти
  private static getObjectWeight(object: string): number {
    const highImportanceObjects = [
      'door', 'bed', 'toilet', 'stove', 'sofa',
      'shower', 'sink', 'wardrobe', 'refrigerator'
    ];

    const mediumImportanceObjects = [
      'window', 'cabinet', 'table', 'chair', 'mirror',
      'curtain', 'lamp', 'shelf'
    ];

    if (highImportanceObjects.includes(object)) return 2;
    if (mediumImportanceObjects.includes(object)) return 1.5;
    return 1;
  }

  private static entranceObjects = [
    'door', 'doorway', 'entrance', 'hallway', 'coat_rack', 'shoe_rack',
    'doorbell', 'security_camera', 'welcome_mat', 'umbrella_stand'
  ];

  private static kitchenObjects = [
    'stove', 'oven', 'refrigerator', 'sink', 'cabinet', 'counter', 'microwave',
    'dishwasher', 'kitchen_hood', 'cooking_utensils', 'pots_and_pans'
  ];

  private static livingObjects = [
    'sofa', 'couch', 'tv', 'television', 'coffee_table', 'bookshelf', 'armchair',
    'carpet', 'curtains', 'paintings', 'decorative_plants', 'entertainment_center'
  ];

  private static bathroomObjects = [
    'toilet', 'sink', 'bath', 'shower', 'mirror', 'towel_rack', 'tile',
    'bathroom_cabinet', 'toilet_paper_holder', 'shower_curtain', 'bathtub'
  ];

  private static bedroomObjects = [
    'bed', 'wardrobe', 'dresser', 'nightstand', 'lamp', 'pillow', 'curtain',
    'closet', 'bedside_table', 'alarm_clock', 'clothes_hangers'
  ];

  private static getObjectClass(index: number): string {
    const classes = [
      'door', 'window', 'chair', 'table', 'bed', 'sofa',
      'toilet', 'sink', 'bathtub', 'shower', 'refrigerator',
      'oven', 'microwave', 'counter', 'cabinet', 'lamp',
      'television', 'curtain', 'pillow', 'mirror',
      'wardrobe', 'bookshelf', 'plant', 'carpet', 'painting'
    ];
    return classes[index] || 'unknown';
  }

  static detectFeatures(result: { roomType: string; confidence: number }): string[] {
    const featuresByRoom: Record<string, string[]> = {
      entrance: ["входна врата", "антре", "закачалка", "шкаф за обувки", "звънец"],
      kitchen: ["кухненски плот", "печка", "хладилник", "шкафове", "мивка", "аспиратор"],
      living: ["диван", "телевизор", "масичка", "библиотека", "осветление", "декорации"],
      bathroom: ["вана/душ", "тоалетна", "мивка", "плочки", "огледало", "шкаф"],
      bedroom: ["легло", "гардероб", "нощно шкафче", "прозорец", "осветление", "завеси"]
    };

    return featuresByRoom[result.roomType] || [];
  }
}