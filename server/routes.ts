import type { Express, Request, Response } from "express";
import { createServer } from "http";
import fetch from "node-fetch";

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: any) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

export async function registerRoutes(app: Express) {
  // Geocoding endpoint
  app.get("/api/geocode", asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    try {
      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      url.searchParams.append('address', address as string);
      url.searchParams.append('key', apiKey);

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        res.json(data);
      } else {
        res.status(400).json({
          error: "Could not find location",
          details: data.status
        });
      }
    } catch (error) {
      res.status(500).json({
        error: "Failed to geocode",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }));

  const httpServer = createServer(app);
  return httpServer;
}