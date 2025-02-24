import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPropertySchema } from "@shared/schema";
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

  const server = createServer(app);
  return server;
}