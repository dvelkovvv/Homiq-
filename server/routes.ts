import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";
import { insertPropertySchema } from "@shared/schema";
import { insertDocumentSchema } from "@shared/schema";
import { insertEvaluationSchema } from "@shared/schema";
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

async function proxyGoogleMapsRequest(path: string, params: Record<string, string>) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  const url = `https://maps.googleapis.com/maps/api/${path}?${new URLSearchParams({
    ...params,
    key: apiKey
  })}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Google Maps API request failed: ${response.statusText}`);
  }

  if (data.status !== 'OK') {
    throw new Error(data.error_message || 'Google Maps API returned error');
  }

  return data;
}

export async function registerRoutes(app: Express) {
  // Test database connection
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
  }

  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Maps API configuration endpoint
  app.get("/api/maps/config", (_req, res) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }
    res.json({ apiKey });
  });

  // Geocoding endpoint
  app.get("/api/geocode", asyncHandler(async (req: Request, res: Response) => {
    const { address, latlng } = req.query;

    if (!address && !latlng) {
      return res.status(400).json({ error: "Either address or latlng parameter is required" });
    }

    try {
      const data = await proxyGoogleMapsRequest('geocode/json', {
        ...(address ? { address: address as string } : { latlng: latlng as string }),
        components: 'country:BG',
        language: 'bg'
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to geocode address",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }));

  // Places nearby search endpoint
  app.get("/api/places/nearby", asyncHandler(async (req: Request, res: Response) => {
    const { location, type, radius = '1000' } = req.query;

    if (!location) {
      return res.status(400).json({ error: "Location parameter is required" });
    }

    try {
      const data = await proxyGoogleMapsRequest('place/nearbysearch/json', {
        location: location as string,
        type: type as string,
        radius: radius as string,
        language: 'bg'
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to fetch nearby places",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }));

  // Property analysis endpoint
  app.post("/api/properties/analyze", asyncHandler(async (req: Request, res: Response) => {
    const { address, area, lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Coordinates are required" });
    }

    try {
      // Get nearby metro stations and parks
      const [metroData, parksData] = await Promise.all([
        proxyGoogleMapsRequest('place/nearbysearch/json', {
          location: `${lat},${lng}`,
          type: 'subway_station',
          radius: '1500',
          language: 'bg'
        }),
        proxyGoogleMapsRequest('place/nearbysearch/json', {
          location: `${lat},${lng}`,
          type: 'park',
          radius: '1000',
          language: 'bg'
        })
      ]);

      // Save property data to database
      const propertyResult = await pool.query(
        'INSERT INTO properties (address, area, lat, lng) VALUES ($1, $2, $3, $4) RETURNING id',
        [address, area, lat, lng]
      );

      res.json({
        id: propertyResult.rows[0].id,
        address,
        area,
        location: { lat, lng },
        analysis: {
          metro_stations: metroData.results.length,
          parks: parksData.results.length,
          nearest_metro: metroData.results[0]?.name,
          nearest_park: parksData.results[0]?.name
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to analyze location",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }));

  // Original routes
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
    console.log(`Created property with ID: ${property.id}`);
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

    console.log(`Created document with ID: ${document.id} for property ID: ${document.propertyId}`);
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

    console.log(`Retrieved evaluation for property ID: ${propertyId}`);
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
    console.log(`Created evaluation with ID: ${evaluation.id}`);
    res.status(201).json(evaluation);
  }));

  const httpServer = createServer(app);
  return httpServer;
}