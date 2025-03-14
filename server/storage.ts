import { type Property, type InsertProperty } from "@shared/schema";
import { properties } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createProperty(property: InsertProperty): Promise<Property>;
  getProperty(id: number): Promise<Property | undefined>;
  getProperties(): Promise<Property[]>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property>;
}

export class DatabaseStorage implements IStorage {
  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id));
    return property;
  }

  async getProperties(): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .orderBy(properties.created_at);
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set(property)
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }
}

export const storage = new DatabaseStorage();