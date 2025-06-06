import axios from 'axios'

// Use the correct base URL based on the environment
const isProduction = import.meta.env.PROD
const BASE_URL = isProduction 
  ? 'https://mixinsalamm.liara.run'  // Production URL
  : '/api'  // Development URL (uses Vite proxy)

console.log('API Configuration:', {
  environment: isProduction ? 'production' : 'development',
  baseURL: BASE_URL
})

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  withCredentials: true
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    // Add cache control headers to response
    response.headers['cache-control'] = 'no-cache, no-store, must-revalidate';
    response.headers['pragma'] = 'no-cache';
    response.headers['expires'] = '0';
    
    console.log('API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export interface ApiError {
  status: number
  message: string
}

export const handleApiError = (error: unknown): never => {
  const message = error instanceof Error ? error.message : 'An unknown error occurred'
  throw new Error(message)
}