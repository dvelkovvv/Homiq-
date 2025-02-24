import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  location: jsonb("location").$type<{lat: number, lng: number} | null>().notNull(),
  squareMeters: integer("square_meters").notNull(),
  yearBuilt: timestamp("year_built").notNull(),
  type: text("type").notNull(), // apartment, house, etc
  photos: text("photos").array().notNull().default([]),
  documents: text("documents").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  estimatedValue: integer("estimated_value").notNull(),
  score: integer("score").notNull(), // 0-100 score
  recommendations: text("recommendations").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  icon: text("icon").notNull(),
});

export const insertPropertySchema = createInsertSchema(properties)
  .extend({
    squareMeters: z.number().min(1, "Площта трябва да бъде поне 1 кв.м"),
    yearBuilt: z.date({
      required_error: "Моля изберете дата",
      invalid_type_error: "Невалидна дата"
    }),
    address: z.string().min(5, "Адресът трябва да бъде поне 5 символа"),
    type: z.enum(["apartment", "house", "villa", "agricultural"], {
      errorMap: () => ({ message: "Моля изберете валиден тип имот" })
    }),
    location: z.object({
      lat: z.number(),
      lng: z.number()
    }).nullable(),
    photos: z.array(z.string()).default([]),
    documents: z.array(z.string()).default([])
  })
  .omit({ 
    id: true,
    createdAt: true 
  });

export const insertEvaluationSchema = createInsertSchema(evaluations).omit({
  id: true,
  createdAt: true
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Achievement = typeof achievements.$inferSelect;