import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { useSocket } from '../context/SocketContext'
import ConversationList from '../components/ConversationList'
import MessageArea from '../components/MessageArea'
import UserSearch from '../components/UserSearch'
import SimpleThemeSwitcher from '../components/SimpleThemeSwitcher'

const Chat = () => {
  const { user, logout } = useAuth()
  const { connected } = useSocket()
  const [showSearch, setShowSearch] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white p-4 shadow-2xl">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">ChatApp</h1>
              <div className="flex items-center text-xs">
                {connected ? (
                  <>
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    <span className="text-green-100">Connected</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    <span className="text-red-100">Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{user?.username}</span>
            </div>
            
            {/* Theme Switcher */}
            <SimpleThemeSwitcher />
            
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">New Chat</span>
            </button>
            
            <button
              onClick={logout}
              className="bg-red-500/80 hover:bg-red-600 backdrop-blur-sm px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-screen-2xl mx-auto w-full">
        {/* Sidebar - Conversations */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col shadow-xl">
          <ConversationList />
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col bg-white/50 backdrop-blur-sm">
          <MessageArea />
        </div>
      </div>

      {/* User Search Modal */}
      {showSearch && (
        <UserSearch onClose={() => setShowSearch(false)} />
      )}
    </div>
  )
}

export default Chat
