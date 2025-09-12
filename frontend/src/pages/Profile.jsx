"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Grid, Settings, Bookmark, Tag, Heart, MessageCircle, CheckCircle } from "lucide-react"
import { getProfileByParams, clearProfileByParams } from "../featurres/users/userSlice.jsx"
import { useSelector, useDispatch } from "react-redux"

const Profile = () => {
  const { userName } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts")


  const { profileByParams, loading, error } = useSelector((state) => state.user)
  const {profile} = useSelector(state => state.user);

  console.log("loggedin users profile",profile)

  

  useEffect(() => {
    if (userName) {
      dispatch(getProfileByParams(userName))
    }
    return () => {
      dispatch(clearProfileByParams()) 
    }
  }, [userName, dispatch])

  const defaultUser = {
    name: "John Doe",
    userName: "john_doe_official",
    email: "john@example.com",
    bio: "📸 Photography enthusiast\n🌍 Travel lover | 🍕 Foodie\n✨ Living life one adventure at a time\n📧 contact@johndoe.com",
    profilePicture: "/diverse-user-avatars.png",
    followers: [1, 2, 3], // Mock array for count
    following: [1, 2, 3], // Mock array for count
    posts: [
      { id: 1, image: "/social-media-post.png", likes: 234, comments: 12 },
      { id: 2, image: "/vibrant-pasta-dish.png", likes: 189, comments: 8 },
      { id: 3, image: "/social-media-post.png", likes: 456, comments: 23 },
      { id: 4, image: "/vibrant-pasta-dish.png", likes: 321, comments: 15 },
      { id: 5, image: "/social-media-post.png", likes: 567, comments: 34 },
      { id: 6, image: "/vibrant-pasta-dish.png", likes: 432, comments: 19 },
    ],
    stories: [
      { id: 1, title: "Travel", image: "/diverse-user-avatars.png" },
      { id: 2, title: "Food", image: "/diverse-profile-avatars.png" },
      { id: 3, title: "Work", image: "/diverse-user-avatars.png" },
      { id: 4, title: "Friends", image: "/diverse-profile-avatars.png" },
    ],
    savedPosts: [],
    reels: [],
    isVerified: false,
    location: "",
    website: "",
  }

  const profileData = profileByParams || defaultUser;
  // console.log("profiledata ",profileData);

  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <p className="text-center py-10 text-gray-600">Loading profile...</p>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <p className="text-center text-red-500 py-10">{error}</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-6 shadow-lg border border-white/20">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 p-1">
                <img
                  src={profileData.profilePicture || "/diverse-user-avatars.png"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-800">{profileData.userName}</h1>
                  {profileData.isVerified && <CheckCircle className="w-6 h-6 text-blue-500 fill-current" />}
                </div>
                {profileByParams.userName === profile.userName ? (
                <div className="flex gap-3">
                  <button 
                  onClick={() => navigate('/editProfile')}
                  className="px-2 py-2 cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                    Edit Profile
                  </button>
                
                </div>
                ) : 
                <div className="flex gap-3">
                  <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                    Follow
                  </button>
                  
                </div>
                }
                
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-8 mb-4">
                <div className="text-center">
                  <div className="font-semibold text-gray-800">{formatCount(profileData.posts?.length || 0)}</div>
                  <div className="text-sm text-gray-600">posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-800">{formatCount(profileData.followers?.length || 0)}</div>
                  <div className="text-sm text-gray-600">followers</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-800">{formatCount(profileData.following?.length || 0)}</div>
                  <div className="text-sm text-gray-600">following</div>
                </div>
              </div>

              {/* Bio */}
              <div className="text-gray-700">
                <div className="font-medium mb-1">{profileData.name}</div>
                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {profileData.bio || "No bio available"}
                </div>
                {profileData.location && <div className="text-sm text-gray-600 mt-1">📍 {profileData.location}</div>}
                {profileData.website && (
                  <div className="text-sm text-blue-600 mt-1">
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      🔗 {profileData.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Story Highlights */}
        {profileData.stories && profileData.stories.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/20">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {profileData.stories.map((story) => (
                <div key={story.id} className="flex flex-col items-center min-w-[80px]">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-0.5 mb-2">
                    <img
                      src={story.image || "/placeholder.svg"}
                      alt={story.title}
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                  </div>
                  <span className="text-xs text-gray-600 text-center">{story.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-t-2xl shadow-lg border border-white/20 border-b-0">
          <div className="flex">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                activeTab === "posts"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Grid className="w-4 h-4" />
              POSTS
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                activeTab === "saved"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              SAVED
            </button>
            <button
              onClick={() => setActiveTab("tagged")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                activeTab === "tagged"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Tag className="w-4 h-4" />
              TAGGED
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-b-2xl shadow-lg border border-white/20 border-t-0">
          {activeTab === "posts" && (
            <div className="grid grid-cols-3 gap-1 p-1">
              {profileData.posts && profileData.posts.length > 0 ? (
                profileData.posts.map((post) => (
                  <div key={post.id} className="relative aspect-square group cursor-pointer">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={`Post ${post.id}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <div className="flex items-center gap-4 text-white">
                        <div className="flex items-center gap-1">
                          <Heart className="w-5 h-5 fill-current" />
                          <span className="font-medium">{post.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-5 h-5 fill-current" />
                          <span className="font-medium">{post.comments || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-12 text-center">
                  <Grid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No posts yet</h3>
                  <p className="text-gray-500">Share your first post to get started</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="p-12 text-center">
              {profileData.savedPosts && profileData.savedPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {profileData.savedPosts.map((post) => (
                    <div key={post.id} className="relative aspect-square group cursor-pointer">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={`Saved Post ${post.id}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No saved posts yet</h3>
                  <p className="text-gray-500">Save posts you want to see again</p>
                </>
              )}
            </div>
          )}

          {activeTab === "tagged" && (
            <div className="p-12 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No tagged posts</h3>
              <p className="text-gray-500">Posts you're tagged in will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
