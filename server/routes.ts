import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertEvaluationSchema, insertDocumentSchema } from "@shared/schema";
import { log } from "./vite";

export async function registerRoutes(app: Express) {
  // API Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Wrap async route handlers to catch errors
  const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

  // Create property
  app.post("/api/properties", asyncHandler(async (req: Request, res: Response) => {
    const result = insertPropertySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: {
          message: "Невалидни данни",
          details: result.error.issues
        }
      });
    }

    const property = await storage.createProperty(result.data);
    log(`Created property with ID: ${property.id}`);
    res.status(201).json(property);
  }));

  // Get property by ID
  app.get("/api/properties/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: { message: "Invalid property ID" }
      });
    }

    const property = await storage.getProperty(id);
    if (!property) {
      return res.status(404).json({ 
        error: { message: "Property not found" }
      });
    }

    res.json(property);
  }));

  // Create document with extracted data
  app.post("/api/documents", asyncHandler(async (req: Request, res: Response) => {
    const result = insertDocumentSchema.safeParse(req.body.document);
    if (!result.success) {
      return res.status(400).json({
        error: {
          message: "Невалидни данни за документ",
          details: result.error.issues
        }
      });
    }

    const document = await storage.createDocumentWithData(
      result.data,
      req.body.extractedData
    );

    log(`Created document with ID: ${document.id} for property ID: ${document.propertyId}`);
    res.status(201).json(document);
  }));

  // Get documents by property ID
  app.get("/api/properties/:propertyId/documents", asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.propertyId);
    if (isNaN(propertyId)) {
      return res.status(400).json({
        error: { message: "Invalid property ID" }
      });
    }

    const documents = await storage.getPropertyDocuments(propertyId);
    res.json(documents);
  }));

  // Get evaluation by property ID
  app.get("/api/evaluations/property/:propertyId", asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.propertyId);
    if (isNaN(propertyId)) {
      return res.status(400).json({
        error: { message: "Invalid property ID" }
      });
    }

    const evaluation = await storage.getPropertyEvaluation(propertyId);
    if (!evaluation) {
      return res.status(404).json({
        error: { message: "Evaluation not found" }
      });
    }

    log(`Retrieved evaluation for property ID: ${propertyId}`);
    res.json(evaluation);
  }));

  // Create evaluation
  app.post("/api/evaluations", asyncHandler(async (req: Request, res: Response) => {
    const result = insertEvaluationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: {
          message: "Невалидни данни за оценка",
          details: result.error.issues
        }
      });
    }

    const evaluation = await storage.createEvaluation(result.data);
    log(`Created evaluation with ID: ${evaluation.id}`);
    res.status(201).json(evaluation);
  }));

  const httpServer = createServer(app);
  return httpServer;
}