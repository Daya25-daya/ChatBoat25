import { useState, useEffect } from 'react'

const SimpleThemeSwitcher = () => {
  const [theme, setTheme] = useState('light')
  const [isOpen, setIsOpen] = useState(false)

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'light'
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (newTheme) => {
    const root = document.documentElement
    
    // Remove all theme classes first
    root.classList.remove('dark', 'light', 'ocean')
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
      root.style.backgroundColor = '#111827'
    } else if (newTheme === 'ocean') {
      root.classList.add('dark', 'ocean')
      root.style.backgroundColor = '#0c4a6e'
    } else {
      root.classList.add('light')
      root.style.backgroundColor = '#ffffff'
    }
  }

  const changeTheme = (newTheme) => {
    console.log('Changing theme to:', newTheme)
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem('app-theme', newTheme)
    setIsOpen(false)
  }

  const themeIcons = {
    light: '☀️',
    dark: '🌙',
    ocean: '🌊'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-white/20 transition-colors text-white text-xl"
        title="Change theme"
      >
        {themeIcons[theme]}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-2">
              <button
                onClick={() => changeTheme('light')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  theme === 'light' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-xl">☀️</span>
                <span>Light</span>
                {theme === 'light' && <span className="ml-auto">✓</span>}
              </button>
              
              <button
                onClick={() => changeTheme('dark')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  theme === 'dark' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-xl">🌙</span>
                <span>Dark</span>
                {theme === 'dark' && <span className="ml-auto">✓</span>}
              </button>
              
              <button
                onClick={() => changeTheme('ocean')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  theme === 'ocean' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-xl">🌊</span>
                <span>Ocean</span>
                {theme === 'ocean' && <span className="ml-auto">✓</span>}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SimpleThemeSwitcher
