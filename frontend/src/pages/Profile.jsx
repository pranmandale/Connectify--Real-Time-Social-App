
"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Grid,
  Settings,
  Bookmark,
  Tag,
  Heart,
  MessageCircle,
  CheckCircle,
  Plus,
} from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import {
  getProfileByParams,
  clearProfileByParams,
  toggleFollowUser,
} from "../featurres/users/userSlice.jsx"
import { getAllPostsOfUser } from "../featurres/post/postSlice.jsx"
import {
  toggleLikePost,
  fetchPostLikes,
} from "../featurres/like/likeSlice.js"
import OpenPostModal from "../modals/OpenPostModal"
import UploadPostModal from "../modals/UploadPostModal"
import { toast } from "react-hot-toast"
import FollowModal from "../modals/FollowModal.jsx"
import profileImage from "../assets/profileImage.jpg"

//
// 🔹 GridPost Component (extracts like/unlike + hover overlay)
//
const GridPost = ({ post, currentUserId, onClick }) => {
  const dispatch = useDispatch()
  const [likes, setLikes] = useState({
    likedByUser: false,
    likeCount: post.likes?.length || 0,
  })

  useEffect(() => {
    if (post._id && currentUserId) {
      dispatch(fetchPostLikes({ postId: post._id, currentUserId })).then(
        (res) => {
          if (res.payload) {
            setLikes({
              likedByUser: res.payload.users.some(
                (u) => u._id === currentUserId
              ),
              likeCount: res.payload.totalLikes || 0,
            })
          }
        }
      )
    }
  }, [dispatch, post._id, currentUserId])

  const handleToggleLike = (e) => {
    e.stopPropagation()
    dispatch(toggleLikePost(post._id)).then(() => {
      setLikes((prev) => ({
        likedByUser: !prev.likedByUser,
        likeCount: prev.likedByUser
          ? prev.likeCount - 1
          : prev.likeCount + 1,
      }))
    })
  }

  const mediaSrc = post.mediaUrl?.[0] || post.image || null

  return (
    <div
      className="relative aspect-square group cursor-pointer"
      onClick={onClick}
    >
      {post.mediaType === "video" ? (
        <video
          src={mediaSrc || undefined}
          className="w-full h-full object-cover rounded-lg"
          muted
          loop
          playsInline
        />
      ) : (
        <img
          src={mediaSrc || null}
          alt={post.caption || "Post"}
          loading="lazy"
          className="w-full h-full object-cover rounded-lg"
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center gap-1">
            <Heart
              size={20}
              onClick={handleToggleLike}
              className={`cursor-pointer transition-colors ${likes.likedByUser
                ? "text-red-500 fill-red-500"
                : "text-white"
                }`}
            />
            <span className="font-medium">{likes.likeCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-5 h-5 fill-current" />
            <span className="font-medium">{post.comments?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Indicators */}
      {post.mediaType === "video" && (
        <div className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-md">
          🎥
        </div>
      )}
      {post.mediaUrl?.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded-md">
          📷 {post.mediaUrl.length}
        </div>
      )}
    </div>
  )
}
//
// 🔹 Main Profile Component
//
const Profile = () => {
  const { userName } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("posts")
  const [selectedPost, setSelectedPost] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [openFollowersModal, setOpenFollowersModal] = useState(false);
  const [followModalType, setFollowModalType] = useState("followers");
  const [list, setList] = useState([]);


  const isOpen = () => {
    setOpenFollowersModal(true);
  }

  const { profileByParams, loading, error, profile } = useSelector(
    (state) => state.user
  )

  // console.log(profile.followers)

  const { posts } = useSelector((state) => state.post)

  

  // for fetching followes and following users
  const { followersList, followingList } = useSelector(state => state.follow);

  // for toggling from follow to following



  useEffect(() => {
    if (userName) {
      dispatch(getProfileByParams(userName))
    }
    return () => {
      dispatch(clearProfileByParams())
    }
  }, [userName, dispatch])

  useEffect(() => {
    if (profileByParams?.userName === profile?.userName) {
      dispatch(getAllPostsOfUser())
    }
  }, [profileByParams, profile, dispatch])

  const defaultUser = {
    name: "John Doe",
    userName: "john_doe_official",
    email: "john@example.com",
    bio: "📸 Photography enthusiast\n🌍 Travel lover | 🍕 Foodie",
    profilePicture: "/diverse-user-avatars.png",
    followers: [],
    following: [],
    posts: [],
    stories: [],
    savedPosts: [],
    reels: [],
    isVerified: false,
  }

  const profileData = profileByParams || defaultUser


  const isFollowing =
    profile?.following?.some(
      (f) => (f._id || f).toString() === profileData?._id?.toString()
    );

  const handleFollowToggle = () => {
    // Dispatch async toggle; Redux will update the profile.following globally
    dispatch(toggleFollowUser(profileData._id));
  };


  const displayPosts =
    profileByParams?.userName === profile?.userName
      ? posts
      : profileData.posts

  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const isOwnProfile =
    profile && profileData && profile.userName === profileData.userName

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
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
                  src={profileData.profilePicture || profileImage}
                  alt="Profile"
                  loading="lazy"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-800">
                    {profileData.userName}
                  </h1>
                  {profileData.isVerified && (
                    <CheckCircle className="w-6 h-6 text-blue-500 fill-current" />
                  )}
                </div>
                <div className="flex gap-3">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={() => navigate("/editProfile")}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        New Post
                      </button>
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Settings className="w-5 h-5 text-gray-600" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleFollowToggle}
                      className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition ${isFollowing
                          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                        }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-8 mb-4">
                <div className="text-center">
                  <div className="font-semibold text-gray-800">
                    {formatCount(displayPosts?.length || 0)}
                  </div>
                  <div className="text-sm text-gray-600">posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-800">
                    {formatCount(profileData.followers?.length || 0)}
                  </div>
                  <div
                    className="text-sm text-gray-600 cursor-pointer hover:text-gray-700"
                    onClick={() => {
                      setFollowModalType("followers")
                      setList(followersList)
                      setOpenFollowersModal(true)
                    }}
                  >followers</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-800">
                    {formatCount(profileData.following?.length || 0)}
                  </div>
                  <div
                    className="text-sm text-gray-600 cursor-pointer hover:text-gray-700"
                    onClick={() => {
                      setFollowModalType("following")
                      setList(followingList)
                      setOpenFollowersModal(true)
                    }}
                  >following</div>
                </div>
              </div>

              {/* Bio */}
              <div className="text-gray-700">
                <div className="font-medium mb-1">{profileData.name}</div>
                <div className="text-sm whitespace-pre-line">
                  {profileData.bio}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 rounded-t-2xl shadow-lg border border-white/20 border-b-0">
          <div className="flex">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${activeTab === "posts"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Grid className="w-4 h-4" />
              POSTS
            </button>
            {isOwnProfile && (
              <>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${activeTab === "saved"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  <Bookmark className="w-4 h-4" />
                  SAVED
                </button>
                <button
                  onClick={() => setActiveTab("tagged")}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${activeTab === "tagged"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  <Tag className="w-4 h-4" />
                  TAGGED
                </button>
              </>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="bg-white/80 rounded-b-2xl shadow-lg border border-white/20 border-t-0">
          {activeTab === "posts" && (
            <div className="grid grid-cols-3 gap-1 p-1">
              {displayPosts && displayPosts.length > 0 ? (
                displayPosts.map((post) => (
                  <GridPost
                    key={post._id || post.id}
                    post={post}
                    currentUserId={profile?._id}
                    onClick={() => setSelectedPost(post)}
                  />
                ))
              ) : (
                <div className="col-span-3 p-12 text-center">
                  <Grid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-500">
                    Share your first post to get started
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium"
                    >
                      Upload Your First Post
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {isOwnProfile && activeTab === "saved" && (
            <div className="grid grid-cols-3 gap-1 p-1">
              {profileData.savedPosts && profileData.savedPosts.length > 0 ? (
                profileData.savedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="relative aspect-square group cursor-pointer"
                  >
                    <img
                      src={post.image || null}
                      alt={`Saved Post ${post.id}`}
                      loading="lazy"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-12 text-center">
                  <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    No saved posts yet
                  </h3>
                  <p className="text-gray-500">
                    Save posts you want to see again
                  </p>
                </div>
              )}
            </div>
          )}

          {isOwnProfile && activeTab === "tagged" && (
            <div className="p-12 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No tagged posts
              </h3>
              <p className="text-gray-500">
                Posts you're tagged in will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <OpenPostModal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
        isOwnProfile={isOwnProfile}
        profileData={profileData}
      />

      <UploadPostModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      <FollowModal
        isOpen={openFollowersModal}
        onClose={() => setOpenFollowersModal(false)}
        userId={profileData._id}   // 👈 pass correct profile id
        userName={profileData.userName}
        type={followModalType}  // 👈 tells modal followers or following
        list={list}     // gives modal to list of followers and following
      />
    </div>
  )
}

export default Profile
