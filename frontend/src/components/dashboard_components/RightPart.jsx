"use client"

import { Search, MessageCircle } from "lucide-react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import dp from "../../assets/s1.png"

const RightPart = () => {
  const navigate = useNavigate()
  const { profile } = useSelector((state) => state.user)

  const conversations = [
    {
      id: 1,
      name: "john_doe",
      avatar: "/diverse-user-avatars.png",
      lastMessage: "Hey! How are you doing?",
      time: "2m",
      isOnline: true,
      unread: 2,
    },
    {
      id: 2,
      name: "jane_smith",
      avatar: "/diverse-user-avatars.png",
      lastMessage: "Thanks for the photo!",
      time: "1h",
      isOnline: false,
      unread: 0,
    },
    {
      id: 3,
      name: "mike_wilson",
      avatar: "/diverse-user-avatars.png",
      lastMessage: "See you tomorrow 👋",
      time: "3h",
      isOnline: true,
      unread: 0,
    },
  ]

  const suggestedUsers = [
    { id: 1, name: "sarah_jones", avatar: "/diverse-user-avatars.png", mutualFriends: 5 },
    { id: 2, name: "alex_brown", avatar: "/diverse-user-avatars.png", mutualFriends: 3 },
    { id: 3, name: "emma_davis", avatar: "/diverse-user-avatars.png", mutualFriends: 8 },
  ]

  return (
    <div className="w-[25%] hidden lg:flex flex-col h-screen bg-white/80 backdrop-blur-sm p-6">
      {/* Messages Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-800 text-xl font-semibold">Messages</h2>
        <MessageCircle className="text-gray-500 cursor-pointer hover:text-purple-600 transition-colors" size={24} />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search messages..."
          className="w-full bg-gray-100 text-gray-800 placeholder-gray-500 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
        />
      </div>

      {/* Messages List with fixed height */}
      <div className="flex-1 overflow-y-auto mb-4 scrollbar-hide">
        <h3 className="text-gray-600 font-medium mb-2">Recent</h3>
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <img
                  src={conversation.avatar || "/placeholder.svg"}
                  alt={conversation.name}
                  className="w-12 h-12 rounded-full"
                />
                {conversation.isOnline && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-gray-800 font-medium truncate">{conversation.name}</p>
                  <span className="text-gray-500 text-xs">{conversation.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm truncate">{conversation.lastMessage}</p>
                  {conversation.unread > 0 && (
                    <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Account at the bottom */}
      <div className="mt-auto mb-6 pt-4 border-t border-gray-200">
        {/* Heading */}
        <span className="block text-gray-500 text-sm mb-2">Your Account</span>

        {/* Account Info */}
        <div className="flex items-center space-x-4">
          <img
            src={dp || "/placeholder.svg"}
            alt="Profile"
            className="w-14 h-14 rounded-full border-2 border-purple-200"
          />
          <div>
            <h3
              className="text-gray-800 font-semibold text-2xl cursor-pointer hover:text-purple-600 transition-colors"
              onClick={() => navigate(`/profile/${profile?.userName}`)}
            >
              {profile?.userName}
            </h3>
            <p className="text-gray-500 text-md">{profile?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RightPart
