import Post from "../models/post.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import User from "../models/user.model.js";
import Like from "../models/like.model.js";
import Comment from "../models/comment.model.js"; 

// Upload a new post
export const uploadPost = async (req, res) => {
    try {
        const { title, caption, mediaType } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one media file is required" });
        }

        // Upload each file to Cloudinary
        const mediaUrls = await Promise.all(
            req.files.map(file => uploadOnCloudinary(file.path))
        );

        const post = await Post.create({
            author: req.user._id,
            title,
            caption,
            mediaType: mediaType.toLowerCase(),
            mediaUrl: mediaUrls, // directly use array of strings
        });

        await User.findByIdAndUpdate(req.user._id, { $push: { posts: post._id } });

        const populatedPost = await Post.findById(post._id).populate(
            "author",
            "name userName profileImage"
        );

        return res.status(201).json({
            message: "Post uploaded successfully",
            post: populatedPost,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get all posts of the logged-in user
export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id }).populate(
            "author",
            "name userName profileImage"
        );

        return res.status(200).json({
            message: "Posts fetched successfully",
            posts,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

// View single post
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate("author", "name userName profileImage")
            .populate({
                path: "likes",
                populate: { path: "author", select: "name userName profileImage" },
            })
            .populate({
                path: "comments",
                populate: { path: "author", select: "name userName profileImage" },
            });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.status(200).json({
            message: "Post fetched successfully",
            post,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

// Edit post
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const { title, caption, mediaType } = req.body;
    let mediaUrls = post.mediaUrl; // keep old media if none uploaded

    // Handle multiple file uploads
    if (req.files && req.files.length > 0) {
      mediaUrls = await Promise.all(
        req.files.map(file => uploadOnCloudinary(file.path))
      );
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        title: title || post.title,
        caption: caption || post.caption,
        mediaType: mediaType ? mediaType.toLowerCase() : post.mediaType,
        mediaUrl: mediaUrls,
      },
      { new: true }
    ).populate("author", "name userName profileImage");

    return res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete post
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.author.toString() !== req.user._id.toString())
            return res.status(403).json({ message: "Unauthorized" });

        await Promise.all([
            Like.deleteMany({ likeableId: post._id, likeableType: "Post" }),
            Comment.deleteMany({ post: post._id }),
            User.findByIdAndUpdate(req.user._id, { $pull: { posts: post._id } }),
            Post.findByIdAndDelete(post._id),
        ]);

        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};
