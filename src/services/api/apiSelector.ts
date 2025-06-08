import { api } from './config'
import { productionApi } from './productionApi'
import { productionBasalamEndpoints, productionMixinEndpoints } from './productionEndpoints'

// Development API selectors
export const getApi = () => {
  return import.meta.env.PROD ? productionApi : api
}

// Production API selectors
export const getProductionBasalamEndpoints = () => {
  return import.meta.env.PROD ? productionBasalamEndpoints : null
}

export const getProductionMixinEndpoints = () => {
  return import.meta.env.PROD ? productionMixinEndpoints : null
} 