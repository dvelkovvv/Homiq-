import express, { Express } from 'express';
import { createServer } from 'http';
import request from 'supertest';
import { registerRoutes } from '../server/routes';

describe('Routes', () => {
  let app: Express;
  let server: ReturnType<typeof createServer>;

  beforeAll(async () => {
    app = express();
    server = await registerRoutes(app);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Google Maps API Configuration', () => {
    test('should validate API key', async () => {
      const response = await request(app)
        .get('/api/maps/config')
        .expect('Content-Type', /json/);

      if (process.env.GOOGLE_MAPS_API_KEY) {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('apiKey');
      } else {
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'API key not configured');
      }
    });
  });

  describe('Geocoding Endpoint', () => {
    test('should require address or coordinates', async () => {
      const response = await request(app)
        .get('/api/geocode')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Address or latlng parameter is required');
    });

    test('should handle valid address search', async () => {
      const response = await request(app)
        .get('/api/geocode')
        .query({ address: 'Sofia, Bulgaria' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
    });
  });

  describe('Places Nearby Search', () => {
    test('should require location parameter', async () => {
      const response = await request(app)
        .get('/api/places/nearby')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Location parameter is required');
    });

    test('should handle valid nearby search', async () => {
      const response = await request(app)
        .get('/api/places/nearby')
        .query({ 
          location: '42.6977,23.3219',
          type: 'subway_station'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
    });
  });
});