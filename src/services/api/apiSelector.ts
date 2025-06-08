import { api } from './config'
import { productionApi, productionMixinApi, productionBasalamApi, productionProductsApi } from './productionApi'
import { productionBasalamEndpoints, productionMixinEndpoints } from './productionEndpoints'

// Development API selectors
export const getApi = () => {
  return import.meta.env.PROD ? productionApi : api
}

export const getMixinApi = () => {
  return import.meta.env.PROD ? productionMixinApi : api
}

export const getBasalamApi = () => {
  return import.meta.env.PROD ? productionBasalamApi : api
}

export const getProductsApi = () => {
  return import.meta.env.PROD ? productionProductsApi : api
}

// Production API selectors
export const getProductionBasalamEndpoints = () => {
  return import.meta.env.PROD ? productionBasalamEndpoints : null
}

export const getProductionMixinEndpoints = () => {
  return import.meta.env.PROD ? productionMixinEndpoints : null
} 