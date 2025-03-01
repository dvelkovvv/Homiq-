import axios from 'axios';

// Remove trailing slashes and normalize the base URL
const baseURL = window.location.origin.replace(/\/+$/, '');

// Configure axios defaults
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Normalize URL paths by removing double slashes
api.interceptors.request.use(config => {
  if (config.url) {
    // Remove leading slash if present since baseURL is already set
    config.url = config.url.replace(/^\/+/, '');
    // Normalize path segments
    config.url = config.url.replace(/\/+/g, '/');
  }
  return config;
});

export { api };
