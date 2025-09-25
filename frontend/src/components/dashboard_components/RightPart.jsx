"use client"

import { Search, MessageCircle } from "lucide-react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import dp from "../../assets/s1.png"
import OtherUser from "../common/OtherUser"

const RightPart = () => {
  const navigate = useNavigate()
  const { profile, suggestedUsers } = useSelector((state) => state.user)



  // const suggestedUsers = [
  //   { id: 1, name: "sarah_jones", avatar: "/diverse-user-avatars.png", mutualFriends: 5 },
  //   { id: 2, name: "alex_brown", avatar: "/diverse-user-avatars.png", mutualFriends: 3 },
  //   { id: 3, name: "emma_davis", avatar: "/diverse-user-avatars.png", mutualFriends: 8 },
  // ]

  return (
    <div className="w-[25%] hidden lg:flex flex-col h-screen bg-white/80 backdrop-blur-sm p-6">
      {/* Messages Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-800 text-sm text-center font-semibold">Suggested for you</h2>
        {/* <MessageCircle className="text-gray-500 cursor-pointer hover:text-purple-600 transition-colors" size={24} /> */}
        <button className="text-sm text-gray-800 hover:text-purple-600 transition-colors">
          See All
        </button>
      </div>
      <div className="space-y-4 pt-2">
        {/* {console.log(profile?.following)} */}
        {suggestedUsers?.length > 0 ? (

          suggestedUsers.slice(0, 7).map((user) => <OtherUser key={user._id} user={user} />)
        ) : (
          <p className="text-gray-500 text-sm">No suggestions available</p>
        )}
      </div>

      {/* Your Account at the bottom */}
      <div className="mt-auto mb-6 pt-4 border-t border-gray-200">
        {/* Heading */}
        <span className="block text-gray-500 text-sm mb-2">Your Account</span>

        {/* Account Info */}
        <div className="flex items-center space-x-4">
          <img
            src={profile?.profilePicture || "/placeholder.svg"}
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

export default RightPart;