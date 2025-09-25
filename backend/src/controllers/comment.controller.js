import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import Story from "../models/story.model.js";
// import Reel from "../models/reel.model.js";
import Notification from "../models/notification.model.js"
import { io, getReceiverSocketId } from "../socketIO/Server.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";



const models = { Post, Story /*, Reel */ };

// ---------------------- Add Comment ----------------------
export const addComment = asyncHandler( async(req, res) => {
    const userId = req.user._id;
    const { contentType, contentId } = req.params;
    const { content } = req.body;

    if (!models[contentType]) {
      throw new ApiError(400 , "Invalid content type" );
    }

    // Get parent document (post, reel, story, etc.)
    const parentDoc = await models[contentType].findById(contentId).populate("author", "name userName profilePicture"); 
    if (!parentDoc) {
      return res.status(404).json({ message: `${contentType} not found` });
    }

    // Create new comment
    const newComment = await Comment.create({
      author: userId,
      commentableId: contentId,
      commentableType: contentType,
      content,
      parentComment: null, // top-level
    });

    const populatedComment = await Comment.findById(newComment._id)
      .populate("author", "name userName profilePicture")
      .populate({
        path: "likes",
        populate: { path: "author", select: "name userName profilePicture" },
      });

    const commentCount = await Comment.countDocuments({
      commentableId: contentId,
      commentableType: contentType,
    });

    // 🔔 Notification logic
    const postOwnerId = parentDoc.author._id;

    if (postOwnerId.toString() !== userId.toString()) {
      // 1. Save notification in DB
      const newNotification = await Notification.create({
        recipient: postOwnerId,
        sender: userId,
        type: "comment",
        postId: contentId,
      });

      // 2. Emit real-time notification if post owner is online
      const receiverSocketId = getReceiverSocketId(postOwnerId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("getNotification", newNotification);
      }
    }

    return res.status(201).json({
      message: `Comment added to ${contentType.toLowerCase()}`,
      comment: populatedComment,
      commentCount,
    });
});
// ---------------------- Reply Comment ----------------------
export const replyComment = asyncHandler( async(req, res) => {
    const userId = req.user._id;
    const { commentId } = req.params;
    const { content } = req.body;

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      throw new ApiError(404, "Parent comment not found" );
    }

    const reply = await Comment.create({
      author: userId,
      content,
      commentableId: parentComment.commentableId,
      commentableType: parentComment.commentableType,
      parentComment: parentComment._id,
    });

    const populatedReply = await Comment.findById(reply._id)
      .populate("author", "name userName profilePicture")
      .populate({
        path: "likes",
        populate: { path: "author", select: "name userName profilePicture" },
      });

    const commentCount = await Comment.countDocuments({
      commentableId: parentComment.commentableId,
      commentableType: parentComment.commentableType,
    });

    return res.status(201).json({
      message: "Reply added successfully",
      reply: populatedReply,
      commentCount,
    });
});

// ---------------------- Delete Comment ----------------------
export const deleteComment = asyncHandler( async(req, res) => {
    const userId = req.user._id;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    const parentDoc = await models[comment.commentableType].findById(comment.commentableId);
    if (!parentDoc) throw new ApiError(404, "Parent content not found" );

    // Only comment author OR content author can delete
    if (
      comment.author.toString() !== userId.toString() &&
      parentDoc.author.toString() !== userId.toString()
    ) {
      throw new ApiError(403, "Not authorized to delete this comment" );
    }

    // Recursive deletion
    const deleteWithReplies = async (id) => {
      const replies = await Comment.find({ parentComment: id });
      for (const r of replies) {
        await deleteWithReplies(r._id);
      }
      await Comment.findByIdAndDelete(id);
    };

    await deleteWithReplies(commentId);

    const commentCount = await Comment.countDocuments({
      commentableId: comment.commentableId,
      commentableType: comment.commentableType,
    });

    return res.status(200).json({
      message: "Comment and its replies deleted successfully",
      commentCount,
    });
});

// ---------------------- Get Comments ----------------------
export const getComments = asyncHandler( async(req, res) => {
    const { contentType, contentId } = req.params;

    const topLevelComments = await Comment.find({
      commentableId: contentId,
      commentableType: contentType,
      parentComment: null,
    })
      .populate("author", "name userName profilePicture")
      .populate({
        path: "likes",
        populate: { path: "author", select: "name userName profilePicture" },
      })
      .populate({
        path: "replies", // virtual
        populate: { path: "author", select: "name userName profilePicture" },
      })
      .sort({ createdAt: -1 });

    const commentCount = await Comment.countDocuments({
      commentableId: contentId,
      commentableType: contentType,
    });

    return res.status(200).json({
      message: "Comments fetched successfully",
      commentCount,
      comments: topLevelComments,
    });
});
