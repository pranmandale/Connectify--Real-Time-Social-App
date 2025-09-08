import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Polymorphic target (can be Post, Reel, or Story)
    commentableId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "commentableType", // dynamic reference
    },
    // comments can be on post reel and story
    commentableType: {
      type: String,
      required: true,
      enum: ["Post", "Reel", "Story"],
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    // comments can have likes
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
        default: [],
      },
    ],

    // comments can have replies also
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: [],
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ✅ Virtual: count likes
commentSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
