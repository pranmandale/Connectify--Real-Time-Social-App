import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Home,
  Search,
  PlusSquare,
  Film,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import StoryCard from "../common/StoryCard"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { getSuggestedPosts } from "../../featurres/post/postSlice"

const Feed = () => {
  const dispatch = useDispatch()
  const { profile } = useSelector((state) => state.user)
  const { suggestedPosts, loading, error } = useSelector((state) => state.post)

  useEffect(() => {
    dispatch(getSuggestedPosts())
  }, [dispatch])

  // Static stories
  const stories = [
    { id: 1, name: "Your Story", avatar: profile?.profilePicture, isOwn: true },
    { id: 2, name: "john_doe", avatar: "/diverse-user-avatars.png" },
    { id: 3, name: "jane_smith", avatar: "/diverse-user-avatars.png" },
  ]

  return (
    <div className="flex-1 bg-white/80 backdrop-blur-sm min-h-screen lg:h-screen relative lg:overflow-y-auto scrollbar-hide">
      {/* Stories */}
      <div className="p-4">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              profileImage={story.avatar}
              userName={story.name}
              isOwn={story.isOwn}
            />
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="pb-20">
        {loading && (
          <p className="text-center text-gray-500 py-10">Loading posts...</p>
        )}
        {error && <p className="text-center text-red-500 py-10">{error}</p>}
        {!loading && !error && suggestedPosts?.length === 0 && (
          <p className="text-center text-gray-500 py-10">No posts available</p>
        )}

        {suggestedPosts?.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-lg">
        <div className="flex items-center justify-around">
          <Home className="text-purple-600" size={28} />
          <Search className="text-gray-500 hover:text-purple-600 transition-colors cursor-pointer" size={28} />
          <PlusSquare className="text-gray-500 hover:text-purple-600 transition-colors cursor-pointer" size={28} />
          <Heart className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer" size={28} />
          <Film className="text-gray-500 hover:text-purple-600 transition-colors cursor-pointer" size={28} />
          <User className="text-gray-500 hover:text-purple-600 transition-colors cursor-pointer" size={28} />
        </div>
      </div>
    </div>
  )
}

const PostCard = ({ post }) => {
  const [mediaIndex, setMediaIndex] = useState(0)
  const mediaArray = Array.isArray(post.mediaUrl) ? post.mediaUrl : [post.mediaUrl].filter(Boolean)

  const handlePrev = () =>
    setMediaIndex((prev) => (prev === 0 ? mediaArray.length - 1 : prev - 1))
  const handleNext = () =>
    setMediaIndex((prev) => (prev === mediaArray.length - 1 ? 0 : prev + 1))

  const currentMedia = mediaArray[mediaIndex]

  return (
    <div className="border-b border-gray-200 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.user?.profilePicture || "/placeholder.svg"}
            alt={post.user?.username || "User"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-gray-800 font-medium">{post.user?.username || "Unknown"}</p>
            <p className="text-gray-500 text-sm">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <MoreHorizontal className="text-gray-600 cursor-pointer" size={20} />
      </div>

      {/* Media */}
      {/* Media */}
      <div className="relative w-full flex justify-center">
        <div className="w-full max-w-md aspect-square relative flex items-center justify-center overflow-hidden rounded-lg">
          {post.mediaType === "video" ? (
            <video
              src={currentMedia}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={currentMedia}
              alt="Post"
              className="w-full h-full object-contain"
            />
          )}

          {/* Carousel Controls */}
          {mediaArray.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>




      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Heart className="text-gray-700 cursor-pointer hover:text-red-500 transition-colors" size={24} />
            <MessageCircle className="text-gray-700 cursor-pointer hover:text-gray-600 transition-colors" size={24} />
            <Send className="text-gray-700 cursor-pointer hover:text-gray-600 transition-colors" size={24} />
          </div>
          <Bookmark className="text-gray-700 cursor-pointer hover:text-gray-600 transition-colors" size={24} />
        </div>

        {/* Likes */}
        <p className="text-gray-800 font-medium mb-2">
          {post.likes?.length || 0} likes
        </p>

        {/* Caption */}
        <div className="text-gray-800">
          <span className="font-medium">{post.user?.username}</span>
          <span className="ml-2">{post.caption}</span>
        </div>

        {/* Comments */}
        {post.comments?.length > 0 && (
          <button className="text-gray-500 text-sm mt-2 hover:text-gray-600 transition-colors">
            View all {post.comments.length} comments
          </button>
        )}

        {/* Add Comment */}
        <div className="flex items-center mt-3 pt-3 border-t border-gray-200">
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 outline-none"
          />
          <button className="text-purple-600 font-medium ml-2 hover:text-purple-700 transition-colors">
            Post
          </button>
        </div>
      </div>
    </div>
  )
}

export default Feed
