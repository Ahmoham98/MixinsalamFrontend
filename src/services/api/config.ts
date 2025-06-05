import axios, { AxiosHeaders } from 'axios'

// Use the full URL in production, relative path in development
export const BASE_URL = import.meta.env.PROD 
  ? 'https://mixinsalam.liara.run'  // Note: single 'm' in mixinsalam
  : '/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  // Add timeout
  timeout: 10000
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Ensure headers are properly set
    const headers = new AxiosHeaders(config.headers);
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    config.headers = headers;
    
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      params: config.params,
      data: config.data,
      fullUrl: `${BASE_URL}${config.url}`
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
    console.log('API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers
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