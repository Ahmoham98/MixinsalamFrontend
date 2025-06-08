import { api } from './config'
import { productionApi, productionMixinApi, productionBasalamApi } from './productionApi'

export const getApi = () => {
  return import.meta.env.PROD ? productionApi : api
}

export const getMixinApi = () => {
  return import.meta.env.PROD ? productionMixinApi : api
}

export const getBasalamApi = () => {
  return import.meta.env.PROD ? productionBasalamApi : api
} 