import type { Express, Request, Response } from "express";
import { createServer } from "http";
import fetch from "node-fetch";

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: any) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

export async function registerRoutes(app: Express) {
  // Get Google Maps API config
  app.get("/api/maps/config", asyncHandler(async (_req, res) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    console.log('Checking Maps API key configuration');

    if (!apiKey) {
      console.error("Google Maps API key not found in environment");
      return res.status(500).json({ error: "API key not configured" });
    }

    try {
      // Test the API key with a simple geocoding request
      const testUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      testUrl.searchParams.append('address', 'Sofia,Bulgaria');
      testUrl.searchParams.append('key', apiKey);

      console.log('Testing API key with URL:', testUrl.toString());

      const response = await fetch(testUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      if (data.status === 'REQUEST_DENIED') {
        console.error('API Key test failed:', data.error_message);
        return res.status(400).json({ 
          error: "API key validation failed",
          details: data.error_message
        });
      }

      console.log('API Key test successful');
      res.json({ apiKey });
    } catch (error) {
      console.error('API Key test error:', error);
      res.status(500).json({ 
        error: "Failed to validate API key",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }));

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
      url.searchParams.append('language', 'bg');

      console.log('Making geocoding request to:', url.toString());

      const response = await fetch(url.toString());
      const data = await response.json();

      console.log('Geocoding response:', data);

      if (data.status === 'OK') {
        res.json(data);
      } else {
        console.error('Geocoding error:', data);
        res.status(400).json({
          error: "Could not find location",
          details: data.status,
          message: data.error_message
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      res.status(500).json({
        error: "Failed to geocode",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }));

  const httpServer = createServer(app);
  return httpServer;
}