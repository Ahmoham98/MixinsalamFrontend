import { productionApi } from './productionApi'
import type { BasalamCredentials, MixinCredentials } from '../../types'

// Basalam endpoints
export const productionBasalamEndpoints = {
  // Get Basalam user data
  getUserData: async (token: string) => {
    const response = await productionApi.get('/basalam/client/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    return response.data
  },

  // Get Basalam products
  getProducts: async (token: string, vendorId: number) => {
    const response = await productionApi.get(`/products/my-basalam-products/${vendorId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    return response.data
  },

  // Get Basalam product by ID
  getProductById: async (token: string, productId: number) => {
    const response = await productionApi.get(`/basalam/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    return response.data
  },

  // Update Basalam product
  updateProduct: async (token: string, productId: number, productData: { name: string; price: number }) => {
    const formData = new FormData()
    formData.append('name', productData.name)
    formData.append('price', productData.price.toString())

    const response = await productionApi.patch(
      `/update/basalam/${productId}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  }
}

// Mixin endpoints
export const productionMixinEndpoints = {
  // Get Mixin product by ID
  getProductById: async (token: string, productId: number, mixinUrl: string) => {
    const response = await productionApi.get(`/mixin/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: {
        mixin_url: mixinUrl
      }
    })
    return response.data
  },

  // Update Mixin product
  updateProduct: async (token: string, productId: number, mixinUrl: string, productData: any) => {
    const response = await productionApi.put(
      `/update/mixin/${productId}`,
      productData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        params: {
          mixin_url: mixinUrl
        }
      }
    )
    return response.data
  }
} 