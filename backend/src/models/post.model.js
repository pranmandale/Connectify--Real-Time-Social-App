import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', 'text'],
      required: true,
    },
    mediaUrl: [{
      type: String,
      required: true
    }],
    caption: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
        default: []
      }
    ]
  },
  { 
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
  }
);

// Virtual: dynamically populate top-level comments
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "commentableId",
  justOne: false,
  match: { parentComment: null }
});

const Post = mongoose.model('Post', postSchema);

export default Post;
