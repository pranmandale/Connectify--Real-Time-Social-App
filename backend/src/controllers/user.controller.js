import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js"
import Notification from "../models/notification.model.js"
import { io, getReceiverSocketId } from "../socketIO/Server.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";




export const fetchProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Fetch the user from DB with populated fields
  const user = await User.findById(userId)
    .populate("posts")
    .populate("stories")
    .populate("followers")
    .populate("following");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Remove password
  const { password, ...userData } = user.toObject();

  res.status(200).json({
    message: "User fetched successfully",
    user: userData,
  });
});

export const suggestedUsers = asyncHandler( async(req, res) => {

    const users = await User.find({
      _id: { $ne: req.user._id }
    }).select("-password");

    if (!users || users.length === 0) {
      throw new ApiError(404, "No users found" );
    }

    return res.status(200).json({
      message: "Users fetched successfully",
      users
    });
  
    
  
});


// export const editProfile = async (req, res) => {
//   try {
//     const { name, userName, bio, gender, location, website } = req.body;

//     const user = req.user;
//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized: user not found" });
//     }


//     if (userName) {
//       const existingUser = await User.findOne({ userName }).select("_id");
//       if (existingUser && existingUser._id.toString() !== user._id.toString()) {
//         return res.status(400).json({ message: "Username already in use" });
//       }
//     }

//     let profileImage = user.profilePicture;

//     if (req.file) {
//       try {
//         profileImage = await uploadOnCloudinary(req.file.path);
//       } catch (cloudErr) {
//         console.error("Cloudinary upload failed:", cloudErr);
//         return res.status(500).json({ message: "Image upload failed" });
//       }
//     }


//     user.name = name || user.name;
//     user.userName = userName || user.userName;
//     user.profilePicture = profileImage || user.profilePicture;
//     user.bio = bio ?? user.bio;
//     // user.gender = gender ?? user.gender;
//     user.gender = Array.isArray(gender) ? gender[0] : gender ?? user.gender;
//     user.location = location ?? user.location;
//     user.website = website ?? user.website;

//     await user.save();

//     return res.status(200).json({
//       message: "Profile updated successfully",
//       user: {
//         _id: user._id,
//         name: user.name,
//         userName: user.userName,
//         profilePicture: user.profilePicture,
//         bio: user.bio,
//         gender: user.gender,
//         location: user.location,
//         website: user.website,
//         isVerified: user.isVerified,
//       },
//     });
//   } catch (error) {
//     console.error("Edit Profile Error:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };



// helper: strip out empty strings so Mongoose doesn't reject them

const cleanFields = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== "" && v !== undefined)
  );
};

export const editProfile = asyncHandler( async(req, res) => {
  
    const { name, userName, bio, gender, location, website } = req.body;
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unauthorized: user not found" );
    }

    // ✅ ensure username uniqueness
    if (userName) {
      const existingUser = await User.findOne({ userName }).select("_id");
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        throw new ApiError(400, "Username already in use" );
      }
    }

    // ✅ handle profile image upload
    let profileImage = user.profilePicture;
    if (req.file) {
      try {
        profileImage = await uploadOnCloudinary(req.file.path, "profiles");
      } catch (cloudErr) {
        console.error("Cloudinary upload failed:", cloudErr);
        throw new ApiError(500,  "Image upload failed" );
      }
    }

    // ✅ clean up request body (remove empty strings)
    const updates = cleanFields({
      name,
      userName,
      bio,
      gender,
      location,
      website,
    });

    // assign values
    Object.assign(user, updates);

    // set profile image if uploaded
    if (profileImage) {
      user.profilePicture = profileImage;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        userName: user.userName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        gender: user.gender,
        location: user.location,
        website: user.website,
        isVerified: user.isVerified,
      },
    });
  
});


export const getProfileByParams = asyncHandler( async(req, res) => {
  
    const userName = req.params.userName;
    const user = await User.findOne({ userName }).select("-password").populate("posts");

    if (!user) {
      throw new ApiError(400, "user not found")
    }

    return res.status(200).json({
      message: "user fetched successfully",
      user
    })

})


export const toggleFollow = asyncHandler( async(req, res) => {
  
    const { targetUserId } = req.body;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString())
      throw new ApiError(400,"Cannot follow yourself" );

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser)
      throw new ApiError(404,"User not found" );

    let action = "";

    if (currentUser.following.includes(targetUserId)) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
      action = "unfollowed";
    } else {
      // Follow
      currentUser.following.addToSet(targetUserId);
      targetUser.followers.addToSet(currentUserId);
      action = "followed";

      // 🔔 Create notification only for "follow"
      const newNotification = await Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: "follow",
      });

      // 🔔 Emit notification in real-time if target user is online
      const receiverSocketId = getReceiverSocketId(targetUserId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("getNotification", newNotification);
      }
    }
    await currentUser.save();
    await targetUser.save();

    return res.json({
      action,
      currentUserFollowing: currentUser.following,
      targetUserFollowers: targetUser.followers,
    });
});


export const getFollowers = asyncHandler( async(req, res) => {

    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query

    const user = await User.findById(userId)
      .populate({
        path: "followers",
        select: "_id name userName profilePicture isVerified",
        options: {
          skip: (page - 1) * parseInt(limit),
          limit: parseInt(limit),
        },
      })

    if (!user) {
      throw new ApiError(404, "User not found" )
    }

    return res.status(200).json({
      message: "Followers fetched successfully",
      followers: user.followers,
    })
})



export const getFollowing = asyncHandler( async (req, res) => {
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query

    const user = await User.findById(userId)
      .populate({
        path: "following",
        select: "_id name userName profilePicture isVerified",
        options: {
          skip: (page - 1) * parseInt(limit),
          limit: parseInt(limit),
        },
      })

    if (!user) {
      throw new ApiError(404, "User not found" )
    }

    return res.status(200).json({
      message: "Following fetched successfully",
      following: user.following,
    })
})