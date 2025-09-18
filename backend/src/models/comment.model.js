import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentableId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "commentableType", // Post | Story | Reel
    },
    commentableType: {
      type: String,
      required: true,
      enum: ["Post", "Story", "Reel"],
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: like count
commentSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual: replies (dynamic)
commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
