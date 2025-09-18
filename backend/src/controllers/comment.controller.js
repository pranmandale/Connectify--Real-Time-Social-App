import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import Story from "../models/story.model.js";
// import Reel from "../models/reel.model.js";

const models = { Post, Story /*, Reel */ };

// ---------------------- Add Comment ----------------------
export const addComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { contentType, contentId } = req.params;
    const { content } = req.body;

    if (!models[contentType]) {
      return res.status(400).json({ message: "Invalid content type" });
    }

    const parentDoc = await models[contentType].findById(contentId);
    if (!parentDoc) {
      return res.status(404).json({ message: `${contentType} not found` });
    }

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

    return res.status(201).json({
      message: `Comment added to ${contentType.toLowerCase()}`,
      comment: populatedComment,
      commentCount,
    });
  } catch (error) {
    console.error("addComment error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ---------------------- Reply Comment ----------------------
export const replyComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;
    const { content } = req.body;

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
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
  } catch (error) {
    console.error("replyComment error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ---------------------- Delete Comment ----------------------
export const deleteComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const parentDoc = await models[comment.commentableType].findById(comment.commentableId);
    if (!parentDoc) return res.status(404).json({ message: "Parent content not found" });

    // Only comment author OR content author can delete
    if (
      comment.author.toString() !== userId.toString() &&
      parentDoc.author.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
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
  } catch (error) {
    console.error("deleteComment error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ---------------------- Get Comments ----------------------
export const getComments = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("getComments error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
