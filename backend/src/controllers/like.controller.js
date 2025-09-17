import Like from "../models/like.model.js"
import User from "../models/user.model.js"
import Post from "../models/post.model.js"
import Story from "../models/story.model.js"

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
      likeableId: postId,
      likeableType: "Post"
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


// export const getPostLikes = async (req, res) => {
//   try {
//     const postId = req.params.postId;

//     const likes = await Like.find({
//       likeableId: postId,
//       likeableType: "Post"
//     }).populate("author", "name userName profilePicture");

//     return res.status(200).json({
//       message: "Likes fetched successfully",
//       likes
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };


// Get all users who liked a specific post

export const getUsersWhoLikedPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find all likes for this post and populate the user info
    const likes = await Like.find({
      likeableId: postId,
      likeableType: "Post"
    }).populate("author", "name userName profilePicture"); // populate user info

    // Extract users from likes
    const users = likes.map(like => like.author);

    return res.status(200).json({
      message: "Users who liked the post fetched successfully",
      users,
      totalLikes: users.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};


export const likeStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const storyId = req.params.storyId;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(400).json({ message: "story not found" });
    }

    const existingLike = await Like.findOne({
      author: userId,
      likeableId: storyId,
      likeableType: "Story"
    });

    if (existingLike) {
      // User already liked: unlike
      await Like.findByIdAndDelete(existingLike._id);
      story.likes.pull(existingLike._id);
      await story.save();

      return res.status(200).json({ message: "story unliked successfully" });
    }

    const like = await Like.create({
      author : userId,
      likeableId : storyId,
      likeableType : "Story"
    })

    story.likes.push(like._id);
    await story.save();

    return res.status(201).json({message : "Story liked successfully"});



  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: "internal server error",
      error
    })
  }
}

export const getUserWhoLikedStory = async (req, res) => {
  try {
    const storyId = req.params.storyId;
    const story = await Story.findById(storyId);
    if(!story) {
      return res.status(400).json({message : "story not found"});
    }

    const likes = await Like.find({
      likeableId : storyId,
      likeableType : "Story", 
    }).populate("author", "name userName profilePicture");

    const users = likes.map(like => like.author);

    return res.status(200).json({
      message: "Users who liked the story fetched successfully",
      users,
      totalLikes: users.length
    });

  } catch(error) {
    console.log(error)
    return res.status(400).json({
      message: "internal server error",
      error
    })
  }
}


