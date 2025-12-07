import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'
import { useSocket } from './SocketContext'

const ChatContext = createContext()

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const { user, accessToken } = useAuth()
  const { socket } = useSocket()

  // Axios interceptor for auth token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    return () => {
      axios.interceptors.request.eject(interceptor)
    }
  }, [accessToken])

  // Load conversations
  useEffect(() => {
    if (user && accessToken) {
      loadConversations()
    }
  }, [user, accessToken])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    socket.on('new_message', (message) => {
      console.log('Received new_message:', message)
      console.log('Active conversation:', activeConversation)
      
      // Check if this message belongs to the active conversation
      const isActiveConversation = activeConversation && (
        // Match by conversation ID
        message.conversationId === activeConversation._id ||
        // Or match by sender ID (the person we're chatting with sent us a message)
        (activeConversation.otherUser && message.senderId === activeConversation.otherUser.userId) ||
        // Or match by participants array
        (activeConversation.participants && activeConversation.participants.includes(message.senderId))
      )
      
      console.log('Is active conversation:', isActiveConversation)
      
      if (isActiveConversation) {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some(m => m._id === message._id)
          if (exists) {
            console.log('Message already exists, skipping')
            return prev
          }
          console.log('Adding received message to state:', message)
          return [...prev, message]
        })
        
        // Update conversation ID if it was null
        if (!activeConversation._id && message.conversationId) {
          console.log('Updating conversation ID from new_message:', message.conversationId)
          setActiveConversation(prev => ({
            ...prev,
            _id: message.conversationId
          }))
        }
        
        // Mark as read
        socket.emit('mark_as_read', {
          messageId: message._id,
          senderId: message.senderId
        })
      }
      
      // Update conversation list
      loadConversations()
    })

    socket.on('message_sent', (message) => {
      console.log('Received message_sent:', message)
      console.log('Active conversation:', activeConversation)
      
      // Only add message if it belongs to the active conversation
      const belongsToActiveConversation = activeConversation && (
        // Match by conversation ID
        message.conversationId === activeConversation._id ||
        // Or match by receiver ID for new conversations
        (!activeConversation._id && activeConversation.otherUser && 
         message.receiverId === activeConversation.otherUser.userId)
      )
      
      console.log('Belongs to active conversation:', belongsToActiveConversation)
      
      if (belongsToActiveConversation) {
        // Add message to current conversation if not already present
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some(m => m._id === message._id)
          if (exists) {
            console.log('Message already exists, skipping')
            return prev
          }
          console.log('Adding message to state:', message)
          return [...prev, message]
        })
        
        // Update active conversation with the conversation ID if it was null
        if (!activeConversation._id && message.conversationId) {
          console.log('Updating conversation ID:', message.conversationId)
          setActiveConversation(prev => ({
            ...prev,
            _id: message.conversationId
          }))
        }
      }
      
      // Reload conversations to update the list
      loadConversations()
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    socket.on('user_typing', ({ userId, conversationId }) => {
      if (activeConversation && conversationId === activeConversation._id) {
        setTypingUsers((prev) => ({ ...prev, [userId]: true }))
      }
    })

    socket.on('user_stop_typing', ({ userId, conversationId }) => {
      if (activeConversation && conversationId === activeConversation._id) {
        setTypingUsers((prev) => {
          const updated = { ...prev }
          delete updated[userId]
          return updated
        })
      }
    })

    socket.on('message_read', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: 'read' } : msg
        )
      )
    })

    return () => {
      socket.off('new_message')
      socket.off('message_sent')
      socket.off('user_typing')
      socket.off('user_stop_typing')
      socket.off('message_read')
      socket.off('error')
    }
  }, [socket, activeConversation])

  const loadConversations = async () => {
    try {
      const response = await axios.get(`/api/chat/conversations`)
      setConversations(response.data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const loadMessages = async (conversationId) => {
    try {
      const response = await axios.get(`/api/chat/messages/${conversationId}`)
      setMessages(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to load messages:', error)
      return []
    }
  }

  const sendMessage = (receiverId, content, conversationId = null) => {
    if (!socket) {
      console.error('Socket not connected')
      return
    }

    console.log('=== SENDING MESSAGE ===')
    console.log('Receiver ID:', receiverId)
    console.log('Content:', content)
    console.log('Conversation ID:', conversationId)
    console.log('Active conversation:', activeConversation)
    console.log('Current messages count:', messages.length)
    
    socket.emit('send_message', {
      receiverId,
      content,
      conversationId,
      type: 'text'
    })
  }

  const startTyping = (receiverId, conversationId) => {
    if (!socket) return
    socket.emit('typing', { receiverId, conversationId })
  }

  const stopTyping = (receiverId, conversationId) => {
    if (!socket) return
    socket.emit('stop_typing', { receiverId, conversationId })
  }

  const selectConversation = async (conversation) => {
    setActiveConversation(conversation)
    // Only load messages if conversation exists (has an ID)
    if (conversation._id) {
      const loadedMessages = await loadMessages(conversation._id)
      
      // Mark unread messages as read
      if (socket && loadedMessages) {
        loadedMessages.forEach(msg => {
          if (msg.senderId !== user._id && msg.status !== 'read') {
            socket.emit('mark_as_read', {
              messageId: msg._id,
              senderId: msg.senderId
            })
          }
        })
      }
    } else {
      // New conversation, no messages yet
      setMessages([])
    }
  }

  const searchUsers = async (query) => {
    try {
      const response = await axios.get(`/api/users/search?q=${query}`)
      return response.data
    } catch (error) {
      console.error('Search failed:', error)
      return []
    }
  }

  const value = {
    conversations,
    activeConversation,
    messages,
    typingUsers,
    loadConversations,
    selectConversation,
    sendMessage,
    startTyping,
    stopTyping,
    searchUsers
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
