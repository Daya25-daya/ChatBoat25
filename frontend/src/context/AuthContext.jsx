import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { generateKeyPair, storeKeys, hasKeys, clearKeys } from '../utils/encryption'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setAccessToken(token)
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { user, accessToken, refreshToken } = response.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      setAccessToken(accessToken)
      setUser(user)

      // Check if user has encryption keys, generate if missing
      if (!hasKeys(user._id)) {
        console.log('🔐 Generating encryption keys for existing user...')
        const { publicKey, privateKey } = await generateKeyPair()
        storeKeys(user._id, publicKey, privateKey)
        
        // Update public key on server
        try {
          await axios.put('/api/users/profile', { publicKey })
          console.log('✅ Encryption keys generated and synced')
        } catch (error) {
          console.error('Failed to sync public key:', error)
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      }
    }
  }

  const register = async (username, email, password) => {
    try {
      // Step 1: Generate encryption keys for E2EE
      console.log('🔐 Generating encryption keys...')
      const { publicKey, privateKey } = await generateKeyPair()

      // Step 2: Register user with public key
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password,
        publicKey // Send public key to server
      })
      const { user, accessToken, refreshToken } = response.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      // Step 3: Store encryption keys locally (private key never leaves device!)
      storeKeys(user._id, publicKey, privateKey)
      console.log('✅ Encryption keys generated and stored')

      setAccessToken(accessToken)
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      await axios.post('/api/auth/logout', { refreshToken })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear encryption keys on logout
      if (user) {
        clearKeys(user._id)
      }
      
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      setAccessToken(null)
      setUser(null)
    }
  }

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      const response = await axios.post('/api/auth/refresh', { refreshToken })
      const { accessToken } = response.data

      localStorage.setItem('accessToken', accessToken)
      setAccessToken(accessToken)

      return accessToken
    } catch (error) {
      logout()
      return null
    }
  }

  const value = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
    refreshAccessToken
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
