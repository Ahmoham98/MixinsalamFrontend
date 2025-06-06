import axios from 'axios'

const PRODUCTION_BASE_URL = 'https://mixinsalam.liara.run'

// Main API instance for general requests
export const productionApi = axios.create({
  baseURL: PRODUCTION_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  withCredentials: true
})

// Mixin API instance for Mixin-specific requests
export const productionMixinApi = axios.create({
  baseURL: `${PRODUCTION_BASE_URL}/products`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  withCredentials: true
})

// Basalam API instance for Basalam-specific requests
export const productionBasalamApi = axios.create({
  baseURL: `${PRODUCTION_BASE_URL}/basalam`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  withCredentials: true
})

// Add response interceptor for debugging
const addInterceptors = (instance: typeof productionApi) => {
  instance.interceptors.response.use(
    (response) => {
      // Add cache control headers to response
      response.headers['cache-control'] = 'no-cache, no-store, must-revalidate';
      response.headers['pragma'] = 'no-cache';
      response.headers['expires'] = '0';
      
      console.log('Production API Response:', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        data: response.data
      });
      return response;
    },
    (error) => {
      console.error('Production API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return Promise.reject(error);
    }
  );
};

// Add interceptors to all production API instances
addInterceptors(productionApi);
addInterceptors(productionMixinApi);
addInterceptors(productionBasalamApi); 