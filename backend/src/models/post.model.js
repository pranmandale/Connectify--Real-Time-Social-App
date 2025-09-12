import mongoose from 'mongoose';


const postSchema = new mongoose.Schema({
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
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: []
    }
  ]
}, { timestamps: true });


const Post = mongoose.model('Post', postSchema);

export default Post;