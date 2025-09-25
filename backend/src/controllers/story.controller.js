import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"

export const uploadStory = asyncHandler( async(req, res) => {
        const {
            text,
            backgroundColor,
            textColor,
            fontSize,
            textPositionX,
            textPositionY,
        } = req.body;

        const user = req.user;
        if (!user) {
            throw new ApiError(401, "Unauthorized" );
        }

        let mediaType = "text"; // default
        let mediaUrl = "";

        // ✅ If media uploaded → detect type & upload



        if (req.file) {
            console.log("received file", req.file)
            mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";

            const uploadedUrl = await uploadOnCloudinary(req.file.path); // returns URL directly
            mediaUrl = uploadedUrl;
        }
        else if (text?.trim()) {
            mediaType = "text"; // text-only story
        } else {
            throw new ApiError(400,"Story must contain either media or text");
        }

        // ✅ Create story
        const story = await Story.create({
            author: user._id,
            text: text?.trim() || "",
            backgroundColor: backgroundColor || "#000000",
            textColor: textColor || "#ffffff",
            fontSize: fontSize || "medium",
            textPosition: {
                x: textPositionX ? Number(textPositionX) : 50,
                y: textPositionY ? Number(textPositionY) : 50,
            },
            mediaType,
            mediaUrl,
            duration: mediaType === "video" ? 15 : 5, // seconds
        });

        // ✅ Save reference in user model
        await User.findByIdAndUpdate(user._id, { $push: { stories: story._id } });

        const populatedStory = await Story.findById(story._id).populate(
            "author",
            "name userName profileImage"
        );

        return res.status(201).json({
            message: "Story created successfully",
            story: populatedStory,
        });
});

export const getAllStories = asyncHandler( async(req, res) => {
        const user = req.user;
        if (!user) {
            throw new ApiError(401,"Unauthorized" );
        }

        // ✅ Get the logged-in user with their following list
        const loggedInUser = await User.findById(user._id).select("following");

        // Collect userIds: self + following
        const userIds = [user._id, ...loggedInUser.following];

        // ✅ Fetch all stories from these users (not expired)
        const stories = await Story.find({
            author: { $in: userIds },
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // last 24h
        })
            .populate("author", "name userName profilePicture")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Stories fetched successfully",
            stories,
        });
});


export const getStoryById = asyncHandler( async(req, res) => {
        const storyId = req.params.storyId;
        const user = req.user;
        if (!user) {
            throw new ApiError(400, "unauthorized" )
        }
        const story = await Story.findById(storyId)
            .populate("author", "name userName profilePicture")
            .populate({
                path: "likes",
                populate: { path: "author", select: "name userName profilePicture" },
            })
            .populate({
                path: "comments",
                populate: { path: "author", select: "name userName profilePicture" },
            });

        if (!story) {
            return res.status(400).json({ message: "story not found" });
        }

        return res.status(201).json({
            message: "story fetched successfully",
            story
        })

})

// GET /story/user/:userId

// get only story above route is for get the story info like when that story created who liked who commented
export const getUserStories = asyncHandler( async(req, res) => {
    
        const { userId } = req.params;
        const stories = await Story.find({
            author: userId,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        })
            .sort({ createdAt: -1 })
            .populate("author", "name userName profilePicture"); // ✅ populate author here

        return res.status(200).json({ stories });
});



export const deleteStory = asyncHandler( async(req, res) => {

    const storyId = req.params.storyId;
    const story = await Story.findById(storyId);
    if (!story) {
      throw new ApiError(404, "Story not found" );
    }

    console.log("Story author:", story.author);
    console.log("Req user:", req.user._id);

    // ✅ Use .equals() for ObjectId comparison
    if (!story.author.equals(req.user._id)) {
      throw new ApiError(403, "Unauthorized: you cannot delete this story" );
    }

    await Promise.all([
      Like.deleteMany({ likeableId: story._id, likeableType: "Story" }),
      Comment.deleteMany({ story: story._id }),
      User.findByIdAndUpdate(req.user._id, { $pull: { stories: story._id } }),
      Story.findByIdAndDelete(story._id),
    ]);

    return res.status(200).json({ message: "Story deleted successfully" });
});

// PUT /story/view/:storyId
export const markStoryViewed = asyncHandler( async(req, res) => {
        const story = await Story.findById(req.params.storyId);
        if (!story) throw new ApiError(404, "Story not found" );

        if (!story.viewedBy.includes(req.user._id)) {
            story.viewedBy.push(req.user._id);
            await story.save();
        }

        return res.status(200).json({ message: "Story marked as viewed" });
});

