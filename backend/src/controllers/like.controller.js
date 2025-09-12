import Like from "../models/like.model.js"
import User from "../models/user.model.js"
import Post from "../models/post.model.js"

export const likePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const postId = req.params.postId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(400).message({ message: "No post found" });
        }

        const existingLike = await Like.findOne({
            author: userId,
            likeableId: postId,
            likeableType: "Post"
        });

        if (existingLike) {
            // User already liked: unlike
            await Like.findByIdAndDelete(existingLike._id);
            post.likes.pull(existingLike._id);
            await post.save();

            return res.status(200).json({ message: "Post unliked successfully" });
        }

        const like = await Like.create({
            author: userId,
            likeableId : postId,
            likeableType : "Post"
        });

        post.likes.push(like._id);
        await post.save();

        return res.status(200).json({ message: "Post liked successfully", like });


    } catch (error) {
        return res.status(400).json({
            message: "internal server error",
            error
        })
    }
}


export const getPostLikes = async (req, res) => {
  try {
    const postId = req.params.postId;

    const likes = await Like.find({ 
      likeableId: postId,
      likeableType: "Post"
    }).populate("author", "name userName profileImage");

    return res.status(200).json({
      message: "Likes fetched successfully",
      likes
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};


