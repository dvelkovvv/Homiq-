import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertEvaluationSchema, insertDocumentSchema } from "@shared/schema";
import { log } from "./vite";
import fetch from "node-fetch";

// Proxy for Google Maps API calls
async function proxyGoogleMapsRequest(path: string, params: Record<string, string>) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API key is not configured');
    throw new Error('Google Maps API key is not configured');
  }

  const url = `https://maps.googleapis.com/maps/api/${path}?${new URLSearchParams({
    ...params,
    key: apiKey
  })}`;

  try {
    console.log(`Making request to Google Maps API: ${path}`);
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Google Maps API request failed with status: ${response.status}`);
      throw new Error(`Google Maps API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Google Maps API response status: ${data.status}`);

    if (data.status !== 'OK') {
      console.error(`Google Maps API returned non-OK status: ${data.status}`);
      console.error('Error message:', data.error_message);
    }

    return data;
  } catch (error) {
    console.error('Google Maps API error:', error);
    throw error;
  }
}

export async function registerRoutes(app: Express) {
  // Enable CORS for all routes
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  // API Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Wrap async route handlers to catch errors
  const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

  // Google Maps API Proxy Routes
  app.get("/api/geocode", asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    try {
      console.log(`Geocoding address: ${address}`);
      const data = await proxyGoogleMapsRequest('geocode/json', {
        address: address as string,
        components: 'country:BG',
        language: 'bg'
      });
      res.json(data);
    } catch (error) {
      console.error('Geocoding error:', error);
      res.status(500).json({ error: "Failed to geocode address" });
    }
  }));

  app.get("/api/places/nearby", asyncHandler(async (req: Request, res: Response) => {
    const { location, type, radius } = req.query;
    if (!location) {
      return res.status(400).json({ error: "Location parameter is required" });
    }

    try {
      console.log(`Searching nearby places. Type: ${type}, Location: ${location}`);
      const data = await proxyGoogleMapsRequest('place/nearbysearch/json', {
        location: location as string,
        type: type as string,
        radius: (radius || '1000') as string,
        language: 'bg'
      });
      res.json(data);
    } catch (error) {
      console.error('Places API error:', error);
      res.status(500).json({ error: "Failed to fetch nearby places" });
    }
  }));

  // Original routes remain unchanged
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

  // Add new route to serve Maps API key
  app.get("/api/maps/config", (_req, res) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not configured');
      return res.status(500).json({ error: "API key not configured" });
    }
    res.json({ apiKey });
  });

  const httpServer = createServer(app);
  return httpServer;
}