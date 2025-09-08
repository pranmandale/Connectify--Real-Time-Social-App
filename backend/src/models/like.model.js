import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likeableId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "likeableType",
    },
    likeableType: {
      type: String,
      required: true,
      enum: ["Post", "Reel", "Story", "Comment"],
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate likes
likeSchema.index({ author: 1, likeableId: 1, likeableType: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);
export default Like;
