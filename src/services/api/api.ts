import { getApi } from './apiSelector'
import type { User } from '../../types/user'

export const api = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await getApi().post<{ token: string; user: User }>('/auth/login', credentials)
    return response.data
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await getApi().post<{ token: string; user: User }>('/auth/register', userData)
    return response.data
  },

  getProfile: async () => {
    const response = await getApi().get<User>('/auth/me')
    return response.data
  },

  updateProfile: async (profile: Partial<User>) => {
    const response = await getApi().put<User>('/auth/me', profile)
    return response.data
  },

  logout: async () => {
    const response = await getApi().post('/auth/logout')
    return response.data
  }
} 