import axios from 'axios'

// Use the full URL in production, relative path in development
export const BASE_URL = import.meta.env.PROD 
  ? 'https://mixinsalam.liara.run'  // Note: single 'm' in mixinsalam
  : '/api'

// Create axios instance with default config
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  maxRedirects: 5,
  maxContentLength: 50 * 1024 * 1024, // 50MB max content length
  validateStatus: (status) => status >= 200 && status < 500
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Log the full request details
    console.log('Making API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      params: config.params,
      headers: config.headers,
      data: config.data,
      timeout: config.timeout,
      withCredentials: config.withCredentials
    });

    // Ensure headers are set correctly
    if (config.headers) {
      config.headers['Content-Type'] = 'application/json';
      config.headers['Accept'] = 'application/json';
    }

    return config;
  },
  (error) => {
    console.error('API Request Error:', {
      message: error.message,
      config: error.config,
      code: error.code
    });
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Received API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      config: {
        url: response.config.url,
        method: response.config.method,
        baseURL: response.config.baseURL
      }
    });
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
        params: error.config?.params
      },
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      } : undefined
    });

    // Handle specific error cases
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error Details:', {
        message: error.message,
        config: error.config
      });
    }

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