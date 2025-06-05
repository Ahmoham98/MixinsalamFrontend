import axios from 'axios'

// Use the full URL in production, relative path in development
export const BASE_URL = 'https://mixinsalam.liara.run'

// Create axios instance with default config
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Enable sending cookies and credentials
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making API Request:', {
      method: config.method,
      url: config.url,
      params: config.params,
      headers: config.headers,
      data: config.data,
      withCredentials: config.withCredentials
    })
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
      config: error.config
    })

    if (error.response) {
      console.error('Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      })
    }

    if (error.request) {
      console.error('Request Error:', {
        method: error.request.method,
        url: error.request.url,
        headers: error.request.headers
      })
    }

    return Promise.reject(error)
  }
)

export interface ApiError {
  status: number
  message: string
}

export const handleApiError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response Error:', {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    })
    return error.response.data
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Request Error:', error.request)
    throw new Error('No response received from server')
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error:', error.message)
    throw error
  }
}