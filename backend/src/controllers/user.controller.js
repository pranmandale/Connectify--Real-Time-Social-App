import User from "../models/user.model.js";

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
