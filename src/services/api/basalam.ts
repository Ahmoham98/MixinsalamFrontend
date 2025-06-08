import { api, handleApiError } from './config'
import type { BasalamCredentials, BasalamProduct, BasalamUserData } from '../../types'
import { AxiosError } from 'axios'
import { getBasalamApi, getBasalamClientApi, getBasalamProductsApi } from './apiSelector'

// Helper function to get the correct path based on environment
const getBasalamPath = (path: string) => {
  const isProduction = process.env.NODE_ENV === 'production'
  // In production, the base URL already includes /basalam
  return isProduction ? path.replace('/basalam', '') : path
}

export const basalamApi = {
  getAccessToken: async (code: string, state: string) => {
    try {
      console.log('Exchanging code for token:', { code, state })
      const response = await getBasalamApi().post(getBasalamPath('/basalam/client/get-user-access-token/'), {
        code,
        state
      })
      console.log('Token exchange response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error exchanging code for access token:', error)
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      throw error
    }
  },

  validateCredentials: async (token: string) => {
    try {
      console.log('Sending request to validate Basalam credentials:', {
        token,
        endpoint: '/client/me'
      });

      const response = await getBasalamClientApi().get('/client/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Basalam validation response:', response.data);

      if (response.data) {
        return response.data;
      }
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      if (error.response?.status === 403) {
        throw new Error("we can't login with the following credentials");
      } else if (error.response?.status === 404) {
        throw new Error("Invalid data. could be your url or your access token");
      } else if (error.response?.status === 500) {
        throw new Error("some error occurred... could be from server or from our request.");
      }
      throw error;
    }
  },

  getUserData: async (credentials: BasalamCredentials): Promise<BasalamUserData | null> => {
    try {
      const response = await getBasalamApi().get(getBasalamPath('/basalam/client/me'), {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  },

  getProducts: async (credentials: BasalamCredentials, vendorId: number): Promise<BasalamProduct[]> => {
    try {
      console.log('Fetching Basalam products with credentials:', {
        token: credentials.access_token,
        vendorId
      });

      const response = await getBasalamProductsApi().get(`/products/my-basalam-products/${vendorId}`, {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        params: {
          basalam_page: 1
        }
      });

      console.log('Basalam products response:', response.data);

      // Handle paginated response
      if (response.data?.result && Array.isArray(response.data.result)) {
        return response.data.result;
      }

      // Fallback to direct array
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Fallback to single item
      if (response.data?.id) {
        return [response.data];
      }

      console.error('Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching Basalam products:', error);
      return [];
    }
  },

  getProductById: async (credentials: BasalamCredentials, productId: number): Promise<BasalamProduct | null> => {
    try {
      const response = await getBasalamApi().get(`/products/basalam/${productId}`, {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
        },
      })
      return response.data || null
    } catch (error) {
      console.error('Error fetching Basalam product:', error)
      return null
    }
  },

  updateProduct: async (credentials: BasalamCredentials, productId: number, productData: { name: string; price: number }) => {
    try {
    const formData = new FormData()
    formData.append('name', productData.name)
    formData.append('price', productData.price.toString())

      const response = await getBasalamApi().patch(
        `/products/update/basalam/${productId}`,
        formData,
      {
        headers: {
            'Authorization': `Bearer ${credentials.access_token}`,
            'Content-Type': 'multipart/form-data'
          }
      }
    )

      if (!response.data) {
        throw new Error('No data received in response')
      }

      return response.data
    } catch (error) {
      console.error('Error updating Basalam product:', error)
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
        throw new Error(error.response.data?.message || 'Failed to update Basalam product')
      }
      throw new Error('Failed to update Basalam product')
    }
  }
}