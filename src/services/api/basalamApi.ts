import { getBasalamApi } from './apiSelector'
import type { BasalamProfile } from '../../types/basalam'

// Helper function to get the correct path
const getBasalamPath = (path: string) => {
  // Remove /basalam prefix since it's now in the base URL
  return path.replace('/basalam', '')
}

export const basalamApi = {
  getProfile: async () => {
    const response = await getBasalamApi().get<BasalamProfile>(getBasalamPath('/basalam/client/me'))
    return response.data
  },

  updateProfile: async (profile: Partial<BasalamProfile>) => {
    const response = await getBasalamApi().put<BasalamProfile>(getBasalamPath('/basalam/client/me'), profile)
    return response.data
  }
} 