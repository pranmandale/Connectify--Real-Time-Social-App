"use client";

import { useState, useEffect } from "react";
import { X, Heart, Send, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  addComment,
  addReply,
  getAllComments,
  deleteComment,
} from "../featurres/comments/CommentSlice";
import { createPortal } from "react-dom"

const CommentsModal = ({ isOpen, onClose, postId, postOwner }) => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);
  const { postComments, loading } = useSelector((state) => state.comment);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const commentsData = postComments[postId] || { comments: [], count: 0 };

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && postId) {
      dispatch(getAllComments({ contentType: "Post", contentId: postId }));
    }
  }, [isOpen, postId, dispatch]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setReplyingTo(null);
      setNewComment("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !profile) return;

    if (replyingTo) {
      dispatch(
        addReply({ commentId: replyingTo._id, content: newComment.trim() })
      ).then(() => {
        setReplyingTo(null);
        setNewComment("");
        dispatch(getAllComments({ contentType: "Post", contentId: postId }));
      });
    } else {
      dispatch(
        addComment({
          contentType: "Post",
          contentId: postId,
          content: newComment.trim(),
        })
      ).then(() => {
        setNewComment("");
        dispatch(getAllComments({ contentType: "Post", contentId: postId }));
      });
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setNewComment(`@${comment.author.userName} `);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment("");
  };

  

  const handleDelete = (commentId) => {
    dispatch(deleteComment({
      commentId,
      contentType: "Post",
      contentId: postId
    }));
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Modal Content */}
      <div className="relative w-full h-full max-w-lg bg-white rounded-lg overflow-hidden flex flex-col md:max-h-[80vh] md:h-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Comments</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : commentsData.comments.length > 0 ? (
            <div className="space-y-4">
              {commentsData.comments.map((comment) => (
                <div key={comment._id} className="space-y-3">
                  {/* Main Comment */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-0.5 flex-shrink-0">
                      <img
                        src={
                          comment.author.profilePicture ||
                          "/diverse-user-avatars.png"
                        }
                        alt={comment.author.userName}
                        className="w-full h-full rounded-full object-cover bg-white"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="font-semibold text-sm mr-2">
                            {comment.author.userName}
                          </span>
                          <span className="text-sm text-gray-800">
                            {comment.content}
                          </span>
                        </div>
                        {profile?._id === comment.author._id && (
                          <button
                            onClick={() => handleDelete(comment._id)}
                            className="p-1 hover:bg-gray-100 rounded-full ml-2 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-3 text-gray-400" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                        <button
                          onClick={() => handleReply(comment)}
                          className="text-xs text-gray-500 font-medium hover:text-gray-700"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies?.length > 0 && (
                    <div className="ml-11 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-0.5 flex-shrink-0">
                            <img
                              src={
                                reply.author.profilePicture ||
                                "/diverse-user-avatars.png"
                              }
                              alt={reply.author.userName}
                              className="w-full h-full rounded-full object-cover bg-white"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <span className="font-semibold text-sm mr-2">
                                  {reply.author.userName}
                                </span>
                                <span className="text-sm text-gray-800">
                                  {reply.content}
                                </span>
                              </div>
                              {profile?._id === reply.author._id && (
                                <button
                                  onClick={() => handleDelete(reply._id)}
                                  className="p-1 hover:bg-gray-100 rounded-full ml-2"
                                >
                                  <Trash2 className="w-3 h-3 text-gray-400" />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(reply.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 font-medium">No comments yet</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to comment</p>
            </div>
          )}
        </div>

        {/* Reply indicator */}
        {replyingTo && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Replying to{" "}
              <span className="font-medium">@{replyingTo.author.userName}</span>
            </span>
            <button
              onClick={cancelReply}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Comment Input */}
        <div className="p-4 border-t border-gray-200">
          <form
            onSubmit={handleCommentSubmit}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-0.5 flex-shrink-0">
              <img
                src={profile?.profilePicture || "/diverse-user-avatars.png"}
                alt="Your profile"
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <input
              type="text"
              placeholder={
                replyingTo
                  ? `Reply to ${replyingTo.author.userName}...`
                  : "Add a comment..."
              }
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 text-sm border-none outline-none placeholder-gray-500 bg-transparent"
            />
            {newComment.trim() && (
              <button
                type="submit"
                className="text-sm font-semibold text-blue-500 hover:text-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommentsModal;
