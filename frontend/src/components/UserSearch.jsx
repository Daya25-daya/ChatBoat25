import { useState } from 'react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'

const UserSearch = ({ onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const { searchUsers, selectConversation } = useChat()
  const { user } = useAuth()

  const handleSearch = async (e) => {
    const value = e.target.value
    setQuery(value)

    if (value.trim().length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    const users = await searchUsers(value)
    setResults(users)
    setLoading(false)
  }

  const handleSelectUser = async (selectedUser) => {
    // Create a proper conversation object with both participants
    const conversation = {
      _id: null, // Will be created when first message is sent
      participants: [user._id, selectedUser.userId],
      type: 'direct',
      otherUser: selectedUser // Store the other user's info
    }
    
    selectConversation(conversation)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Search Users</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search by username..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          autoFocus
        />

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {query.length >= 2 ? 'No users found' : 'Type to search users'}
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((user) => (
                <div
                  key={user.userId}
                  onClick={() => handleSelectUser(user)}
                  className="flex items-center p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-800">
                      {user.username}
                    </h3>
                    {user.displayName && (
                      <p className="text-sm text-gray-600">{user.displayName}</p>
                    )}
                  </div>
                  <div className="ml-auto">
                    <span
                      className={`w-3 h-3 rounded-full inline-block ${
                        user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    ></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserSearch
