"use client"

import { Search, MessageCircle } from "lucide-react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import dp from "../../assets/s1.png"
import OtherUser from "../common/OtherUser"
import profileImage from "../../assets/profileImage.jpg"

const RightPart = () => {
  const navigate = useNavigate()
  const { profile, suggestedUsers } = useSelector((state) => state.user)
  // console.log(suggestedUsers)

  return (
    <div className="w-[25%] hidden lg:flex xl:w-[25%] 2xl:w-[20%] flex-col h-screen bg-white/80 backdrop-blur-sm p-6 border-l border-gray-200/50">
      {/* Suggested Users Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-800 text-lg font-semibold">Suggested for you</h2>
        <button className="text-sm text-purple-600 hover:text-purple-800 transition-colors font-medium">
          See All
        </button>
      </div>

      {/* Suggested Users List */}
      <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
        {suggestedUsers?.length > 0 ? (
          suggestedUsers.slice(0, 8).map((user) => (
            <div key={user._id} className="transform hover:scale-105 transition-transform duration-200">
              <OtherUser user={user} />
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No suggestions available</p>
            <p className="text-gray-400 text-xs mt-2">Follow more people to see suggestions</p>
          </div>
        )}
      </div>

      {/* Your Account Section */}
      <div className="mt-auto pt-6 border-t border-gray-200/70">
        {/* Account Label */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500 text-sm font-medium">Your Account</span>
          <button 
            onClick={() => navigate('/settings')}
            className="text-xs text-purple-600 hover:text-purple-800 transition-colors"
          >
            Settings
          </button>
        </div>

        {/* Enhanced Account Info Card */}
        <div 
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300 border border-purple-100/50 group"
          onClick={() => navigate(`/profile/${profile?.userName}`)}
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={profile?.profilePicture || profileImage}
                alt="Profile"
                loading="lazy"
                className="w-14 h-14 rounded-full border-3 border-white shadow-lg object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-800 font-bold text-lg truncate group-hover:text-purple-600 transition-colors">
                {profile?.userName}
              </h3>
              <p className="text-gray-500 text-sm truncate">{profile?.email}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                <span>{profile?.followers?.length || 0} followers</span>
                <span>{profile?.following?.length || 0} following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default RightPart;