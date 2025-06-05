import axios from 'axios'

const isDevelopment = import.meta.env.DEV
export const BASE_URL = isDevelopment ? '/api' : 'https://mixinsalam.liara.run'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  // Add these options to handle redirects and methods
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept all status codes less than 500
  }
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Add debug logging
    console.log('=== API Request Debug ===');
    console.log('Request URL:', config.url);
    console.log('Request Method:', config.method);
    console.log('Request Headers:', config.headers);
    console.log('Request Data:', config.data);
    console.log('Base URL:', config.baseURL);
    
    // Ensure the request method is set correctly
    if (config.method === 'post') {
      config.method = 'POST';
    }
    
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('=== API Response Debug ===');
    console.log('Response URL:', response.config.url);
    console.log('Response Method:', response.config.method);
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('=== API Error Debug ===');
    console.error('Error URL:', error.config?.url);
    console.error('Error Method:', error.config?.method);
    console.error('Error Status:', error.response?.status);
    console.error('Error Headers:', error.response?.headers);
    console.error('Error Data:', error.response?.data);
    console.error('Error Message:', error.message);
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