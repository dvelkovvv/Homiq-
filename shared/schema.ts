import { pgTable, text, serial, integer, jsonb, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
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
  rooms: integer("rooms"),
  floor: integer("floor"),
  totalFloors: integer("total_floors"),
  heating: text("heating"),
  parking: boolean("parking"),

  // Индустриални характеристики
  productionArea: integer("production_area"),
  storageArea: integer("storage_area"),
  loadingDock: boolean("loading_dock"),
  ceilingHeight: numeric("ceiling_height"),
  threePhasePower: boolean("three_phase_power"),

  // Медия файлове
  photos: text("photos").array().notNull().default([]),
  documents: text("documents").array().notNull().default([]),

  createdAt: timestamp("created_at").defaultNow(),
});

// Валидационна схема за имот
export const insertPropertySchema = createInsertSchema(properties, {
  type: z.enum(["apartment", "house", "villa", "agricultural", "industrial"]),
  address: z.string().min(3, "Адресът трябва да бъде поне 3 символа"),
  squareMeters: z.number().min(1, "Площта трябва да бъде поне 1 кв.м"),
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

  // Индустриални характеристики
  productionArea: z.number().min(0).optional(),
  storageArea: z.number().min(0).optional(),
  loadingDock: z.boolean().optional(),
  ceilingHeight: z.number().min(0).optional(),
  threePhasePower: z.boolean().optional(),
}).omit({ 
  id: true,
  createdAt: true,
  photos: true,
  documents: true
});

// Типове за TypeScript
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;