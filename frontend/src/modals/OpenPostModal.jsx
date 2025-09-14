
"use client"

import { useState, useEffect } from "react"
import {
  X,
  Heart,
  MessageCircle,
  Bookmark,
  Share,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  Edit3,
  Trash2,
} from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { deletePost, updatePost } from "../featurres/post/postSlice.jsx"
import {toast} from "react-hot-toast"

const OpenPostModal = ({ isOpen, onClose, post, isOwnProfile, profileData }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showComments, setShowComments] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editCaption, setEditCaption] = useState("")

  const { profile } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setCurrentMediaIndex(0)
      setEditCaption(post?.caption || "")
    } else {
      document.body.style.overflow = "unset"
      setIsEditing(false)
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen, post])

  if (!isOpen || !post) return null

  const mediaItems = post.mediaUrl || [post.image] || ["/placeholder.svg"]
  const hasMultipleMedia = mediaItems.length > 1

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
  }

  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (newComment.trim()) {
      // Add comment logic here
      setNewComment("")
    }
  }

  const handleEditPost = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData()
      formData.append("caption", editCaption)

      await dispatch(
        updatePost({
          postId: post._id,
          formData,
        }),
      ).unwrap()

      setIsEditing(false)
      console.log("[v0] Post updated successfully")
    } catch (error) {
      console.error("[v0] Failed to update post:", error)
      alert("Failed to update post. Please try again.")
    }
  }

  const handleCancelEdit = () => {
    setEditCaption(post?.caption || "")
    setIsEditing(false)
  }

  const handleDeletePost = async () => {
  if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
    try {
      await toast.promise(
        dispatch(deletePost(post._id)).unwrap(),
        {
          loading: "Deleting post...",
          success: "Post deleted successfully",
          error: "Failed to delete post. Please try again.",
        }
      )
      onClose() // Close modal after successful deletion
    } catch (error) {
      console.error("[v0] Failed to delete post:", error)
    }
  }
}


  const formatTimeAgo = (date) => {
    // Simple time ago formatting
    return "2h"
  }

  const isPostOwner = profile?.userName === profileData?.userName

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Modal Content */}
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden flex">
        {/* Media Section */}
        <div className="relative flex-1 bg-black flex items-center justify-center">
          {/* Navigation arrows for multiple media */}
          {hasMultipleMedia && currentMediaIndex > 0 && (
            <button
              onClick={handlePrevMedia}
              className="absolute left-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {hasMultipleMedia && currentMediaIndex < mediaItems.length - 1 && (
            <button
              onClick={handleNextMedia}
              className="absolute right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Media indicators */}
          {hasMultipleMedia && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-1">
              {mediaItems.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentMediaIndex ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          )}

          {/* Current Media */}
          <div className="w-full h-full flex items-center justify-center">
            {post.mediaType === "video" ? (
              <video
                key={`${post._id || post.id}-${currentMediaIndex}`} // Better key for re-rendering
                src={mediaItems[currentMediaIndex]}
                className="max-w-full max-h-full object-contain"
                controls
                loop
                muted
                playsInline
                preload="metadata"
                onError={(e) => {
                  console.log("[v0] Video error in modal:", e)
                  console.log("[v0] Video src:", mediaItems[currentMediaIndex])
                  console.log("[v0] Video element:", e.target)
                }}
                onLoadStart={() => console.log("[v0] Video loading in modal:", mediaItems[currentMediaIndex])}
                onCanPlay={() => console.log("[v0] Video can play in modal")}
                onLoadedData={() => console.log("[v0] Video loaded data in modal")}
              >
                <source src={mediaItems[currentMediaIndex]} type="video/mp4" />
                <source src={mediaItems[currentMediaIndex]} type="video/webm" />
                <source src={mediaItems[currentMediaIndex]} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={mediaItems[currentMediaIndex] || "/placeholder.svg"}
                alt={post.caption || "Post"}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  console.log("[v0] Image error:", e)
                  e.target.src = "/placeholder.svg"
                }}
              />
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-96 flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-0.5">
              <img
                src={profileData.profilePicture || "/diverse-user-avatars.png"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{profileData.userName}</span>
                {profileData.isVerified && <CheckCircle className="w-4 h-4 text-blue-500 fill-current" />}
              </div>
              <span className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</span>
            </div>
            {isPostOwner ? (
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={handleEditPost}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="Edit post"
                  >
                    <Edit3 className="w-4 h-4 text-gray-600" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSaveEdit}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <button
                  onClick={handleDeletePost}
                  className="p-1 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ) : (
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Caption */}
          {(post.caption || isEditing) && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-0.5 flex-shrink-0">
                  <img
                    src={profileData.profilePicture || "/diverse-user-avatars.png"}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-sm mr-2">{profileData.userName}</span>
                  {isEditing ? (
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded p-2 mt-1 resize-none"
                      rows={3}
                      placeholder="Write a caption..."
                    />
                  ) : (
                    <span className="text-sm">{post.caption}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {post.comments?.length > 0 ? (
              post.comments.map((comment, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-0.5 flex-shrink-0">
                    <img
                      src={comment.userProfilePicture || "/diverse-user-avatars.png"}
                      alt="Commenter"
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-sm mr-2">{comment.userName}</span>
                    <span className="text-sm">{comment.text}</span>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                      <button className="text-xs text-gray-500 font-medium hover:text-gray-700">Reply</button>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <Heart className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs">Be the first to comment</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <button onClick={handleLike} className="hover:scale-110 transition-transform">
                  <Heart className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                </button>
                <button className="hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-gray-700" />
                </button>
                <button className="hover:scale-110 transition-transform">
                  <Share className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              {!isPostOwner && (
                <button onClick={handleSave} className="hover:scale-110 transition-transform">
                  <Bookmark className={`w-6 h-6 ${isSaved ? "fill-gray-700 text-gray-700" : "text-gray-700"}`} />
                </button>
              )}
            </div>

            {/* Likes count */}
            <div className="mb-3">
              <span className="font-semibold text-sm">
                {(post.likes?.length || post.likes || 0) + (isLiked ? 1 : 0)} likes
              </span>
            </div>

            {/* Add comment */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-0.5 flex-shrink-0">
                <img
                  src={profile?.profilePicture || "/diverse-user-avatars.png"}
                  alt="Your profile"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 text-sm border-none outline-none placeholder-gray-500"
              />
              {newComment.trim() && (
                <button type="submit" className="text-sm font-semibold text-blue-500 hover:text-blue-700">
                  Post
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpenPostModal
