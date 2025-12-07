import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { accessToken, user } = useAuth()

  useEffect(() => {
    if (accessToken && user) {
      // Connect to socket server
      const socketUrl = import.meta.env.PROD 
        ? 'https://chat-gateway-lfj7.onrender.com' 
        : 'http://localhost:4000'
      
      const newSocket = io(socketUrl, {
        auth: {
          token: accessToken
        }
      })

      newSocket.on('connect', () => {
        console.log('✅ Socket connected successfully')
        console.log('Socket ID:', newSocket.id)
        setConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected')
        setConnected(false)
      })

      newSocket.on('error', (error) => {
        console.error('❌ Socket error:', error)
      })

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error)
      })

      // Expose socket to window for debugging
      window.debugSocket = newSocket
      window.testSendMessage = () => {
        console.log('🧪 Testing message send...')
        console.log('Socket connected?', newSocket.connected)
        console.log('Socket ID:', newSocket.id)
        newSocket.emit('send_message', {
          receiverId: 'test123',
          content: 'Test message',
          conversationId: null,
          type: 'text'
        })
        console.log('✅ Test message emitted')
      }
      
      // Log all socket events for debugging
      newSocket.onAny((eventName, ...args) => {
        console.log(`📡 Socket event: ${eventName}`, args)
      })
      
      newSocket.onAnyOutgoing((eventName, ...args) => {
        console.log(`📤 Socket outgoing: ${eventName}`, args)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
        delete window.debugSocket
        delete window.testSendMessage
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
        setConnected(false)
      }
    }
  }, [accessToken, user])

  const value = {
    socket,
    connected
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
