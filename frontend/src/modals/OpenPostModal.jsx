"use client"

import { useState, useEffect, useRef } from "react"
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
  CornerUpLeft,
} from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { deletePost, updatePost } from "../featurres/post/postSlice.jsx"
import {
  toggleLikePost,
  fetchPostLikes,
} from "../featurres/like/likeSlice.js"
import { toast } from "react-hot-toast"
import { addComment, addReply, deleteComment, getAllComments } from "../featurres/comments/CommentSlice.jsx"
const OpenPostModal = ({ isOpen, onClose, post, isOwnProfile, profileData }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [likes, setLikes] = useState({ likedByUser: false, likeCount: 0 })
  const [isSaved, setIsSaved] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editCaption, setEditCaption] = useState("")
  const [replyingTo, setReplyingTo] = useState(null) // comment object we're replying to
  const replyInputRef = useRef(null)

  const dispatch = useDispatch()
  const { profile } = useSelector((state) => state.user)
  const { postComments, loading: commentsLoading, error: commentsError } = useSelector(
    (state) => state.comment
  )

  // derive postId safely
  const postId = post?._id || post?.id

  // Load likes state when modal opens
  useEffect(() => {
    if (isOpen && postId && profile?._id) {
      setCurrentMediaIndex(0)
      setEditCaption(post?.caption || "")
      setReplyingTo(null)
      setNewComment("")

      dispatch(fetchPostLikes({ postId, currentUserId: profile._id }))
        .then((res) => {
          if (res.payload) {
            setLikes({
              likedByUser: res.payload.users?.some((u) => u._id === profile._id) ?? false,
              likeCount: res.payload.totalLikes ?? 0,
            })
          }
        })
        .catch((err) => {
          console.error("fetchPostLikes error:", err)
        })
    }
  }, [isOpen, postId, post, profile, dispatch])

  // Fetch comments when modal opens and whenever postId changes
  useEffect(() => {
    if (isOpen && postId) {
      dispatch(getAllComments({ contentType: "Post", contentId: postId })).catch((err) => {
        console.error("getAllComments error:", err)
      })
    }
  }, [isOpen, postId, dispatch])

  if (!isOpen || !post) return null

  // Prefer comments from store; fallback to post.comments if present
  const commentsData = postComments[postId] || {
    comments: Array.isArray(post.comments) ? post.comments : [],
    count: post.comments?.length ?? 0,
  }
  const comments = commentsData.comments || []

  const mediaItems = Array.isArray(post.mediaUrl)
    ? post.mediaUrl
    : post.mediaUrl
      ? [post.mediaUrl]
      : post.image
        ? [post.image]
        : ["/placeholder.svg"]
  const hasMultipleMedia = mediaItems.length > 1

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
  }

  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
  }

  const handleToggleLike = async () => {
    try {
      await dispatch(toggleLikePost(post._id)).unwrap()
      setLikes((prev) => ({
        likedByUser: !prev.likedByUser,
        likeCount: prev.likedByUser ? prev.likeCount - 1 : prev.likeCount + 1,
      }))
    } catch (error) {
      console.error("[v0] Failed to toggle like:", error)
      toast.error("Failed to update like. Please try again.")
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const clearCommentInput = () => {
    setNewComment("")
    setReplyingTo(null)
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    const trimmed = newComment?.trim()
    if (!trimmed) return

    try {
      if (replyingTo) {
        // Add reply - payload expected by thunk is { commentId, content }
        await dispatch(addReply({ commentId: replyingTo._id, content: trimmed })).unwrap()
        toast.success("Reply added")
      } else {
        // Add top-level comment - payload: { contentType, contentId, content }
        await dispatch(addComment({ contentType: "Post", contentId: postId, content: trimmed })).unwrap()
        toast.success("Comment added")
      }
      // Re-fetch comments to get latest structure & counts (backend is source of truth)
      await dispatch(getAllComments({ contentType: "Post", contentId: postId })).unwrap()
      clearCommentInput()
    } catch (error) {
      console.error("Failed to submit comment/reply:", error)
      toast.error("Failed to post comment. Please try again.")
    }
  }

  const handleReply = (comment) => {
    setReplyingTo(comment)
    setNewComment(`@${comment.author.userName} `)
    // focus input on next tick
    setTimeout(() => {
      replyInputRef.current?.focus()
    }, 0)
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
    setNewComment("")
  }

  const handleEditPost = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData()
      formData.append("caption", editCaption)

      await dispatch(updatePost({ postId: post._id, formData })).unwrap()

      setIsEditing(false)
      toast.success("Post updated successfully")
    } catch (error) {
      console.error("[v0] Failed to update post:", error)
      toast.error("Failed to update post. Please try again.")
    }
  }

  const handleCancelEdit = () => {
    setEditCaption(post?.caption || "")
    setIsEditing(false)
  }

  const handleDeletePost = async () => {
    if (
      window.confirm("Are you sure you want to delete this post? This action cannot be undone.")
    ) {
      try {
        await toast.promise(dispatch(deletePost(post._id)).unwrap(), {
          loading: "Deleting post...",
          success: "Post deleted successfully",
          error: "Failed to delete post. Please try again.",
        })
        onClose()
      } catch (error) {
        console.error("[v0] Failed to delete post:", error)
      }
    }
  }

  

  const handleDeleteComment = (commentId) => {
    dispatch(deleteComment({
      commentId,
      contentType: "Post",
      contentId: postId
    }));
  }

  const formatTimeAgo = (dateString) => {
    // Small production-ish formatter without external libs
    if (!dateString) return ""
    const d = new Date(dateString)
    const diff = Math.floor((Date.now() - d.getTime()) / 1000) // seconds
    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  const isPostOwner = profile?.userName === profileData?.userName

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Open post"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Modal Content */}
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden flex">
        {/* Media Section */}
        <div className="relative flex-1 bg-black flex items-center justify-center">
          {/* Navigation arrows */}
          {hasMultipleMedia && mediaItems.length > 1 && (
            <>
              <button
                onClick={handlePrevMedia}
                className="absolute left-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Previous media"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMedia}
                className="absolute right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Next media"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
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
                key={`${postId}-${currentMediaIndex}`}
                src={mediaItems[currentMediaIndex]}
                className="max-w-full max-h-full object-contain"
                controls
                loop
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={mediaItems[currentMediaIndex] || "/placeholder.svg"}
                alt={post.caption || "Post"}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
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
                alt={`${profileData.userName}'s profile`}
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{profileData.userName}</span>
                {profileData.isVerified && (
                  <CheckCircle className="w-4 h-4 text-blue-500 fill-current" />
                )}
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
                    aria-label="Edit post"
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
                  aria-label="Delete post"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ) : (
              <button className="p-1 hover:bg-gray-100 rounded-full" aria-label="More actions">
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
                    alt={`${profileData.userName}'s profile`}
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
                      aria-label="Edit caption"
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
            {commentsLoading && comments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Loading comments…</div>
            ) : comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.author._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-0.5 flex-shrink-0">
                    <img
                      src={comment.author.profilePicture || "/diverse-user-avatars.png"}
                      alt={`${comment.author.userName}'s avatar`}
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm mr-2">{comment.author.userName}</span>
                          <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                        </div>
                        <div className="text-sm mt-1 break-words">{comment.content}</div>
                      </div>

                      <div className="flex items-start gap-1">
                        <button
                          onClick={() => handleReply(comment)}
                          className="p-1 hover:bg-gray-100 rounded-full"
                          title="Reply"
                        // aria-label={`Reply to ${comment.replies.author.userName}`}
                        >
                          <CornerUpLeft className="w-4 h-4 text-gray-500" />
                        </button>

                        {(profile?._id === comment.userId || isPostOwner) && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="p-1 hover:bg-red-50 rounded-full"
                            title="Delete comment"
                            aria-label="Delete comment"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Replies */}
                    {/* Replies */}
                    {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                      <div className="mt-3 ml-12 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                              <img
                                src={reply.author.profilePicture || "/diverse-user-avatars.png"}
                                alt={`${reply.author.userName}'s avatar`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <div>
                                  <span className="font-semibold text-sm mr-2">{reply.author.userName}</span>
                                  <span className="text-xs text-gray-400">{formatTimeAgo(reply.createdAt)}</span>
                                  <div className="text-sm mt-1 break-words">{reply.content}</div>
                                </div>

                                <div>
                                  {(profile?._id === reply.author._id || isPostOwner) && (
                                    <button
                                      onClick={() => handleDeleteComment(reply._id)}
                                      className="p-1 hover:bg-red-50 rounded-full"
                                      title="Delete reply"
                                      aria-label="Delete reply"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
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
                <button onClick={handleToggleLike} className="hover:scale-110 transition-transform" aria-label="Like">
                  <Heart className={`w-6 h-6 ${likes.likedByUser ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                </button>
                <button className="hover:scale-110 transition-transform" aria-label="Open comments">
                  <MessageCircle className="w-6 h-6 text-gray-700" />
                </button>
                <button className="hover:scale-110 transition-transform" aria-label="Share">
                  <Share className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              {!isPostOwner && (
                <button onClick={handleSave} className="hover:scale-110 transition-transform" aria-label="Save post">
                  <Bookmark className={`w-6 h-6 ${isSaved ? "fill-gray-700 text-gray-700" : "text-gray-700"}`} />
                </button>
              )}
            </div>

            {/* Likes count */}
            <div className="mb-3">
              <span className="font-semibold text-sm">{likes.likeCount} likes</span>
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
                ref={replyInputRef}
                type="text"
                placeholder={replyingTo ? `Replying to ${replyingTo.userName}` : "Add a comment..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 text-sm border-none outline-none placeholder-gray-500"
                aria-label={replyingTo ? `Reply to ${replyingTo.userName}` : "Add a comment"}
              />
              {replyingTo ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelReply}
                    className="text-xs px-2 py-1 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="text-sm font-semibold text-blue-500 hover:text-blue-700">
                    Reply
                  </button>
                </div>
              ) : (
                newComment.trim() && (
                  <button type="submit" className="text-sm font-semibold text-blue-500 hover:text-blue-700">
                    Post
                  </button>
                )
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpenPostModal
