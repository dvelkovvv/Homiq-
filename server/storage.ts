import { type Property, type InsertProperty, type Evaluation, type InsertEvaluation, type Achievement } from "@shared/schema";
import { properties, evaluations, achievements } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createProperty(property: InsertProperty): Promise<Property>;
  getProperty(id: number): Promise<Property | undefined>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  getEvaluation(id: number): Promise<Evaluation | undefined>;
  getEvaluationHistory(): Promise<(Evaluation & { property: Property })[]>;
  getAchievements(): Promise<Achievement[]>;
}

export class DatabaseStorage implements IStorage {
  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db.insert(properties).values([insertProperty]).returning();
    return property;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createEvaluation(insertEvaluation: InsertEvaluation): Promise<Evaluation> {
    const [evaluation] = await db.insert(evaluations).values([insertEvaluation]).returning();
    return evaluation;
  }

  async getEvaluation(id: number): Promise<Evaluation | undefined> {
    const [evaluation] = await db.select().from(evaluations).where(eq(evaluations.id, id));
    return evaluation;
  }

  async getEvaluationHistory(): Promise<(Evaluation & { property: Property })[]> {
    const result = await db
      .select({
        evaluation: evaluations,
        property: properties,
      })
      .from(evaluations)
      .innerJoin(properties, eq(evaluations.propertyId, properties.id))
      .orderBy(evaluations.createdAt);

    return result.map(({ evaluation, property }) => ({
      ...evaluation,
      property,
    }));
  }

  async getAchievements(): Promise<Achievement[]> {
    return db.select().from(achievements);
  }
}

export const storage = new DatabaseStorage();