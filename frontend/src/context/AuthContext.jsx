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

      // Optional: Generate encryption keys if not exists (E2EE feature)
      // This is optional and won't break the app if backend doesn't support it
      if (!hasKeys(user._id)) {
        try {
          console.log('🔐 Generating encryption keys (optional)...')
          const { publicKey, privateKey } = await generateKeyPair()
          storeKeys(user._id, publicKey, privateKey)
          
          // Try to sync public key with server (optional)
          try {
            await axios.put('/api/users/profile', { publicKey })
            console.log('✅ Encryption keys synced')
          } catch (syncError) {
            // Silently fail - encryption will work locally without server sync
            console.log('ℹ️ Encryption keys stored locally (server sync not available)')
          }
        } catch (keyError) {
          // Encryption key generation failed - not critical, app still works
          console.log('ℹ️ Encryption not available')
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
      // Step 1: Try to register user (without encryption first)
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password
      })
      const { user, accessToken, refreshToken } = response.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      setAccessToken(accessToken)
      setUser(user)

      // Step 2: Optional - Generate encryption keys for E2EE
      try {
        console.log('🔐 Generating encryption keys (optional)...')
        const { publicKey, privateKey } = await generateKeyPair()
        
        // Store keys locally
        storeKeys(user._id, publicKey, privateKey)
        
        // Try to sync with server (optional)
        try {
          await axios.put('/api/users/profile', { publicKey })
          console.log('✅ Encryption keys synced')
        } catch (syncError) {
          console.log('ℹ️ Encryption keys stored locally (server sync not available)')
        }
      } catch (keyError) {
        console.log('ℹ️ Encryption not available')
      }

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
