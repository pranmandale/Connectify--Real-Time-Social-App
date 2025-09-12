"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
// import { searchUsers, clearSearchResults } from "../featurres/users/userSlice"
import { SearchIcon, User, ArrowLeft } from "lucide-react"

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // const { searchResults, searchLoading, searchError } = useSelector((state) => state.user)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // dispatch(searchUsers(searchQuery.trim()))
    }
  }

  const handleUserClick = (userName) => {
    navigate(`/profile/${userName}`)
  }

  const handleBack = () => {
    navigate(-1)
    // dispatch(clearSearchResults())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Search Users</h1>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
          </div>
        </form>

        {/* Search Results */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* {searchLoading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Searching for users...</p>
            </div>
          )} */}

          {/* {searchError && (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-2">
                <User className="w-12 h-12 mx-auto mb-2" />
              </div>
              <p className="text-red-600 font-medium">Search Error</p>
              <p className="text-gray-500 text-sm mt-1">{searchError}</p>
            </div>
          )} */}

          {/* {!searchLoading && !searchError && searchResults.length === 0 && searchQuery && (
            <div className="p-8 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-medium mb-1">No users found</p>
              <p className="text-gray-500 text-sm">Try searching with a different name or username</p>
            </div>
          )} */}

          {/* {!searchLoading && searchResults.length > 0 && (
            <div className="divide-y divide-gray-200">
              {searchResults.map((user, index) => (
                <button
                  key={user._id}
                  onClick={() => handleUserClick(user.userName)}
                  className="w-full px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-shrink-0">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture || "/placeholder.svg"}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || user.userName?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">@{user.userName}</p>
                    {user.bio && <p className="text-sm text-gray-400 truncate mt-1">{user.bio}</p>}
                    {user.location && <p className="text-xs text-gray-400 mt-1">📍 {user.location}</p>}
                  </div>
                </button>
              ))}
            </div>
          )} */}

          {/* {!searchQuery && (
            <div className="p-8 text-center">
              <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-medium mb-1">Search for Users</p>
              <p className="text-gray-500 text-sm">Enter a name or username to find people</p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  )
}

export default SearchPage
