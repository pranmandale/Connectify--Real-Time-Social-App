"use client"

import { useState, useEffect } from "react"
import { X, Search } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { toggleFollowUser } from "../featurres/users/userSlice.jsx"
import { getFollowers, getFollowing } from "../featurres/follows/followSlice.jsx"
import { useNavigate } from "react-router-dom"

const FollowModal = ({ isOpen, onClose, userId, userName, type = "followers", list }) => {

  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const { profile } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const { followersList, followingList, error } = useSelector(state => state.follow);

  // console.log(followersList)
  const navigate = useNavigate()

  // Mock data - replace with actual API calls
  const mockFollowers = [
    {
      _id: "1",
      userName: "alice_wonder",
      name: "Alice Wonder",
      profilePicture: "/diverse-user-avatars.png",
      isFollowing: true,
    },
    {
      _id: "2",
      userName: "bob_builder",
      name: "Bob Builder",
      profilePicture: "/diverse-profile-avatars.png",
      isFollowing: false,
    },
    {
      _id: "3",
      userName: "charlie_brown",
      name: "Charlie Brown",
      profilePicture: "/diverse-user-avatars.png",
      isFollowing: true,
    },
  ]

  const mockFollowing = [
    {
      _id: "4",
      userName: "diana_prince",
      name: "Diana Prince",
      profilePicture: "/diverse-user-avatars.png",
      isFollowing: true,
    },
    {
      _id: "5",
      userName: "edward_stark",
      name: "Edward Stark",
      profilePicture: "/diverse-profile-avatars.png",
      isFollowing: true,
    },
  ]

  // onClick={() => navigate(`/profile/${user?.userName}`)}
  useEffect(() => {
    if (isOpen) {
      if (type === "followers") {
        dispatch(getFollowers(userId));
      } else {
        dispatch(getFollowing(userId));
      }
    } else {
      dispatch(clearFollowData());
    }
  }, [isOpen, type, userId, dispatch]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setTimeout(() => {
        setUsers(type === "followers" ? followersList : followingList);
        setLoading(false)
      }, 500)
    }
  }, [isOpen, userId, type])

  const filteredUsers = users.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleFollowToggle = (targetUserId) => {
    if (!profile) {
      alert("Please log in to follow users")
      return
    }
    dispatch(toggleFollowUser(targetUserId))
  }

  const isFollowing = (targetUserId) => {
    return profile?.following?.includes(targetUserId) || false
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{type === "followers" ? "Followers" : "Following"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading {type}...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="p-4 space-y-3">
              {filteredUsers.map((user) => (

                <div key={user._id} className="flex items-center justify-between">
                  {console.log("user", user?.userName)}
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePicture || "/diverse-user-avatars.png"}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-800 cursor-pointer"
                        onClick={() => {
                          navigate(`/profile/${user?.userName}`)
                          onClose()
                        }}

                      >{user.userName}</p>
                      <p className="text-sm text-gray-600 cursor-pointer"
                        onClick={() => {
                          navigate(`/profile/${user?.userName}`)
                          onClose()
                        }}
                      >{user.name}</p>
                    </div>
                  </div>

                  {profile && user._id !== profile._id && (
                    <button
                      onClick={() => handleFollowToggle(user._id)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${isFollowing(user._id)
                          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          : "bg-purple-500 text-white hover:bg-purple-600"
                        }`}
                    >
                      {isFollowing(user._id) ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">{searchTerm ? `No ${type} found` : `No ${type} yet`}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FollowModal
