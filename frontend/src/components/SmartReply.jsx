import { useState, useEffect } from 'react'
import { getSmartReplies } from '../services/aiSmartReply'

const SmartReply = ({ messages, currentUserId, onSelectReply }) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateSuggestions()
  }, [messages])

  const generateSuggestions = async () => {
    if (!messages || messages.length === 0) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const replies = await getSmartReplies(messages, currentUserId)
      setSuggestions(replies)
    } catch (error) {
      console.error('Error generating smart replies:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectReply = (reply) => {
    onSelectReply(reply)
    // Optionally clear suggestions after selection
    // setSuggestions([])
  }

  if (!suggestions || suggestions.length === 0) {
    return null
  }

  return (
    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center space-x-2 mb-2">
        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-xs font-medium text-gray-600">Smart Replies</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {loading ? (
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span className="text-xs">Generating...</span>
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelectReply(suggestion)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors duration-200 shadow-sm"
            >
              {suggestion}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default SmartReply
