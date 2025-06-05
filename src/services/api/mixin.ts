import { api, handleApiError, BASE_URL } from './config'
import type { MixinCredentials, MixinProduct } from '../../types'
import { AxiosError } from 'axios'

export const mixinApi = {
  validateCredentials: async (url: string, token: string) => {
    try {
      console.log('Starting Mixin credentials validation...');
      
      // Validate input parameters
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL: URL must be a non-empty string');
      }
      
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token: Token must be a non-empty string');
      }
      
      // Ensure URL is properly formatted
      const formattedUrl = url.replace(/^(https?:\/\/)/, '');
      console.log('Formatted URL:', formattedUrl);
      
      // Prepare request configuration
      const requestConfig = {
        url: '/mixin/client/',
        method: 'POST',
        data: {
          mixin_url: formattedUrl,
          token: token
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000,
        validateStatus: (status: number) => status >= 200 && status < 500
      };

      console.log('Request configuration:', {
        ...requestConfig,
        fullUrl: `${BASE_URL}${requestConfig.url}`
      });

      // Make the request
      const response = await api(requestConfig);

      console.log('Raw response:', response);
      console.log('Response data:', response.data);

      // Handle successful response
      if (response.data) {
        // If we have credentials in the response, use them
        if (response.data['mixin-ceredentials']) {
          return response.data;
        }
        // If we have a success message but no credentials, create a credentials object
        else if (response.data.message) {
          return {
            'mixin-ceredentials': {
              mixin_url: formattedUrl,
              access_token: token
            },
            message: response.data.message
          };
        }
        // If we have a simple success response
        else {
          return {
            'mixin-ceredentials': {
              mixin_url: formattedUrl,
              access_token: token
            },
            message: 'Successfully connected to Mixin'
          };
        }
      }

      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });

      if (error.response) {
        console.error('Response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }

      if (error.request) {
        console.error('Request error:', {
          method: error.request.method,
          url: error.request.url,
          headers: error.request.headers
        });
      }

      if (error.response?.status === 403) {
        throw new Error("we can't login with the following credentials");
      } else if (error.response?.status === 404) {
        throw new Error("Invalid data. could be your url or your access token");
      } else if (error.response?.status === 500) {
        throw new Error("some error occurred... could be from server or from our request.");
      }

      // Handle network errors
      if (error.code === 'ERR_NETWORK') {
        console.error('Network error details:', {
          message: error.message,
          config: error.config
        });
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
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

      const response = await api.get('/products/my-mixin-products', {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
        },
        params: {
          mixin_url: credentials.url,
          mixin_page: 1,
        },
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
      const response = await api.get(`/products/mixin/${productId}`, {
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

      const response = await api.put(
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
      // Create request body exactly matching the successful Postman request
      const requestBody = {
        name: productData.name,
        main_category: productData.main_category,
        description: productData.description || '',
        english_name: null,
        other_categories: [],
        brand: null,
        analysis: null,
        price: productData.price || 0,
        special_offer_end: null,
        length: null,
        width: null,
        height: null,
        weight: productData.weight || 750,
        barcode: '',
        compare_at_price: null,
        guarantee: null,
        product_identifier: null,
        max_order_quantity: null,
        stock: productData.stock || 6,
        old_slug: null,
        old_path: null,
        seo_title: null,
        seo_description: null,
        extra_fields: []
      }

      console.log('Creating Mixin product with data:', requestBody)
      const response = await api.post(
        '/products/create/mixin',
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${credentials.access_token}`,
            'Content-Type': 'application/json'
          },
          params: {
            mixin_url: credentials.url
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