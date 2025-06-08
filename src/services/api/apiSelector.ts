import { api } from './config'
import { productionApi, productionMixinApi, productionBasalamApi } from './productionApi'

const isDevelopment = import.meta.env.MODE === 'development'
 
export const getApi = () => isDevelopment ? api : productionApi
export const getMixinApi = () => isDevelopment ? api : productionMixinApi
export const getBasalamApi = () => isDevelopment ? api : productionBasalamApi 