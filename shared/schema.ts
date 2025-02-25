import { pgTable, text, serial, integer, jsonb, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  // Basic information
  type: text("type").notNull(),
  address: text("address").notNull(),
  squareMeters: integer("square_meters").notNull(),
  yearBuilt: integer("year_built").notNull(),
  location: jsonb("location").$type<{lat: number, lng: number}>().notNull(),

  // Property characteristics
  rooms: integer("rooms"),
  floor: integer("floor"),
  totalFloors: integer("total_floors"),
  heating: text("heating"),
  parking: boolean("parking"),

  // Industrial characteristics
  productionArea: integer("production_area"),
  storageArea: integer("storage_area"),
  loadingDock: boolean("loading_dock"),
  ceilingHeight: numeric("ceiling_height"),
  threePhasePower: boolean("three_phase_power"),

  // Media files
  photos: text("photos").array().notNull().default([]),
  documents: text("documents").array().notNull().default([]),
  roomPhotos: jsonb("room_photos").$type<Array<{
    roomNumber: number;
    description: string;
    photos: string[];
  }>>().notNull().default([]),

  createdAt: timestamp("created_at").defaultNow(),
});

// Evaluations table
export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  value: numeric("value").notNull(),
  currency: text("currency").notNull().default("EUR"),
  evaluationDate: timestamp("evaluation_date").notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  icon: text("icon").notNull(),
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
  }),
  rooms: z.number().min(1).optional(),
  floor: z.number().min(0).optional(),
  totalFloors: z.number().min(1).optional(),
  heating: z.enum(["electric", "gas", "other"]).optional(),
  parking: z.boolean().optional(),

  productionArea: z.number().min(0).optional(),
  storageArea: z.number().min(0).optional(),
  loadingDock: z.boolean().optional(),
  ceilingHeight: z.number().min(0).optional(),
  threePhasePower: z.boolean().optional(),
  roomPhotos: z.array(z.object({
    roomNumber: z.number(),
    description: z.string(),
    photos: z.array(z.string())
  })).optional()
}).omit({
  id: true,
  createdAt: true,
  photos: true,
  documents: true
});

export const insertEvaluationSchema = createInsertSchema(evaluations, {
  value: z.number().min(0),
  currency: z.string().default("EUR"),
  notes: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  evaluationDate: true
});

// Types for TypeScript
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Achievement = typeof achievements.$inferSelect;