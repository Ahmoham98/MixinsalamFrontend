import axios from 'axios'

const isDevelopment = import.meta.env.DEV
export const BASE_URL = isDevelopment ? '/api' : 'https://mixinsalam.liara.run'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Changed to false for CORS
  // Add these options to handle redirects
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept all status codes less than 500
  }
})

// Add request interceptor to handle trailing slashes and CORS
api.interceptors.request.use(
  (config) => {
    // Ensure URLs don't have double slashes
    if (config.url) {
      config.url = config.url.replace(/([^:]\/)\/+/g, "$1");
    }
    
    // Add CORS headers
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    
    return config;
  },
  (error) => {
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