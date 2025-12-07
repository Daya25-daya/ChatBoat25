import axios from 'axios'

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.PROD 
  ? 'https://chat-gateway-lfj7.onrender.com' 
  : 'http://localhost:4000'

axios.defaults.withCredentials = true

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 or 403 and we haven't retried yet
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post('/api/auth/refresh', { refreshToken })
        const { accessToken } = response.data

        localStorage.setItem('accessToken', accessToken)
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axios(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axios
