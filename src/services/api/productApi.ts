import { getProductsApi } from './apiSelector'
import type { BasalamProduct } from '../../types'

// Helper function to get the correct path
const getProductPath = (path: string) => {
  return path.replace('/products', '')
}

export const productApi = {
  // Get all products
  getProducts: async (vendorId: number) => {
    const response = await getProductsApi().get<BasalamProduct[]>(getProductPath('/products/my-basalam-products/' + vendorId))
    return response.data
  },

  // Get product by ID
  getProductById: async (productId: number) => {
    const response = await getProductsApi().get<BasalamProduct>(getProductPath('/products/' + productId))
    return response.data
  },

  // Update product
  updateProduct: async (productId: number, productData: { name: string; price: number }) => {
    const formData = new FormData()
    formData.append('name', productData.name)
    formData.append('price', productData.price.toString())

    const response = await getProductsApi().patch(
      getProductPath('/products/update/' + productId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  // Delete product
  deleteProduct: async (productId: number) => {
    const response = await getProductsApi().delete(getProductPath('/products/' + productId))
    return response.data
  }
} 