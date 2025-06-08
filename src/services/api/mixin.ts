import { api, handleApiError } from './config'
import type { MixinCredentials, MixinProduct } from '../../types'
import { AxiosError } from 'axios'
import { getMixinApi } from './apiSelector'

// Helper function to get the correct path based on environment
const getMixinPath = (path: string) => {
  const isProduction = process.env.NODE_ENV === 'production'
  // In production, the base URL already includes /mixin
  return isProduction ? path.replace('/mixin', '') : path
}

export const mixinApi = {
  validateCredentials: async (url: string, token: string) => {
    try {
      console.log('Sending request to validate Mixin credentials:', {
        url,
        token,
        endpoint: '/mixin/client/'
      });

      const response = await getMixinApi().post(getMixinPath('/mixin/client/'), null, {
        params: {
          mixin_url: url,
          token: token
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Mixin validation response:', response.data);

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

  getProducts: async (credentials: MixinCredentials): Promise<MixinProduct[]> => {
    try {
      console.log('=== Mixin Products Request Debug ===');
      console.log('Mixin URL:', credentials.mixin_url);
      console.log('Access Token:', credentials.access_token);
      console.log('Full Request URL:', `https://mixinsalam.liara.run/products/my-mixin-products`);
      console.log('Request Headers:', {
        Authorization: `Bearer ${credentials.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      });
      console.log('Request Params:', { 
        mixin_url: credentials.mixin_url,
        mixin_page: 1 
      });
      
      const response = await getMixinApi().get(getMixinPath('/products/my-mixin-products'), {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        params: {
          mixin_url: credentials.mixin_url,
          mixin_page: 1,
        },
      });

      console.log('=== Mixin Products Response Debug ===');
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      console.log('Response Data:', response.data);

      if (!response.data) {
        console.error('No data received in response');
        return [];
      }

      // Handle paginated response with data array
      if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('Returning data array from response.data.data');
        return response.data.data;
      }

      // Handle paginated response with result array
      if (response.data?.result && Array.isArray(response.data.result)) {
        console.log('Returning result array from response.data.result');
        return response.data.result;
      }

      // Fallback to direct array
      if (Array.isArray(response.data)) {
        console.log('Returning direct array from response.data');
        return response.data;
      }

      // Fallback to single item
      if (response.data?.id) {
        console.log('Returning single item as array');
        return [response.data];
      }

      console.error('Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error('=== Mixin Products Error Debug ===');
      console.error('Error:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Status:', error.response.status);
        console.error('Error Headers:', error.response.headers);
        console.error('Request Config:', {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          params: error.config?.params
        });

        // Handle specific error cases
        if (error.response.status === 404) {
          console.error('Product endpoint not found. Please check the API endpoint.');
        } else if (error.response.status === 401) {
          console.error('Unauthorized. Please check your access token.');
        } else if (error.response.status === 403) {
          console.error('Forbidden. You may not have permission to access these products.');
        }
      }
      return [];
    }
  },

  getProductById: async (credentials: MixinCredentials, productId: number): Promise<MixinProduct | null> => {
    try {
      const response = await getMixinApi().get(getMixinPath(`/products/mixin/${productId}`), {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
        },
      })
      return response.data || null
    } catch (error) {
      console.error('Error fetching Mixin product:', error)
      return null
    }
  },

  updateProduct: async (credentials: MixinCredentials, productId: number, productData: { name: string; price: number }) => {
    try {
      const formData = new FormData()
      formData.append('name', productData.name)
      formData.append('price', productData.price.toString())

      const response = await getMixinApi().patch(
        getMixinPath(`/products/update/mixin/${productId}`),
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
      console.error('Error updating Mixin product:', error)
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
        throw new Error(error.response.data?.message || 'Failed to update Mixin product')
      }
      throw new Error('Failed to update Mixin product')
    }
  },

  createProduct: async (credentials: MixinCredentials, productData: { name: string; price: number }) => {
    try {
      const formData = new FormData()
      formData.append('name', productData.name)
      formData.append('price', productData.price.toString())

      const response = await getMixinApi().post(
        getMixinPath('/products/create/mixin'),
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
      console.error('Error creating Mixin product:', error)
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
        throw new Error(error.response.data?.message || 'Failed to create Mixin product')
      }
      throw new Error('Failed to create Mixin product')
    }
  }
}