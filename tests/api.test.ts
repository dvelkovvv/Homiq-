import { api } from '../client/src/lib/api';

describe('API URL Normalization', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Create a mutable window object for testing
    global.window = {
      location: {
        origin: 'https://test.replit.dev'
      }
    } as any;

    // Reset fetch mock
    global.fetch = jest.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    // Restore original window
    global.window = originalWindow;
    jest.resetAllMocks();
  });

  test('should remove double slashes from URLs', async () => {
    const testCases = [
      { input: '/api//maps/config', expected: 'api/maps/config' },
      { input: 'api//geocode', expected: 'api/geocode' },
      { input: '//api/places/nearby', expected: 'api/places/nearby' }
    ];

    for (const { input, expected } of testCases) {
      await api.get(input);
      const lastCall = (global.fetch as jest.Mock).mock.calls.length - 1;
      const url = new URL((global.fetch as jest.Mock).mock.calls[lastCall][0]);
      expect(url.pathname).not.toContain('//');
      expect(url.pathname.replace(/^\//, '')).toBe(expected);
    }
  });

  test('should handle trailing slashes in base URL', async () => {
    const testWindow = {
      location: {
        origin: 'https://test.replit.dev/'
      }
    };

    // Use Object.defineProperty to make origin mutable for this test
    Object.defineProperty(global.window.location, 'origin', {
      writable: true,
      value: testWindow.location.origin
    });

    await api.get('api/test');
    const url = new URL((global.fetch as jest.Mock).mock.calls[0][0]);
    expect(url.toString()).toBe('https://test.replit.dev/api/test');
  });

  test('should properly join baseURL and endpoint path', async () => {
    const testCases = [
      { baseURL: 'https://test.replit.dev', path: 'api/test', expected: 'https://test.replit.dev/api/test' },
      { baseURL: 'https://test.replit.dev/', path: '/api/test', expected: 'https://test.replit.dev/api/test' },
      { baseURL: 'https://test.replit.dev/', path: 'api/test/', expected: 'https://test.replit.dev/api/test' }
    ];

    for (const { baseURL, path, expected } of testCases) {
      Object.defineProperty(global.window.location, 'origin', {
        writable: true,
        value: baseURL
      });

      await api.get(path);
      const url = new URL((global.fetch as jest.Mock).mock.calls.at(-1)![0]);
      expect(url.toString()).toBe(expected);
    }
  });
});