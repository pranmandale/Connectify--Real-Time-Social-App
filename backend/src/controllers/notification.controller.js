import Notification from "../models/notification.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"

export const getNotifications = asyncHandler( async(req, res) => {

    const userId = req.user._id;

    const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "userName profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Notifications fetched successfully",
      notifications,
    });
});



export const readNotifications = asyncHandler( async(req, res) => {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      message: "All notifications marked as read",
    });
 
});
