// Mock environment variables
process.env.GOOGLE_MAPS_API_KEY = 'test_api_key';

// Mock window.location for client-side tests
global.window = {
  location: {
    origin: 'https://test.replit.dev'
  }
} as any;
