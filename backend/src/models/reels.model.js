import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    mediaUrl: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
    },
    likes: [
        { type: mongoose.Schema.Types.ObjectId,
          ref: "Like",
          default: []
        }
    ],
    comments: [
        { type: mongoose.Schema.Types.ObjectId,
          ref: "Comment",
          default: []
        }
    ]
}, { timestamps: true });

const Reel = mongoose.model('Reel', reelSchema);

export default Reel;
