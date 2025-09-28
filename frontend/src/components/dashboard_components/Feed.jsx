"use client"
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Home,
  Search,
  PlusSquare,
  Film,
  User,
} from "lucide-react"
import StoryCard from "../common/StoryCard"
import CreateStoryModal from "../../modals/CreateStoryModal"
import CommentsModal from "../../modals/CommentsModal"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"

import { usePostSuggested } from "../../hooks/managePosts/postHook.js"
import { useFetchStory } from "../../hooks/manageStories/storyHook.js"
import { useFetchComments, useAddComment } from "../../hooks/manageComments/commentHook"
import { fetchPostLikes, toggleLikePost } from "../../featurres/like/likeSlice.js"
import { toggleFollowUser } from "../../featurres/users/userSlice.jsx"
import profileImage from "../../assets/profileImage.jpg"


const Feed = () => {
  const { profile } = useSelector((state) => state.user)
  const { hasUnread } = useSelector((state) => state.notifications)
  const { unreadUsers } = useSelector((state) => state.msgNotifications)
  const { data: suggestedPosts, isLoading: postsLoading, error: postsError } = usePostSuggested();
  // console.log(suggestedPosts)
  const { data: allStories, isLoading: storyLoading, error: storyError } = useFetchStory()

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false)
  
  // Navigation state for mobile bottom nav
  const location = useLocation()
  const navigate = useNavigate()
  const [activeItem, setActiveItem] = useState("/dashboard")

  // Update active item based on current location
  useEffect(() => {
    setActiveItem(location.pathname)
  }, [location.pathname])

  const handleNavigation = (path) => {
    setActiveItem(path)
    navigate(path)
  }

  const isActive = (path) => activeItem === path

  // Navigation items for mobile bottom nav
  const navigationItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/create", icon: PlusSquare, label: "Create" },
    { path: "/reels", icon: Film, label: "Reels" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/notifications", icon: Heart, label: "Notifications" },
    { path: `/profile/${profile?.userName}`, icon: User, label: "Profile" },
  ]

  return (
    <div className="flex-1 bg-white/80 backdrop-blur-sm min-h-screen lg:h-screen relative lg:overflow-y-auto scrollbar-hide">
      {/* Add padding for mobile navigation */}
      <div className="pb-20 lg:pb-0">
        {/* Stories */}
        <div className="p-4">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            <StoryCard
              key="own"
              profileImage={profile?.profilePicture || profileImage}
              userName="Your Story"
              isOwn
              stories={profile?.stories || []}
              onCreate={() => setIsStoryModalOpen(true)}
            />

            {storyLoading && <p className="text-gray-500">Loading stories...</p>}
            {storyError && <p className="text-red-500">{storyError}</p>}

            {allStories
              ?.filter(story => story.author?._id !== profile?._id)
              .map(story => (
                <StoryCard
                  key={story._id}
                  profileImage={story.author?.profilePicture || "/diverse-user-avatars.png"}
                  userName={story.author?.userName}
                  stories={[story]}
                />
              ))}
          </div>
        </div>

        {/* Posts */}
        <div className="pb-4">
          {postsLoading && <p className="text-center text-gray-500 py-10">Loading posts...</p>}
          {postsError && <p className="text-center text-red-500 py-10">{postsError}</p>}
          {!postsLoading && !postsError && suggestedPosts?.length === 0 && (
            <p className="text-center text-gray-500 py-10">No posts available</p>
          )}

          {suggestedPosts?.map(post => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={profile?._id}
            />
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only visible on smaller screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around p-3 max-w-md mx-auto">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActiveItem = isActive(item.path) || (item.path.includes("/profile/") && activeItem.includes("/profile/"))

            return (
              <div
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all duration-200 relative ${
                  isActiveItem
                    ? 'text-purple-600 transform scale-110'
                    : 'text-gray-600 hover:text-purple-600 active:scale-95'
                }`}
              >
                <div className="relative">
                  <Icon size={22} className="transition-transform duration-200" />
                  
                  {/* Mobile Notifications Badge */}
                  {item.label === "Notifications" && hasUnread && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}

                  {/* Mobile Messages Badge */}
                  {item.label === "Messages" && unreadUsers?.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {unreadUsers.length > 9 ? '9+' : unreadUsers.length}
                    </span>
                  )}
                  
                  {/* Active indicator dot */}
                  {isActiveItem && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></div>
                  )}
                </div>
                <span className="text-xs font-medium mt-1 hidden sm:block">{item.label}</span>
              </div>
            )
          })}

          {/* Profile in mobile bottom nav */}
          <div
            onClick={() => handleNavigation(`/profile/${profile?.userName}`)}
            className={`flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all duration-200 relative ${
              (isActive(`/profile/${profile?.userName}`) || activeItem.includes("/profile/"))
                ? 'text-purple-600 transform scale-110'
                : 'text-gray-600 hover:text-purple-600 active:scale-95'
            }`}
          >
            <div className="relative">
              <img
                src={profile?.profilePicture || "/placeholder.svg"}
                alt="Profile"
                loading="lazy"
                className="w-6 h-6 rounded-full border-2 border-current"
              />
              {(isActive(`/profile/${profile?.userName}`) || activeItem.includes("/profile/")) && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></div>
              )}
            </div>
            <span className="text-xs font-medium mt-1 hidden sm:block">Profile</span>
          </div>
        </div>
      </div>

      <CreateStoryModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} />
    </div>
  )
}

const PostCard = ({ post, currentUserId }) => {
  const [mediaIndex, setMediaIndex] = useState(0)
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const mediaArray = Array.isArray(post.mediaUrl) ? post.mediaUrl : [post.mediaUrl].filter(Boolean)
  const [postLikes, setPostLikes] = useState({
    likedByUser: false,
    likeCount: post.likes?.length || 0,
  })
  const [newComment, setNewComment] = useState("")
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)

   const { profile } = useSelector((state) => state.user)
  // console.log(post.author);
  // const isFollowing = profile?.following?.some(id => id.toString() === post.author?._id?.toString())
  const isFollowing = profile?.following?.some(
    f => (f._id || f).toString() === post.author?._id?.toString()
  )
  
  

 

  // Comments hooks
  const { data: commentsData, isLoading: commentsLoading, error: commentsError } = useFetchComments("Post", post._id)
  const addCommentMutation = useAddComment()
  const postCommentsData = commentsData || { comments: [], commentCount: 0 }

  // Media handlers
  const handlePrev = () => setMediaIndex(prev => (prev === 0 ? mediaArray.length - 1 : prev - 1))
  const handleNext = () => setMediaIndex(prev => (prev === mediaArray.length - 1 ? 0 : prev + 1))
  const currentMedia = mediaArray[mediaIndex]

  // Comment submit handler
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !profile) return

    await addCommentMutation.mutateAsync({
      contentType: "Post",
      contentId: post._id,
      content: newComment.trim(),
    })
    setNewComment("")
  }

  // Modal handlers
  const openComments = () => setIsCommentsOpen(true)
  const closeComments = () => setIsCommentsOpen(false)

  useEffect(() => {
    if (post._id && currentUserId) {
      dispatch(fetchPostLikes({ postId: post._id, currentUserId })).then((res) => {
        if (res.payload) {
          setPostLikes({
            likedByUser: res.payload.users.some((user) => user._id === currentUserId),
            likeCount: res.payload.totalLikes || 0,
          })
        }
      })
    }
  }, [dispatch, post._id, currentUserId])

    const handleToggleLike = () => {
    dispatch(toggleLikePost(post._id)).then(() => {
      setPostLikes((prev) => ({
        likedByUser: !prev.likedByUser,
        likeCount: prev.likedByUser ? prev.likeCount - 1 : prev.likeCount + 1,
      }))
    })
  }

  const handleFollowToggle = () => {
    dispatch(toggleFollowUser(post.author._id))
  }

  return (
    <div className="border-b border-gray-200 mb-4 mx-auto max-w-lg lg:max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author?.profilePicture || profileImage}
            alt={post.author?.userName || "User"}
            loading="lazy"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p 
            onClick={() => navigate(`/profile/${post.author?.userName}`)}
            className="text-gray-800 font-medium cursor-pointer">{post.author?.userName || "Unknown"}</p>
            <p className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {post.author?._id !== profile?._id && (
            <button
              onClick={handleFollowToggle}
              className="text-sm font-medium transition-colors text-purple-600 hover:text-purple-700 cursor-pointer"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
          <MoreHorizontal className="text-gray-600 cursor-pointer hover:text-gray-800" size={20} />
        </div>
      </div>

      {/* Media - Responsive sizing */}
      <div className="relative w-full flex justify-center">
        <div className="w-full max-w-md lg:max-w-lg aspect-square relative flex items-center justify-center overflow-hidden rounded-lg">
          {post.mediaType === "video" ? (
            <video 
              src={currentMedia} 
              controls 
              className="w-full h-full object-contain"
              playsInline
            />
          ) : (
            <img 
              src={currentMedia} 
              alt="Post" 
              className="w-full h-full object-contain"
              loading="lazy"
            />
          )}
          {mediaArray.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Previous media"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Next media"
              >
                <ChevronRight size={20} />
              </button>
              {/* Media indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {mediaArray.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === mediaIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Heart
              size={24}
              className={`cursor-pointer transition-all duration-200 ${
                postLikes.likedByUser 
                  ? "text-red-500 fill-red-500 scale-110" 
                  : "text-gray-700 hover:text-red-400 hover:scale-110"
              }`}
              onClick={handleToggleLike}
            />
            <MessageCircle
              onClick={openComments}
              className="text-gray-700 cursor-pointer hover:text-purple-600 hover:scale-110 transition-all duration-200"
              size={24}
            />
            <Send 
              className="text-gray-700 cursor-pointer hover:text-blue-600 hover:scale-110 transition-all duration-200" 
              size={24} 
            />
          </div>
          <Bookmark 
            className="text-gray-700 cursor-pointer hover:text-yellow-600 hover:scale-110 transition-all duration-200" 
            size={24} 
          />
        </div>

        <p className="text-gray-800 font-medium mb-2">
          {postLikes.likeCount || 0} {postLikes.likeCount === 1 ? 'like' : 'likes'}
        </p>
        
        {post.caption && (
          <div className="text-gray-800 mb-2">
            <span className="font-semibold">{post.author?.userName}</span>
            <span className="ml-2">{post.caption}</span>
          </div>
        )}

        {postCommentsData.commentCount > 0 && (
          <button
            onClick={openComments}
            className="text-gray-500 text-sm mt-2 hover:text-gray-700 cursor-pointer transition-colors"
          >
            View all {postCommentsData.commentCount} comments
          </button>
        )}

        {/* Add comment - Responsive layout */}
        <div className="flex items-center mt-3 pt-3 border-t border-gray-200">
          <form onSubmit={handleCommentSubmit} className="flex items-center w-full space-x-3">
            <img
              src={profile?.profilePicture || "/placeholder.svg"}
              alt="Your profile"
              loading="lazy"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 outline-none text-sm"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            {newComment.trim() && (
              <button
                type="submit"
                className="text-purple-600 font-medium hover:text-purple-700 transition-colors flex-shrink-0"
                disabled={addCommentMutation.isLoading}
              >
                {addCommentMutation.isLoading ? "..." : "Post"}
              </button>
            )}
          </form>
        </div>
      </div>

      <CommentsModal
        isOpen={isCommentsOpen}
        onClose={closeComments}
        postId={post._id}
        postOwner={post.author}
      />
    </div>
  )
}

export default Feed