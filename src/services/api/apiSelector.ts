import { api } from './config'
import { productionApi, productionBasalamClientApi, productionBasalamProductsApi } from './productionApi'

export const getApi = () => {
  return import.meta.env.PROD ? productionApi : api
}

export const getBasalamApi = () => {
  return import.meta.env.PROD ? productionBasalamClientApi : api
}

export const getBasalamClientApi = () => {
  return import.meta.env.PROD ? productionBasalamClientApi : api
}

export const getBasalamProductsApi = () => {
  return import.meta.env.PROD ? productionBasalamProductsApi : api
} 