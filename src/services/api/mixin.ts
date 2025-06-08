import { api } from './config'
import type { MixinCredentials, MixinProduct } from '../../types'
import { AxiosError } from 'axios'
import { getMixinApi } from './apiSelector'

export const mixinApi = {
  validateCredentials: async (url: string, token: string) => {
    try {
      console.log('Sending request to validate Mixin credentials:', {
        url,
        token,
        endpoint: '/mixin/client/'
      });

      const response = await getMixinApi().post(`/mixin/client/`, null, {
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
      console.log('Fetching Mixin products with credentials:', {
        url: credentials.url,
        token: credentials.access_token
      });

      const response = await getMixinApi().get('/products/my-mixin-products', {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        params: {
          mixin_url: credentials.url,
          mixin_page: 1
        }
      });

      console.log('Mixin products response:', response.data);

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
      console.error('Error fetching Mixin products:', error);
      return [];
    }
  },

  getProductById: async (credentials: MixinCredentials, productId: number): Promise<MixinProduct | null> => {
    try {
      const response = await getMixinApi().get(`/products/mixin/${productId}`, {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
        },
        params: {
          mixin_url: credentials.url,
        },
      })
      return response.data || null
    } catch (error) {
      console.error('Error fetching Mixin product:', error)
      return null
    }
  },

  updateProduct: async (credentials: MixinCredentials, productId: number, productData: any) => {
    if (!credentials.url) {
      throw new Error('Mixin URL not found in credentials')
    }

    try {
      // Get the original product data first
      const originalProduct = await mixinApi.getProductById(credentials, productId)
      if (!originalProduct) {
        throw new Error('Could not fetch original product data')
      }

      // Create updated data by merging original data with new values
      const updatedData = {
        ...originalProduct,
        name: productData.name,
        price: Number(productData.price),
        description: productData.description,
        extra_fields: []  // Always set extra_fields to empty array
      }

      console.log('Sending update request with data:', updatedData)

      const response = await getMixinApi().put(
        `/products/update/mixin/${productId}`,
        updatedData,
        {
          headers: {
            'Authorization': `Bearer ${credentials.access_token}`
          },
          params: {
            mixin_url: credentials.url
          }
        }
      )

      return response.data
    } catch (error: any) {
      console.error('Error updating Mixin product:', error)
      if (error.response?.data) {
        // Handle validation errors
        if (error.response.status === 422) {
          const validationErrors = error.response.data.detail
          if (Array.isArray(validationErrors)) {
            const errorMessages = validationErrors.map(err => `${err.loc[1]}: ${err.msg}`).join(', ')
            throw new Error(`Validation error: ${errorMessages}`)
          }
        }
        throw new Error(error.response.data.detail || 'Failed to update Mixin product')
      }
      throw new Error('Failed to update Mixin product')
    }
  },

  createProduct: async (credentials: MixinCredentials, productData: {
    name: string;
    main_category: number;
    description?: string;
    analysis?: string;
    english_name?: string;
    other_categories?: number[];
    brand?: number;
    is_digital?: boolean;
    price?: number;
    compare_at_price?: number;
    special_offer?: boolean;
    special_offer_end?: string;
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    barcode?: string;
    stock_type?: string;
    stock?: number;
    max_order_quantity?: number;
    guarantee?: string;
    product_identifier?: string;
    old_path?: string;
    old_slug?: string;
    has_variants?: boolean;
    available?: boolean;
    seo_title?: string;
    seo_description?: string;
    extra_fields?: string[];
  }) => {
    if (!credentials.url) {
      throw new Error('Mixin URL not found in credentials')
    }

    try {
      const response = await getMixinApi().post(
        '/products/create/mixin',
        productData,
        {
          headers: {
            'Authorization': `Bearer ${credentials.access_token}`
          },
          params: {
            mixin_url: credentials.url
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error creating Mixin product:', error)
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
        
        // Handle validation errors
        if (error.response.status === 422) {
          const validationErrors = error.response.data.detail
          if (Array.isArray(validationErrors)) {
            const errorMessages = validationErrors.map(err => `${err.loc[1]}: ${err.msg}`).join(', ')
            throw new Error(`Validation error: ${errorMessages}`)
          }
        }
        
        // Handle other error types
        const errorMessage = error.response.data?.detail || error.response.data?.message || 'Failed to create Mixin product'
        throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
      }
      throw new Error('Failed to create Mixin product')
    }
  }
}