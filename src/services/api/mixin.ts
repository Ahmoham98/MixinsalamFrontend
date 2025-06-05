import { api, handleApiError, BASE_URL } from './config'
import { AxiosError } from 'axios'

interface MixinCredentials {
  url: string
  token: string
}

interface MixinProduct {
  id: string
  name: string
  price: number
  description: string
  images: string[]
}

export const mixinApi = {
  async validateCredentials(credentials: MixinCredentials) {
    try {
      console.log('Validating Mixin credentials:', credentials);
      
      // Format the URL by removing protocol if present
      const formattedUrl = credentials.url.replace(/^https?:\/\//, '');
      console.log('Formatted URL:', formattedUrl);
      
      const requestUrl = `${BASE_URL}/mixin/validate`;
      console.log('Making request to:', requestUrl);
      
      const response = await api.post(requestUrl, {
        mixin_url: formattedUrl,
        token: credentials.token
      });
      
      console.log('Mixin validation response:', response.data);
      
      if (!response.data) {
        throw new Error('Invalid response from server');
      }
      
      return response.data;
    } catch (error: unknown) {
      console.error('Mixin validation error:', error);
      if (error instanceof AxiosError && error.response) {
        switch (error.response.status) {
          case 403:
            throw new Error('Invalid credentials');
          case 404:
            throw new Error('Mixin website not found');
          case 500:
            throw new Error('Server error occurred');
          default:
            throw new Error(error.response.data?.message || 'Failed to validate credentials');
        }
      }
      throw handleApiError(error);
    }
  },

  async getProducts() {
    try {
      const response = await api.get('/mixin/products')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getProductById(id: string) {
    try {
      const response = await api.get(`/mixin/products/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async updateProduct(id: string, product: Partial<MixinProduct>) {
    try {
      const response = await api.put(`/mixin/products/${id}`, product)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async createProduct(product: Omit<MixinProduct, 'id'>) {
    try {
      const response = await api.post('/mixin/products', product)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}