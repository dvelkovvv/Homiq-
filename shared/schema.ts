import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  address: text("address").notNull(),
  squareMeters: integer("square_meters").notNull(),
  yearBuilt: integer("year_built").notNull(),
  location: jsonb("location").$type<{lat: number, lng: number}>().notNull(),
  rooms: integer("rooms"),
  floor: integer("floor"),
  totalFloors: integer("total_floors"),
  heating: text("heating"),
  parking: boolean("parking"),
  photos: text("photos").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Evaluations table
export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  estimatedValue: integer("estimated_value").notNull(),
  confidence: integer("confidence").notNull(),
  currency: text("currency").notNull().default("EUR"),
  evaluationType: text("evaluation_type").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Validation schemas
export const insertPropertySchema = createInsertSchema(properties, {
  type: z.enum(["apartment", "house", "villa", "agricultural", "industrial"]),
  address: z.string().min(3, "Address must be at least 3 characters"),
  squareMeters: z.number().min(1, "Area must be at least 1 sq.m"),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear()),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  })
}).omit({
  id: true,
  createdAt: true,
  photos: true,
});

export const insertEvaluationSchema = createInsertSchema(evaluations, {
  estimatedValue: z.number().min(0),
  confidence: z.number().min(0).max(100),
  currency: z.string().default("EUR"),
  evaluationType: z.enum(["quick", "licensed"]),
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
  notes: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
});

// Types for TypeScript
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;