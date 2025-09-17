import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    text: {
        type: String, // only required for text stories
    },

    backgroundColor: String,
    textColor: String,
    fontSize: String,
    textPosition: {
        x: { type: Number, default: 50 },
        y: { type: Number, default: 50 },
    },

    mediaType: {
        type: String,
        enum: ["image", "video", "text"],
        required: true,
    },
    mediaUrl: {
        type: String, // required only if type = image/video
    },

    duration: Number,

    viewedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: [],
        },
    ],

    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Like",
            default: [],
        },
    ],

    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: [],
        },
    ],

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // auto-delete after 24h
    },
}, { timestamps: true });

storySchema.pre(/^find/, function(next) {
    this.populate('author', 'name userName profilePicture');
    next();
});


const Story = mongoose.model('Story', storySchema);

export default Story;
