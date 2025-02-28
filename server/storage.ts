import { type Property, type InsertProperty, type Evaluation, type InsertEvaluation, type Document, type InsertDocument, type DocumentData, type InsertDocumentData } from "@shared/schema";
import { properties, evaluations, documents, documentData } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createProperty(property: InsertProperty): Promise<Property>;
  getProperty(id: number): Promise<Property | undefined>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  getEvaluation(id: number): Promise<Evaluation | undefined>;
  getPropertyEvaluation(propertyId: number): Promise<Evaluation | undefined>;
  getEvaluationHistory(): Promise<(Evaluation & { property: Property })[]>;
  // New document methods
  createDocumentWithData(document: InsertDocument, extractedData: InsertDocumentData): Promise<Document>;
  getPropertyDocuments(propertyId: number): Promise<(Document & { data: DocumentData | null })[]>;
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
    const [evaluation] = await db.insert(evaluations).values([{
      ...insertEvaluation,
      confidence: String(insertEvaluation.confidence) // Convert to string for database
    }]).returning();
    return evaluation;
  }

  async getEvaluation(id: number): Promise<Evaluation | undefined> {
    const [evaluation] = await db.select().from(evaluations).where(eq(evaluations.id, id));
    return evaluation;
  }

  async getPropertyEvaluation(propertyId: number): Promise<Evaluation | undefined> {
    const [evaluation] = await db
      .select()
      .from(evaluations)
      .where(eq(evaluations.propertyId, propertyId))
      .orderBy(evaluations.createdAt)
      .limit(1);
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

  // New document methods implementation
  async createDocumentWithData(insertDoc: InsertDocument, extractedData: InsertDocumentData): Promise<Document> {
    return await db.transaction(async (tx) => {
      // Insert document first
      const [document] = await tx
        .insert(documents)
        .values([{
          ...insertDoc,
          processedDate: new Date(),
          status: 'processed'
        }])
        .returning();

      // Insert extracted data with the new document ID
      if (extractedData) {
        await tx
          .insert(documentData)
          .values([{
            ...extractedData,
            documentId: document.id
          }]);
      }

      return document;
    });
  }

  async getPropertyDocuments(propertyId: number): Promise<(Document & { data: DocumentData | null })[]> {
    const results = await db
      .select({
        document: documents,
        data: documentData
      })
      .from(documents)
      .leftJoin(documentData, eq(documents.id, documentData.documentId))
      .where(eq(documents.propertyId, propertyId));

    return results.map(({ document, data }) => ({
      ...document,
      data: data || null
    }));
  }
}

export const storage = new DatabaseStorage();