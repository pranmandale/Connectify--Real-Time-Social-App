"use client"

import { useState, useEffect, useMemo } from "react"
import { X, Search } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { createPortal } from "react-dom"
import { fetchStoryLikes } from "../featurres/like/likeSlice"

const StoryLikesModal = ({ isOpen, onClose, storyId }) => {
  const dispatch = useDispatch()
  const { profile } = useSelector((state) => state.user)
  const { storyLikedUsers = [], loading } = useSelector((state) => state.like);

  const [searchTerm, setSearchTerm] = useState("")

  // Fetch story likes when modal opens
  useEffect(() => {
    if (isOpen && storyId && profile?._id) {
      dispatch(fetchStoryLikes({ storyId, currentUserId: profile._id }))
    }
  }, [isOpen, storyId, profile?._id, dispatch])

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!storyLikedUsers || storyLikedUsers.length === 0) return []

    if (!searchTerm.trim()) return storyLikedUsers

    return storyLikedUsers.filter((user) =>
      (user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [storyLikedUsers, searchTerm])

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Likes</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center p-4 hover:bg-gray-50"
                >
                  <img
                    src={user.profilePicture || "/diverse-user-avatars.png"}
                    alt={user.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{user.userName}</p>
                    {user.name && (
                      <p className="text-sm text-gray-500">{user.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium mb-1">No likes yet</p>
              <p className="text-sm text-center">
                {searchTerm
                  ? "No users found matching your search."
                  : "Be the first to like this story!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default StoryLikesModal
