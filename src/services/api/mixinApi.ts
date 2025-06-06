import { getMixinApi } from './apiSelector'
import type { MixinProduct } from '../../types/mixin'

export const mixinApi = {
  getMyProducts: async (mixinUrl: string, page: number) => {
    const response = await getMixinApi().get<MixinProduct[]>(`/my-mixin-products?mixin_url=${mixinUrl}&mixin_page=${page}`)
    return response.data
  },

  getProduct: async (id: string) => {
    const response = await getMixinApi().get<MixinProduct>(`/products/${id}`)
    return response.data
  },

  createProduct: async (product: Omit<MixinProduct, 'id'>) => {
    const response = await getMixinApi().post<MixinProduct>('/products', product)
    return response.data
  },

  updateProduct: async (id: string, product: Partial<MixinProduct>) => {
    const response = await getMixinApi().put<MixinProduct>(`/products/${id}`, product)
    return response.data
  },

  deleteProduct: async (id: string) => {
    const response = await getMixinApi().delete(`/products/${id}`)
    return response.data
  }
} 