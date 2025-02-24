import { type Property, type InsertProperty, type Evaluation, type InsertEvaluation, type Achievement } from "@shared/schema";

export interface IStorage {
  createProperty(property: InsertProperty): Promise<Property>;
  getProperty(id: number): Promise<Property | undefined>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  getEvaluation(id: number): Promise<Evaluation | undefined>;
  getEvaluationHistory(): Promise<(Evaluation & { property: Property })[]>;
  getAchievements(): Promise<Achievement[]>;
}

export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private evaluations: Map<number, Evaluation>;
  private achievements: Map<number, Achievement>;
  private propertyId: number;
  private evaluationId: number;

  constructor() {
    this.properties = new Map();
    this.evaluations = new Map();
    this.achievements = new Map();
    this.propertyId = 1;
    this.evaluationId = 1;

    // Seed achievements
    this.achievements.set(1, {
      id: 1,
      name: "First Evaluation",
      description: "Complete your first property evaluation",
      points: 100,
      icon: "🏆"
    });
    this.achievements.set(2, {
      id: 2, 
      name: "Document Master",
      description: "Upload all required documents",
      points: 200,
      icon: "📄"
    });
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyId++;
    const property: Property = {
      ...insertProperty,
      id,
      createdAt: new Date()
    };
    this.properties.set(id, property);
    return property;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createEvaluation(insertEvaluation: InsertEvaluation): Promise<Evaluation> {
    const id = this.evaluationId++;
    const evaluation: Evaluation = {
      ...insertEvaluation,
      id,
      createdAt: new Date()
    };
    this.evaluations.set(id, evaluation);
    return evaluation;
  }

  async getEvaluation(id: number): Promise<Evaluation | undefined> {
    return this.evaluations.get(id);
  }

  async getEvaluationHistory(): Promise<(Evaluation & { property: Property })[]> {
    const history: (Evaluation & { property: Property })[] = [];

    for (const evaluation of this.evaluations.values()) {
      const property = await this.getProperty(evaluation.propertyId);
      if (property) {
        history.push({
          ...evaluation,
          property
        });
      }
    }

    return history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }
}

export const storage = new MemStorage();