import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js"

export const fetechProfile = async (req, res) => {
    try {
        const user = req.user; 

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


export const editProfile = async(req, res) => {
    try {
        const {name , userName, bio, gender, location, website} = req.body;
        const user = req.user;
        if(!user) {
            return res.status(400).json({
                message : "user not found"
            })
        }
        const userWithAlreadyExistUserName = await User.findOne({userName}).select("-password");
        if(userWithAlreadyExistUserName && userWithAlreadyExistUserName._id !== user._id) {
            return res.status(400).json({
                message : "user with this name already exist!"
            })
        }

        let profileImage = "";
        if(req.file) {
            profileImage = await uploadOnCloudinary(req.file.path);
        }
        user.name = name;
        user.userName = userName;
        user.profilePicture = profileImage
        user.bio = bio;
        user.gender = gender;
        user.location = location;
        user.website = website;

        await user.save();

        return res.status(200).json({
            message : "user updated successfully",
            user
        })

    } catch(error) {
        return res.status(400).json({
            message : "Internal server error",
            error
        })
    }
}

export const getProfileByParams = async (req, res) => {
    try {
        const userName = req.params.userName;
        console.log(userName)
        const user = await User.findOne({userName}).select("-password");

        if(!user) {
            return res.status(400).json({
                message : "user not found"
            })
        }

        return res.status(200).json({
            message : "user fetched successfully",
            user
        })
    } catch(error) {
        return res.status(400).json({
            message : "Internal server error",
            error
        })
    }
}
