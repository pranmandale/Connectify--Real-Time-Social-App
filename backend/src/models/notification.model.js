import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
     recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who receives it
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },   // who triggered it
    type: { type: String, enum: ["follow", "comment", "like"], required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // optional (for comment/like)
    isRead: { type: Boolean, default: false }, // for unread indicator
},
 { timestamps: true }
)

export default mongoose.model("Notification", notificationSchema);