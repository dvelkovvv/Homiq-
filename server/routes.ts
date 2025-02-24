import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertEvaluationSchema } from "@shared/schema";

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

  app.post("/api/evaluations", async (req, res) => {
    const result = insertEvaluationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const evaluation = await storage.createEvaluation(result.data);
    res.json(evaluation);
  });

  app.get("/api/evaluations/:id", async (req, res) => {
    const evaluation = await storage.getEvaluation(parseInt(req.params.id));
    if (!evaluation) {
      return res.status(404).json({ error: "Evaluation not found" });
    }
    res.json(evaluation);
  });

  app.get("/api/achievements", async (_req, res) => {
    const achievements = await storage.getAchievements();
    res.json(achievements);
  });

  return createServer(app);
}
