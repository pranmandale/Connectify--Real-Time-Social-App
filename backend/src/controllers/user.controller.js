import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js"

export const fetechProfile = async (req, res) => {
  try {
    const user = req.user;
    await user.populate("posts");
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Remove password before sending
    const { password, ...userData } = user.toObject();


    return res.status(200).json({
      message: "User fetched successfully",
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const suggestedUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id }
    }).select("-password");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({
      message: "Users fetched successfully",
      users
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const editProfile = async (req, res) => {
  try {
    const { name, userName, bio, gender, location, website } = req.body;

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }


    if (userName) {
      const existingUser = await User.findOne({ userName }).select("_id");
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Username already in use" });
      }
    }

    let profileImage = user.profilePicture;

    if (req.file) {
      try {
        profileImage = await uploadOnCloudinary(req.file.path);
      } catch (cloudErr) {
        console.error("Cloudinary upload failed:", cloudErr);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }


    user.name = name || user.name;
    user.userName = userName || user.userName;
    user.profilePicture = profileImage || user.profilePicture;
    user.bio = bio ?? user.bio;
    // user.gender = gender ?? user.gender;
    user.gender = Array.isArray(gender) ? gender[0] : gender ?? user.gender;
    user.location = location ?? user.location;
    user.website = website ?? user.website;

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
  } catch (error) {
    console.error("Edit Profile Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getProfileByParams = async (req, res) => {
  try {
    const userName = req.params.userName;
    const user = await User.findOne({ userName }).select("-password").populate("posts");

    if (!user) {
      return res.status(400).json({
        message: "user not found"
      })
    }

    return res.status(200).json({
      message: "user fetched successfully",
      user
    })
  } catch (error) {
    return res.status(400).json({
      message: "Internal server error",
      error
    })
  }
}




export const toggleFollow = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user._id; // from auth middleware

    if (targetUserId === currentUserId.toString())
      return res.status(400).json({ message: "Cannot follow yourself" });

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser)
      return res.status(404).json({ message: "User not found" });

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
    }

    await currentUser.save();
    await targetUser.save();

    return res.json({
      action, // "followed" or "unfollowed"
      currentUserFollowing: currentUser.following, // send updated list
      targetUserFollowers: targetUser.followers,   // send updated list
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
