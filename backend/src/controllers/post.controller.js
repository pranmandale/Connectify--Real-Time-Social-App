import mongoose from "mongoose";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Like from "../models/like.model.js";
import Comment from "../models/comment.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"




/**
 * Helper: builds the post query populate chain
 */
export const buildPostPopulate = (query) => {
    return query
        .populate("author", "name userName profilePicture")
        .populate({
            path: "likes",
            populate: { path: "author", select: "name userName profilePicture" },
        })
        .populate({
            path: "comments",
            populate: [
                { path: "author", select: "name userName profilePicture" },
                {
                    path: "likes",
                    populate: { path: "author", select: "name userName profilePicture" },
                },
                {
                    path: "replies",
                    populate: [
                        { path: "author", select: "name userName profilePicture" },
                        {
                            path: "likes",
                            populate: { path: "author", select: "name userName profilePicture" },
                        },
                    ],
                },
            ],
            options: { sort: { createdAt: 1 } }
        });

};

/**
 * Upload a new post
 */
export const uploadPost = asyncHandler( async(req, res) => {

        const { title, caption, mediaType } = req.body;

        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            throw new ApiError(400, "At least one media file is required" );
        }

        const mediaUrls = await Promise.all(
            req.files.map((file) => uploadOnCloudinary(file.path))
        );

        const post = await Post.create({
            author: req.user._id,
            title,
            caption,
            mediaType: mediaType ? mediaType.toLowerCase() : undefined,
            mediaUrl: mediaUrls,
        });

        await User.findByIdAndUpdate(req.user._id, { $push: { posts: post._id } });

        const populatedPost = await buildPostPopulate(Post.findById(post._id));

        return res.status(201).json({ message: "Post uploaded successfully", post: populatedPost });
});

/**
 * Get all posts of the logged-in user (with pagination)
 */
export const getAllPost = asyncHandler( async(req, res) => {
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            buildPostPopulate(
                Post.find({ author: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit)
            ),
            Post.countDocuments({ author: req.user._id }),
        ]);

        return res.status(200).json({
            message: "Posts fetched successfully",
            meta: { total, page, limit },
            posts,
        });
});

/**
 * View single post by ID
 */
export const getPostById = asyncHandler( async(req, res) => {
    
        const { postId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(postId)) {
           throw new ApiError(400, "Invalid postId" );
        }

        const post = await buildPostPopulate(Post.findById(postId));

        if (!post) return res.status(404).json({ message: "Post not found" });

        return res.status(200).json({ message: "Post fetched successfully", post });
});

/**
 * Update post
 */
export const updatePost = asyncHandler( async(req, res) => {
        const { postId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(postId)) return res.status(400).json({ message: "Invalid postId" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.author.toString() !== req.user._id.toString())
            throw new ApiError(403,"Unauthorized" );

        const { title, caption, mediaType } = req.body;
        let mediaUrls = post.mediaUrl;

        if (req.files && req.files.length > 0) {
            mediaUrls = await Promise.all(req.files.map((file) => uploadOnCloudinary(file.path)));
        }

        const updatedPost = await buildPostPopulate(
            Post.findByIdAndUpdate(
                postId,
                {
                    title: title ?? post.title,
                    caption: caption ?? post.caption,
                    mediaType: mediaType ? mediaType.toLowerCase() : post.mediaType,
                    mediaUrl: mediaUrls,
                },
                { new: true }
            )
        );

        return res.status(200).json({ message: "Post updated successfully", post: updatedPost });
});

/**
 * Delete post (atomic)
 */
export const deletePost = asyncHandler( async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
        const { postId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(postId)) throw new ApiError(400, "Invalid postId");

        const post = await Post.findById(postId).session(session);
        if (!post) throw new Error("Post not found");
        if (post.author.toString() !== req.user._id.toString()) throw new ApiError(400, "Unauthorized");

        // Delete likes
        await Like.deleteMany({ likeableId: post._id, likeableType: "Post" }).session(session);

        // Delete comments + replies
        await Comment.deleteMany({ commentableId: post._id, commentableType: "Post" }).session(session);

        // Remove post from user's posts
        await User.findByIdAndUpdate(req.user._id, { $pull: { posts: post._id } }).session(session);

        // Delete post itself
        await Post.findByIdAndDelete(post._id).session(session);

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: "Post deleted successfully" });
});

/**
 * Get all suggested posts (public feed)
 */
export const getAllSuggestedPosts = asyncHandler( async(req, res) => {
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            buildPostPopulate(Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit)),
            Post.countDocuments(),
        ]);

        return res.status(200).json({
            message: "Posts fetched successfully",
            meta: { total, page, limit },
            posts,
        });
});
