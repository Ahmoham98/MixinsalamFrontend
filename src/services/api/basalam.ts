import { api, handleApiError } from './config'
import type { BasalamCredentials, BasalamProduct, BasalamUserData } from '../../types'
import { AxiosError } from 'axios'

export const basalamApi = {
  getAccessToken: async (code: string, state: string) => {
    try {
      console.log('Exchanging code for token:', { code, state })
      const response = await api.post('/basalam/client/get-user-access-token/', {
        code,
        state
      })
      return response.data
    } catch (error) {
      console.error('Error getting access token:', error)
      throw error
    }
  },

  getUserData: async (credentials: BasalamCredentials): Promise<BasalamUserData | null> => {
    try {
      const response = await api.get('/basalam/client/me', {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
        },
      })
      return response.data || null
    } catch (error) {
      console.error('Error fetching Basalam user data:', error)
      return null
    }
  },

  getProducts: async (credentials: BasalamCredentials, vendorId: number): Promise<BasalamProduct[]> => {
    try {
      console.log('=== Basalam Products Request Debug ===');
      console.log('Vendor ID:', vendorId);
      console.log('Access Token:', credentials.access_token);
      
      const response = await api.get(`/products/my-basalam-products/${vendorId}`, {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        params: {
          basalam_page: 1,
        },
      });

      console.log('=== Basalam Products Response Debug ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (!response.data) {
        console.error('No data received in response');
        return [];
      }

      // Handle the standard paginated response format
      if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('Found products in response.data.data:', {
          count: response.data.data.length,
          total: response.data.total_count,
          page: response.data.page,
          totalPages: response.data.total_page
        });
        return response.data.data;
      }

      // If we somehow get a direct array
      if (Array.isArray(response.data)) {
        console.log('Found direct array of products:', response.data.length);
        return response.data;
      }

      // If we get a single product
      if (response.data?.id) {
        console.log('Found single product');
        return [response.data];
      }

      // If we get a result array (alternative format)
      if (response.data?.result && Array.isArray(response.data.result)) {
        console.log('Found products in response.data.result:', response.data.result.length);
        return response.data.result;
      }

      console.error('Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error('=== Basalam Products Error Debug ===');
      console.error('Error:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Status:', error.response.status);

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

  getProductById: async (credentials: BasalamCredentials, productId: number): Promise<BasalamProduct | null> => {
    try {
      const response = await api.get(`/products/basalam/${productId}`, {
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

  updateProduct: async (credentials: BasalamCredentials, productId: number, productData: {
    name: string;
    price: number;
    description?: string;
    analysis?: string;
    english_name?: string;
    main_category?: number;
    other_categories?: number[];
    brand?: number;
    is_digital?: boolean;
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
    try {
    const formData = new FormData()
    formData.append('name', productData.name)
    formData.append('price', productData.price.toString())

      const response = await api.patch(
        `/products/update/basalam/${productId}`,
        formData,
      {
        headers: {
            Authorization: `Bearer ${credentials.access_token}`,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error updating Basalam product:', error)
      throw error
    }
  },

  createProduct: async (credentials: BasalamCredentials, productData: {
    name: string;
    price: number;
    description?: string;
    analysis?: string;
    english_name?: string;
    main_category?: number;
    other_categories?: number[];
    brand?: number;
    is_digital?: boolean;
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
    try {
      const formData = new FormData()
      formData.append('name', productData.name)
      formData.append('price', productData.price.toString())

      const response = await api.post(
        '/products/create/basalam',
        formData,
        {
          headers: {
            Authorization: `Bearer ${credentials.access_token}`,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error creating Basalam product:', error)
      throw error
    }
  }
}