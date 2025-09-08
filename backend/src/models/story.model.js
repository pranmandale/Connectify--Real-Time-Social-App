import mongoose from 'mongoose';


const storySchema = new mongoose.Schema ({
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    }, 
    mediaType : {
        type : String,
        enum : ['image', 'video', 'text'],
        required : true
    },
    mediaUrl : {
        type : String,
        required : true
    },
    duration : {
        type : Number,
    },
    viewers : [
        { type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: []
        }
    ],

    createdAt : {
    type: Date,
    default: Date.now,
    expires: 86400 // Story expires after 24 hours (86400 seconds)
    },
}, { timestamps: true });

const Story = mongoose.model('Story', storySchema);

export default Story;
