import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Основна таблица за имотите
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  // Основна информация
  type: text("type").notNull(),
  address: text("address").notNull(),
  squareMeters: integer("square_meters").notNull(),
  yearBuilt: timestamp("year_built").notNull(),
  location: jsonb("location").$type<{lat: number, lng: number} | null>().notNull(),

  // Характеристики на имота
  rooms: integer("rooms").notNull().default(1),
  floor: integer("floor").notNull().default(0),
  totalFloors: integer("total_floors").notNull().default(1),
  heating: text("heating").notNull().default("electric"),
  parking: boolean("parking").notNull().default(false),

  // Медия файлове
  photos: text("photos").array().notNull().default([]),
  documents: text("documents").array().notNull().default([]),

  // Метаданни
  createdAt: timestamp("created_at").defaultNow(),
});

// Таблица за оценките
export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  estimatedValue: integer("estimated_value").notNull(),
  score: integer("score").notNull(),
  locationScore: integer("location_score").notNull(),
  conditionScore: integer("condition_score").notNull(),
  marketScore: integer("market_score").notNull(),
  recommendations: text("recommendations").array().notNull().default([]),
  comments: text("comments").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

// Валидационна схема за имот
export const insertPropertySchema = createInsertSchema(properties, {
  type: z.enum(["apartment", "house", "villa", "agricultural"]),
  address: z.string().min(5, "Адресът трябва да бъде поне 5 символа"),
  squareMeters: z.number().min(1, "Площта трябва да бъде поне 1 кв.м"),
  yearBuilt: z.date({
    required_error: "Моля изберете дата",
    invalid_type_error: "Невалидна дата",
  }),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }).nullable(),
}).omit({ 
  id: true,
  createdAt: true,
});

// Валидационна схема за оценка
export const insertEvaluationSchema = createInsertSchema(evaluations, {
  score: z.number().min(0).max(100),
  locationScore: z.number().min(0).max(100),
  conditionScore: z.number().min(0).max(100),
  marketScore: z.number().min(0).max(100),
}).omit({
  id: true,
  createdAt: true,
});

// Типове за TypeScript
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  icon: text("icon").notNull(),
});