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
  yearBuilt: integer("year_built").notNull(),
  location: jsonb("location").$type<{lat: number, lng: number}>().notNull(),

  // Характеристики на имота
  rooms: integer("rooms").notNull(),
  floor: integer("floor").notNull(),
  totalFloors: integer("total_floors").notNull(),
  heating: text("heating").notNull(),
  parking: boolean("parking").notNull(),

  // Медия файлове
  photos: text("photos").array().notNull().default([]),
  documents: text("documents").array().notNull().default([]),

  createdAt: timestamp("created_at").defaultNow(),
});

// Валидационна схема за имот
export const insertPropertySchema = createInsertSchema(properties, {
  type: z.enum(["apartment", "house", "villa", "agricultural"]),
  address: z.string().min(3, "Адресът трябва да бъде поне 3 символа"),
  squareMeters: z.number().min(1, "Площта трябва да бъде поне 1 кв.м"),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear()),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  rooms: z.number().min(1),
  floor: z.number().min(0),
  totalFloors: z.number().min(1),
  heating: z.enum(["electric", "gas", "other"]),
  parking: z.boolean()
}).omit({ 
  id: true,
  createdAt: true,
  photos: true,
  documents: true
});

// Типове за TypeScript
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;