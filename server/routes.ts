import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPropertySchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.post("/api/properties", async (req, res) => {
    const result = insertPropertySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const property = await storage.createProperty(result.data);
    res.json(property);
  });

  app.get("/api/properties/:id", async (req, res) => {
    const property = await storage.getProperty(parseInt(req.params.id));
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  });

  return createServer(app);
}