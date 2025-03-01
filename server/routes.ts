import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import fetch from "node-fetch";

// In-memory storage
let properties = [];
let propertyIdCounter = 1;

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Функция за изчисляване на разстояние
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371e3; // Радиус на Земята в метри
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function registerRoutes(app: Express) {
  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Error handling
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message
    });
  });

  // Търсене на адрес и анализ на локацията
  app.get('/api/search-location', asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!address) {
      return res.status(400).json({ error: "Адресът е задължителен" });
    }

    try {
      // Geocoding за координати
      const geoResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address as string)}&key=${apiKey}&language=bg`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results?.[0]) {
        return res.status(404).json({ error: 'Адресът не е намерен' });
      }

      const location = geoData.results[0].geometry.location;
      const { lat, lng } = location;

      // Търсене на близки обекти
      const searchTypes = ['subway_station', 'park', 'school', 'hospital'];
      const placesPromises = searchTypes.map(type =>
        fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=${type}&key=${apiKey}&language=bg`
        ).then(res => res.json())
      );

      const placesResults = await Promise.all(placesPromises);
      const [metroData, parksData, schoolsData, hospitalsData] = placesResults;

      // Анализ на данните
      const metro = metroData.results?.[0];
      const metroDistance = metro ? calculateDistance(
        lat, lng,
        metro.geometry.location.lat,
        metro.geometry.location.lng
      ) : null;

      const analysis = {
        address: geoData.results[0].formatted_address,
        location: { lat, lng },
        metro: metro ? {
          name: metro.name,
          distance: Math.round(metroDistance)
        } : null,
        parks: parksData.results?.length || 0,
        schools: schoolsData.results?.length || 0,
        hospitals: hospitalsData.results?.length || 0
      };

      // Запазване в in-memory storage
      const property = {
        id: propertyIdCounter++,
        ...analysis
      };
      properties.push(property);

      res.json({
        property_id: property.id,
        analysis
      });

    } catch (err) {
      console.error('Error analyzing location:', err);
      res.status(500).json({
        error: "Грешка при анализ на локацията",
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }));

  // Вземане на всички имоти
  app.get('/api/properties', (_req, res) => {
    res.json(properties);
  });

  // Вземане на конкретен имот
  app.get('/api/properties/:id', (req, res) => {
    const property = properties.find(p => p.id === parseInt(req.params.id));
    if (!property) {
      return res.status(404).json({ error: 'Имотът не е намерен' });
    }
    res.json(property);
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
    const { address } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    try {
      console.log('Geocoding address:', address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?${new URLSearchParams({
        address: address as string,
        key: apiKey,
        language: 'bg',
        components: 'country:BG'
      })}`;

      const response = await fetch(url);
      const data = await response.json();

      console.log('Geocoding response:', data);

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        res.json(data);
      } else {
        res.status(404).json({
          error: "Address not found",
          details: data.status
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
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
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('Google Maps API key is not configured');
      }
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${new URLSearchParams({
        location: location as string,
        type: type as string,
        radius: radius as string,
        language: 'bg',
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
      res.json(data);
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch nearby places",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }));

  // Create property with analysis
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

    try {
      // Get nearby metro stations and parks
      const [metroData, parksData] = await Promise.all([
        proxyGoogleMapsRequest('place/nearbysearch/json', {
          location: `${result.data.location.lat},${result.data.location.lng}`,
          type: 'subway_station',
          radius: '1500',
          language: 'bg'
        }),
        proxyGoogleMapsRequest('place/nearbysearch/json', {
          location: `${result.data.location.lat},${result.data.location.lng}`,
          type: 'park',
          radius: '1000',
          language: 'bg'
        })
      ]);

      // Calculate metro distance if any station found
      let metroDistance = null;
      if (metroData.results?.[0]) {
        const station = metroData.results[0];
        metroDistance = calculateDistance(
          result.data.location.lat, result.data.location.lng,
          station.geometry.location.lat,
          station.geometry.location.lng
        );
      }

      // Calculate price range based on location analysis
      const priceRange = calculatePriceRange(
        metroDistance,
        parksData.results.length,
        result.data.area
      );

      // Create property with analysis data
      const property = {
        id: propertyIdCounter++,
        ...result.data,
        metro_distance: metroDistance,
        green_zones: parksData.results.length,
        price_range: priceRange
      };
      properties.push(property);

      res.status(201).json({
        ...property,
        analysis: {
          metro_stations: metroData.results.length,
          parks: parksData.results.length,
          nearest_metro: metroData.results[0]?.name,
          nearest_park: parksData.results[0]?.name,
          price_range: priceRange
        }
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to create property",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }));

  // Get property by ID
  app.get("/api/properties/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        error: { message: "Invalid property ID" }
      });
    }

    const property = properties.find(p => p.id === id);
    if (!property) {
      return res.status(404).json({
        error: { message: "Property not found" }
      });
    }

    res.json(property);
  }));

  // Get all properties
  app.get("/api/properties", asyncHandler(async (_req, res) => {
    res.json(properties);
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
    res.json(document);
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

  // Calculate price range based on location and area
  function calculatePriceRange(metroDistance: number | null, greenZones: number, area: number) {
    // Base price per square meter
    let basePrice = 1000;

    // Adjust for metro proximity
    if (metroDistance) {
      if (metroDistance < 500) basePrice *= 1.3;
      else if (metroDistance < 1000) basePrice *= 1.2;
      else if (metroDistance < 1500) basePrice *= 1.1;
    }

    // Adjust for green zones
    basePrice *= (1 + (greenZones * 0.05));

    return {
      min: Math.round(basePrice * 0.9),
      max: Math.round(basePrice * 1.1)
    };
  }

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

  const httpServer = createServer(app);
  return httpServer;
}