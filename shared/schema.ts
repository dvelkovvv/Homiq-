import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  location: jsonb("location").$type<{lat: number, lng: number}>(),
  squareMeters: integer("square_meters").notNull(),
  yearBuilt: integer("year_built"),
  type: text("type").notNull(), // apartment, house, etc
  photos: text("photos").array(),
  documents: text("documents").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  estimatedValue: integer("estimated_value").notNull(),
  score: integer("score").notNull(), // 0-100 score
  recommendations: text("recommendations").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  icon: text("icon").notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  achievementId: integer("achievement_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({ 
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
