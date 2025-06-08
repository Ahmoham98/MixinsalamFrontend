import { getBasalamApi } from './apiSelector'
import type { BasalamProfile } from '../../types/basalam'

export const basalamApi = {
  getProfile: async () => {
    const response = await getBasalamApi().get<BasalamProfile>('/client/me')
    return response.data
  },

  updateProfile: async (profile: Partial<BasalamProfile>) => {
    const response = await getBasalamApi().put<BasalamProfile>('/client/me', profile)
    return response.data
  }
} 