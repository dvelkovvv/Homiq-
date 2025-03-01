import { pgTable, text, serial, integer, jsonb, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Property table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  address: text("address").notNull(),
  area: integer("area").notNull(),
  location: jsonb("location").$type<{lat: number, lng: number}>().notNull(),
  metro_distance: decimal("metro_distance"),
  green_zones: integer("green_zones"),
  price_range: jsonb("price_range").$type<{min: number, max: number}>(),
  created_at: timestamp("created_at").defaultNow(),
});

// Property schema
export const insertPropertySchema = createInsertSchema(properties, {
  propertyId: z.string().min(1, "Идентификационният номер е задължителен"),
  address: z.string().min(3, "Адресът трябва да е поне 3 символа"),
  area: z.number().min(1, "Площта трябва да е поне 1 кв.м"),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  metro_distance: z.number().optional(),
  green_zones: z.number().optional(),
  price_range: z.object({
    min: z.number(),
    max: z.number()
  }).optional()
}).omit({
  id: true,
  created_at: true,
});

// Documents table for OCR processed files
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  type: text("type").notNull(), // notary_act, sketch, tax_assessment
  filename: text("filename").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadDate: timestamp("upload_date").defaultNow(),
  processedDate: timestamp("processed_date"),
  confidence: decimal("confidence"),
  rawText: text("raw_text"),
  status: text("status").notNull().default("pending"), // pending, processed, failed
  error: text("error"),
});

// Document extracted data
export const documentData = pgTable("document_data", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  squareMeters: decimal("square_meters"),
  constructionYear: integer("construction_year"),
  address: text("address"),
  documentType: text("document_type"),
  price: decimal("price"),
  rooms: integer("rooms"),
  floor: integer("floor"),
  totalFloors: integer("total_floors"),
  owner: text("owner"),
  identifier: text("identifier"),
  cadastralNumber: text("cadastral_number"),
  documentDate: text("document_date"),
  notaryNumber: text("notary_number"),
  taxAssessmentValue: decimal("tax_assessment_value"),
  boundaries: text("boundaries").array(),
  purpose: text("purpose"),
  builtUpArea: decimal("built_up_area"),
  totalArea: decimal("total_area"),
  commonParts: text("common_parts"),
  extractedAt: timestamp("extracted_at").defaultNow(),
});

// Evaluations table
export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  estimatedValue: integer("estimated_value").notNull(),
  confidence: decimal("confidence").notNull(),
  currency: text("currency").notNull().default("EUR"),
  evaluationType: text("evaluation_type").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  locationScore: decimal("location_score"),
  infrastructureScore: decimal("infrastructure_score"),
  marketScore: decimal("market_score"),
  buildingScore: decimal("building_score"),
  amenitiesNearby: jsonb("amenities_nearby").$type<{
    schools: number,
    transport: number,
    shopping: number,
    healthcare: number,
    recreation: number
  }>(),
  marketTrends: jsonb("market_trends").$type<{
    pricePerSqm: number,
    yearlyChange: number,
    demandLevel: number,
    supplyLevel: number,
    averageDaysOnMarket: number
  }>(),
  verifiedBy: text("verified_by"),
  verificationDate: timestamp("verification_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Document schemas
export const insertDocumentSchema = createInsertSchema(documents, {
  type: z.enum(["notary_act", "sketch", "tax_assessment"]),
  filename: z.string(),
  fileUrl: z.string().url(),
  confidence: z.number().min(0).max(1).optional(),
  rawText: z.string().optional(),
  status: z.enum(["pending", "processed", "failed"]).default("pending"),
}).omit({
  id: true,
  uploadDate: true,
  processedDate: true,
});

export const insertDocumentDataSchema = createInsertSchema(documentData, {
  squareMeters: z.number().positive().optional(),
  constructionYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  price: z.number().positive().optional(),
  rooms: z.number().positive().optional(),
  floor: z.number().positive().optional(),
  totalFloors: z.number().positive().optional(),
}).omit({
  id: true,
  extractedAt: true,
});


// Existing property and evaluation schemas

export const insertEvaluationSchema = createInsertSchema(evaluations, {
  estimatedValue: z.number().min(0),
  confidence: z.number().min(0).max(100),
  currency: z.string().default("EUR"),
  evaluationType: z.enum(["quick", "licensed"]),
  status: z.enum(["pending", "completed", "failed", "verified"]).default("pending"),
  notes: z.string().optional(),
  locationScore: z.number().min(0).max(10).optional(),
  infrastructureScore: z.number().min(0).max(10).optional(),
  marketScore: z.number().min(0).max(10).optional(),
  buildingScore: z.number().min(0).max(10).optional(),
}).omit({
  id: true,
  createdAt: true,
});

// Types for TypeScript
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type DocumentData = typeof documentData.$inferSelect;
export type InsertDocumentData = z.infer<typeof insertDocumentDataSchema>;