"use client"
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import StoryCard from "../common/StoryCard"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { getSuggestedPosts } from "../../featurres/post/postSlice"
import { fetchPostLikes, toggleLikePost } from "../../featurres/like/likeSlice"
import { toggleFollowUser } from "../../featurres/users/userSlice"
import CreateStoryModal from "../../modals/CreateStoryModal"
import { getAllStories } from "../../featurres/story/storySlice"
import { addComment, getAllComments } from "../../featurres/comments/CommentSlice"
import CommentsModal from "../../modals/CommentsModal"

const Feed = () => {
  const dispatch = useDispatch()
  const { profile } = useSelector((state) => state.user);
  const { suggestedPosts, loading, error } = useSelector((state) => state.post)
  const { allStories, loading: storyLoading, error: storyError } = useSelector((state) => state.story)

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false)

  console.log("profile user", profile)

  // fetch posts
  useEffect(() => {
    dispatch(getSuggestedPosts())
  }, [dispatch])

  // fetch stories
  useEffect(() => {
    if (profile?._id) {
      dispatch(getAllStories())
    }
  }, [dispatch, profile?._id])

  return (
    <div className="flex-1 bg-white/80 backdrop-blur-sm min-h-screen lg:h-screen relative lg:overflow-y-auto scrollbar-hide">
      {/* Stories */}
      <div className="p-4">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {/* own story (always visible) */}
          <StoryCard
            key="own"
            profileImage={profile?.profilePicture}
            userName="Your Story"
            isOwn
            stories={profile?.stories || []}
            onCreate={() => setIsStoryModalOpen(true)}
          />

          {/* other users’ stories */}
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
      <div className="pb-20">
        {loading && <p className="text-center text-gray-500 py-10">Loading posts...</p>}
        {error && <p className="text-center text-red-500 py-10">{error}</p>}
        {!loading && !error && suggestedPosts?.length === 0 && (
          <p className="text-center text-gray-500 py-10">No posts available</p>
        )}

        {suggestedPosts?.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={profile?._id}
            profile={profile}
          />
        ))}
      </div>

      {/* Create Story Modal */}
      <CreateStoryModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} />
    </div>
  )
}

const PostCard = ({ post, currentUserId, profile }) => {
  const [mediaIndex, setMediaIndex] = useState(0)
  const mediaArray = Array.isArray(post.mediaUrl) ? post.mediaUrl : [post.mediaUrl].filter(Boolean)
  const dispatch = useDispatch()

  const [postLikes, setPostLikes] = useState({
    likedByUser: false,
    likeCount: post.likes?.length || 0,
  })

  const isFollowing = profile?.following?.some((id) => id.toString() === post.author?._id?.toString())

  const handlePrev = () =>
    setMediaIndex((prev) => (prev === 0 ? mediaArray.length - 1 : prev - 1))
  const handleNext = () =>
    setMediaIndex((prev) => (prev === mediaArray.length - 1 ? 0 : prev + 1))

  const currentMedia = mediaArray[mediaIndex]

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


  // comments from redux
  const { postComments, loading: commentsLoading } = useSelector((state) => state.comment);

  // safely get comments for this post
  const postCommentsData = postComments[post._id] || { comments: [], count: 0 };


  // console.log(PostCommentsCount);

  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (post._id) {
      dispatch(getAllComments({ contentType: "Post", contentId: post._id }));
    }
  }, [dispatch, post._id]);

  // console.log(PostCommentsCount)


  // modal states
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // Open modal handler
  const openComments = () => setIsCommentsOpen(true);

  // Close modal handler
  const closeComments = () => setIsCommentsOpen(false);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !profile) return;

    dispatch(
      addComment({
        contentType: "Post",
        contentId: post._id, // ✅ correct id
        content: newComment.trim(),
      })
    ).then(() => {
      setNewComment("");
      dispatch(getAllComments({ contentType: "Post", contentId: post._id })); // ✅ correct id
    });
  };


  return (
    <div className="border-b border-gray-200 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author?.profilePicture || "/placeholder.svg"}
            alt={post.author?.userName || "User"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-gray-800 font-medium">{post.author?.userName || "Unknown"}</p>
            <p className="text-gray-500 text-sm">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {post.author?._id !== profile?._id && (
            <button
              onClick={handleFollowToggle}
              className="text-sm font-medium transition-colors text-purple-600"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
          <MoreHorizontal className="text-gray-600 cursor-pointer" size={20} />
        </div>
      </div>

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
            <Heart
              size={24}
              className={`cursor-pointer transition-colors ${postLikes.likedByUser ? "text-red-500 fill-red-500" : "text-gray-700"
                }`}
              onClick={handleToggleLike}
            />
            <MessageCircle
              onClick={openComments}
              className="text-gray-700 cursor-pointer hover:text-gray-600 transition-colors"
              size={24}
            />
            <Send
              className="text-gray-700 cursor-pointer hover:text-gray-600 transition-colors"
              size={24}
            />
          </div>
          <Bookmark
            className="text-gray-700 cursor-pointer hover:text-gray-600 transition-colors"
            size={24}
          />
        </div>

        <p className="text-gray-800 font-medium mb-2">
          {postLikes.likeCount || 0} likes
        </p>

        <div className="text-gray-800">
          <span className="ml-2">{post.caption}</span>
        </div>

        {postCommentsData.count > 0 && (
          <button
            onClick={openComments}
            className="text-gray-500 text-sm mt-2 hover:text-gray-600 cursor-pointer transition-colors"
          >
            View all {postCommentsData.count} comments
          </button>
        )}


        <div className="flex items-center mt-3 pt-3 border-t border-gray-200">
          <form
            onSubmit={handleCommentSubmit}
            className="flex items-center w-full" // ✅ makes input + button align horizontally
          >
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 outline-none"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            {newComment.trim() && (
              <button
                type="submit"
                className="text-purple-600 font-medium ml-2 hover:text-purple-700 transition-colors"
              >
                Post
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

export default Feed;