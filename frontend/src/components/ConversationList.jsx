import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'

const ConversationList = () => {
  const { conversations, activeConversation, selectConversation } = useChat()
  const { user } = useAuth()

  const getOtherParticipant = (participants) => {
    return participants.find(p => p !== user._id)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 86400000) { // Less than 24 hours
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-purple-50/50 to-white">
      <div className="p-5 border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Messages
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No conversations yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "New Chat" to start!</p>
        </div>
      ) : (
        <div className="p-2">
          {conversations.map((conversation) => {
            const isActive = activeConversation?._id === conversation._id
            const unreadCount = conversation.unreadCount?.get?.(user._id) || 0

            return (
              <div
                key={conversation._id}
                onClick={() => selectConversation(conversation)}
                className={`p-3 mb-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-102 ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 shadow-md' 
                    : 'bg-white/60 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {conversation.type === 'group' 
                        ? 'G' 
                        : (conversation.otherUser?.username?.charAt(0).toUpperCase() || 'U')}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${isActive ? 'text-purple-900' : 'text-gray-800'}`}>
                        {conversation.type === 'group'
                          ? 'Group Chat'
                          : conversation.otherUser?.username || `User ${getOtherParticipant(conversation.participants)?.substring(0, 8)}`}
                      </h3>
                      {conversation.lastMessage && (
                        <span className={`text-xs flex-shrink-0 ml-2 ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${isActive ? 'text-purple-700' : 'text-gray-600'}`}>
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                      {unreadCount > 0 && (
                        <div className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-2 shadow-md flex-shrink-0">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ConversationList
