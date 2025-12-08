import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

const MessageReactions = ({ message, onReact, socket }) => {
  const { user } = useAuth()
  const [showPicker, setShowPicker] = useState(false)

  // Get reaction counts
  const reactionCounts = {}
  const userReactions = new Set()

  if (message.reactions) {
    message.reactions.forEach(reaction => {
      reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] || 0) + 1
      if (reaction.userId === user._id) {
        userReactions.add(reaction.emoji)
      }
    })
  }

  const handleReact = (emoji) => {
    onReact(message._id, emoji)
    setShowPicker(false)
  }

  return (
    <div className="relative inline-flex items-center gap-1 mt-1">
      {/* Existing reactions */}
      {Object.entries(reactionCounts).map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => handleReact(emoji)}
          className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
            transition-all duration-200
            ${userReactions.has(emoji)
              ? 'bg-purple-100 dark:bg-purple-900 border-2 border-purple-500'
              : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
        >
          <span>{emoji}</span>
          <span className="font-medium">{count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Add reaction"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Emoji picker */}
        {showPicker && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowPicker(false)}
            />
            <div className="absolute bottom-full left-0 mb-2 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex gap-1">
              {EMOJI_REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MessageReactions
