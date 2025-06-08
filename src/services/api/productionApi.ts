import axios from 'axios'

const PRODUCTION_BASE_URL = 'https://mixinsalam.liara.run'

// Main API instance for general requests
export const productionApi = axios.create({
  baseURL: PRODUCTION_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
})

// Mixin API instance for Mixin-specific requests
export const productionMixinApi = axios.create({
  baseURL: PRODUCTION_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
})

// Basalam API instance for Basalam-specific requests
export const productionBasalamApi = axios.create({
  baseURL: PRODUCTION_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
})

// Add response interceptor for debugging
const addInterceptors = (instance: typeof productionApi) => {
  instance.interceptors.response.use(
    (response) => {
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