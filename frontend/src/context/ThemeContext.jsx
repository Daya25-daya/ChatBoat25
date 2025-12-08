import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// Available themes
export const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#7c3aed', // purple-600
      primaryHover: '#6d28d9', // purple-700
      background: '#ffffff',
      surface: '#f9fafb', // gray-50
      surfaceHover: '#f3f4f6', // gray-100
      text: '#111827', // gray-900
      textSecondary: '#6b7280', // gray-500
      border: '#e5e7eb', // gray-200
      success: '#10b981', // green-500
      error: '#ef4444', // red-500
      warning: '#f59e0b', // amber-500
      info: '#3b82f6', // blue-500
    }
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#a78bfa', // purple-400
      primaryHover: '#8b5cf6', // purple-500
      background: '#111827', // gray-900
      surface: '#1f2937', // gray-800
      surfaceHover: '#374151', // gray-700
      text: '#f9fafb', // gray-50
      textSecondary: '#9ca3af', // gray-400
      border: '#374151', // gray-700
      success: '#34d399', // green-400
      error: '#f87171', // red-400
      warning: '#fbbf24', // amber-400
      info: '#60a5fa', // blue-400
    }
  },
  ocean: {
    name: 'ocean',
    colors: {
      primary: '#0ea5e9', // sky-500
      primaryHover: '#0284c7', // sky-600
      background: '#0c4a6e', // sky-900
      surface: '#075985', // sky-800
      surfaceHover: '#0369a1', // sky-700
      text: '#f0f9ff', // sky-50
      textSecondary: '#bae6fd', // sky-200
      border: '#0369a1', // sky-700
      success: '#14b8a6', // teal-500
      error: '#f43f5e', // rose-500
      warning: '#fb923c', // orange-400
      info: '#38bdf8', // sky-400
    }
  }
}

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light')

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const defaultTheme = prefersDark ? 'dark' : 'light'
      setCurrentTheme(defaultTheme)
      applyTheme(defaultTheme)
    }
  }, [])

  // Apply theme to document
  const applyTheme = (themeName) => {
    const theme = themes[themeName]
    const root = document.documentElement

    // Apply CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })

    // Apply dark class for Tailwind
    if (themeName === 'dark' || themeName === 'ocean') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  // Change theme
  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName)
      applyTheme(themeName)
      localStorage.setItem('theme', themeName)
    }
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    changeTheme(newTheme)
  }

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes: Object.keys(themes),
    changeTheme,
    toggleTheme
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
