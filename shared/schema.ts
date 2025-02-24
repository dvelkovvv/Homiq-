import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Основна таблица за имотите
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  // Основна информация
  type: text("type").notNull(), // apartment, house, villa, agricultural
  address: text("address").notNull(),
  squareMeters: integer("square_meters").notNull(),
  yearBuilt: timestamp("year_built").notNull(),

  // Локация
  location: jsonb("location").$type<{lat: number, lng: number} | null>().notNull(),

  // Характеристики на имота
  rooms: integer("rooms"),
  floor: integer("floor"),
  totalFloors: integer("total_floors"),
  heating: text("heating"), // gas, electric, central
  parking: boolean("parking").default(false),

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

  // Резултати от оценката
  estimatedValue: integer("estimated_value").notNull(),
  score: integer("score").notNull(), // 0-100 score

  // Детайлни оценки по категории
  locationScore: integer("location_score").notNull(),
  conditionScore: integer("condition_score").notNull(),
  marketScore: integer("market_score").notNull(),

  // Препоръки и коментари
  recommendations: text("recommendations").array().notNull().default([]),
  comments: text("comments"),

  // Метаданни
  createdAt: timestamp("created_at").defaultNow(),
});

// Валидационна схема за имот
export const insertPropertySchema = createInsertSchema(properties)
  .extend({
    type: z.enum(["apartment", "house", "villa", "agricultural"], {
      errorMap: () => ({ message: "Моля изберете валиден тип имот" })
    }),
    address: z.string().min(5, "Адресът трябва да бъде поне 5 символа"),
    squareMeters: z.number().min(1, "Площта трябва да бъде поне 1 кв.м"),
    yearBuilt: z.date({
      required_error: "Моля изберете дата",
      invalid_type_error: "Невалидна дата"
    }),
    location: z.object({
      lat: z.number(),
      lng: z.number()
    }).nullable(),
    rooms: z.number().min(1).optional(),
    floor: z.number().min(0).optional(),
    totalFloors: z.number().min(1).optional(),
    heating: z.enum(["gas", "electric", "central"]).optional(),
    parking: z.boolean().optional(),
    photos: z.array(z.string()).default([]),
    documents: z.array(z.string()).default([])
  })
  .omit({ 
    id: true,
    createdAt: true 
  });

// Валидационна схема за оценка
export const insertEvaluationSchema = createInsertSchema(evaluations)
  .extend({
    score: z.number().min(0).max(100),
    locationScore: z.number().min(0).max(100),
    conditionScore: z.number().min(0).max(100),
    marketScore: z.number().min(0).max(100),
    recommendations: z.array(z.string()),
    comments: z.string().optional()
  })
  .omit({
    id: true,
    createdAt: true
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