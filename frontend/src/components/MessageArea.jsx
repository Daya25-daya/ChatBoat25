import { useState, useEffect, useRef } from 'react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import EmojiPicker from './EmojiPicker'
import FileUpload from './FileUpload'
import CallModal from './CallModal'
import SmartReply from './SmartReply'

const MessageArea = () => {
  const { activeConversation, messages, sendMessage, startTyping, stopTyping, typingUsers } = useChat()
  const { user } = useAuth()
  const { socket } = useSocket()
  const [inputMessage, setInputMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const [callType, setCallType] = useState(null)
  const [incomingCall, setIncomingCall] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Listen for incoming calls
  useEffect(() => {
    if (!socket) return

    const handleIncomingCall = (data) => {
      console.log('📞 Incoming call:', data)
      setIncomingCall(data)
      setCallType(data.callType)
      setShowCallModal(true)
    }

    socket.on('incoming_call', handleIncomingCall)

    return () => {
      socket.off('incoming_call', handleIncomingCall)
    }
  }, [socket])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startCall = (type) => {
    if (!activeConversation) return
    setCallType(type)
    setShowCallModal(true)
    setIncomingCall(null)
  }

  const closeCallModal = () => {
    setShowCallModal(false)
    setCallType(null)
    setIncomingCall(null)
  }

  const getRecipientId = () => {
    if (!activeConversation) return null
    if (activeConversation.otherUser) {
      return activeConversation.otherUser.userId
    }
    return activeConversation.participants.find(p => p !== user._id)
  }

  const getRecipientName = () => {
    if (!activeConversation) return 'Unknown'
    if (activeConversation.otherUser) {
      return activeConversation.otherUser.username
    }
    return 'User'
  }

  const handleInputChange = (e) => {
    setInputMessage(e.target.value)

    if (!activeConversation) return

    // Get receiver ID - handle both existing conversations and new ones
    let receiverId
    if (activeConversation.otherUser) {
      receiverId = activeConversation.otherUser.userId
    } else {
      receiverId = activeConversation.participants.find(p => p !== user._id)
    }

    if (!receiverId) return

    // Start typing indicator
    startTyping(receiverId, activeConversation._id)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(receiverId, activeConversation._id)
    }, 2000)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!inputMessage.trim() || !activeConversation) return

    // Get receiver ID - handle both existing conversations and new ones
    let receiverId
    if (activeConversation.otherUser) {
      // New conversation from user search
      receiverId = activeConversation.otherUser.userId
    } else {
      // Existing conversation
      receiverId = activeConversation.participants.find(p => p !== user._id)
    }

    if (!receiverId) {
      console.error('No receiver ID found')
      return
    }

    sendMessage(receiverId, inputMessage, activeConversation._id)
    setInputMessage('')
    setShowEmojiPicker(false)

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    stopTyping(receiverId, activeConversation._id)
  }

  const handleEmojiSelect = (emoji) => {
    setInputMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleFileSelect = async (file) => {
    console.log('File selected:', file)
    setShowFileUpload(false)
    
    const receiverId = activeConversation.otherUser?.userId || 
                       activeConversation.participants?.find(p => p !== user._id)
    
    if (!receiverId) return

    try {
      // Upload file to server
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      
      // Send message with file URL
      const fileMessage = {
        type: data.file.type,
        url: data.file.url,
        filename: data.file.originalName,
        size: data.file.size
      }
      
      sendMessage(receiverId, JSON.stringify(fileMessage), activeConversation._id)
    } catch (error) {
      console.error('File upload error:', error)
      alert('Failed to upload file')
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderMessageContent = (message, isOwn) => {
    try {
      const fileData = JSON.parse(message.content)
      if (fileData.url && fileData.type) {
        // It's a file message
        if (fileData.type === 'image') {
          return (
            <div className="space-y-2">
              <img 
                src={fileData.url} 
                alt={fileData.filename}
                className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(fileData.url, '_blank')}
              />
              <p className="text-xs opacity-75">{fileData.filename}</p>
            </div>
          )
        } else if (fileData.type === 'video') {
          return (
            <div className="space-y-2">
              <video 
                src={fileData.url} 
                controls
                className="rounded-lg max-w-full"
              />
              <p className="text-xs opacity-75">{fileData.filename}</p>
            </div>
          )
        } else if (fileData.type === 'audio') {
          return (
            <div className="space-y-2">
              <audio src={fileData.url} controls className="w-full" />
              <p className="text-xs opacity-75">{fileData.filename}</p>
            </div>
          )
        } else {
          // Document or other file
          return (
            <a 
              href={fileData.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center space-x-2 ${isOwn ? 'text-white' : 'text-purple-600'} hover:underline`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">{fileData.filename}</span>
            </a>
          )
        }
      }
    } catch (e) {
      // Not a file message, render as text
    }
    return <p className="break-words text-sm leading-relaxed">{message.content}</p>
  }

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center p-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl shadow-2xl mb-6 animate-bounce">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Start Chatting
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Select a conversation or start a new chat
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Your messages are end-to-end encrypted</span>
          </div>
        </div>
      </div>
    )
  }

  // Get other user's name for header
  const getOtherUserName = () => {
    if (activeConversation.otherUser) {
      return activeConversation.otherUser.username
    }
    return 'Chat'
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Unique Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Animated circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-4000"></div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Chat Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md border-b border-purple-100 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {getOtherUserName().charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{getOtherUserName()}</h3>
              <p className="text-xs text-green-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => startCall('audio')}
              className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              title="Audio call"
            >
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button
              onClick={() => startCall('video')}
              className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              title="Video call"
            >
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.senderId === user._id
            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId

            return (
              <div
                key={message._id || index}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end space-x-2`}
              >
                {!isOwn && showAvatar && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0">
                    {getOtherUserName().charAt(0).toUpperCase()}
                  </div>
                )}
                {!isOwn && !showAvatar && <div className="w-8"></div>}
                
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md transform transition-all duration-200 hover:scale-105 ${
                    isOwn
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-purple-100 rounded-bl-sm'
                  }`}
                >
                  {renderMessageContent(message, isOwn)}
                  <div className="flex items-center justify-end mt-1 space-x-1">
                    <span
                      className={`text-xs ${
                        isOwn ? 'text-purple-100' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </span>
                    {isOwn && (
                      <span className={`text-xs ${message.status === 'read' ? 'text-blue-300' : 'text-purple-100'}`}>
                        {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>

                {isOwn && showAvatar && (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                {isOwn && !showAvatar && <div className="w-8"></div>}
              </div>
            )
          })
        )}

        {/* Typing indicator */}
        {Object.keys(typingUsers).length > 0 && (
          <div className="flex justify-start items-end space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
              {getOtherUserName().charAt(0).toUpperCase()}
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-5 py-3 rounded-2xl rounded-bl-sm shadow-md border border-purple-100">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Smart Reply Suggestions */}
      {activeConversation && messages.length > 0 && (
        <SmartReply
          messages={messages}
          currentUserId={user._id}
          onSelectReply={(reply) => {
            setInputMessage(reply)
          }}
        />
      )}

      {/* Input */}
      <div className="relative z-10 border-t border-purple-100 p-4 bg-white/80 backdrop-blur-md">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowFileUpload(true)}
              className="bg-purple-100 hover:bg-purple-200 text-purple-600 p-3 rounded-full transition-colors"
              title="Attach file"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="w-full px-5 py-3 pr-12 bg-white border-2 border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {showEmojiPicker && (
              <EmojiPicker 
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>
          
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none flex items-center space-x-2"
          >
            <span className="font-medium">Send</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        
        {showFileUpload && (
          <FileUpload 
            onFileSelect={handleFileSelect}
            onClose={() => setShowFileUpload(false)}
          />
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Call Modal */}
      {showCallModal && (
        <CallModal
          isOpen={showCallModal}
          onClose={closeCallModal}
          callType={callType}
          recipientId={incomingCall ? incomingCall.callerId : getRecipientId()}
          recipientName={incomingCall ? incomingCall.callerName : getRecipientName()}
          isIncoming={!!incomingCall}
          callData={incomingCall}
        />
      )}
    </div>
  )
}

export default MessageArea
