import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"




const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,   
    },
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim : true
    },
    password : {
        type: String,
        required: true,
    },
    followers : [
        {type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
     following : [
        {type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
     ],
    posts : [
        {type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    savedPosts : [
        {type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    profilePicture : {
        type: String,
        default: ""
    },
    bio : {
        type: String,
        default: ""
    },
    website : {
        type: String,
        default: ""
    },
    location : {
        type: String,
        default: ""
    },
    isVerified : {
        type: Boolean,
        default: false
    },
    reels : [
        {type: mongoose.Schema.Types.ObjectId,
            ref: "Reel"
        }   
    ],
    stories : [
        {type: mongoose.Schema.Types.ObjectId,
            ref: "Story"    
        }
    ],
}, {timestamps: true});


userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

// generating token
userSchema.methods.generateToken =  function() {
    const token =  jwt.sign({_id : this._id}, process.env.JWT_SECRET, {expiresIn: '10m'});
    return token;
}    

// generate long lived refresh token 
userSchema.methods.generateRefreshToken = function () {
    const refreshToken = jwt.sign({_id : this._id}, process.env.JWT_REFRESH_SECRET, {expiresIn: "10y"});
    return refreshToken;
}

// static method for finding user by refresh token
userSchema.statics.findByRefreshToken = function (token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        return this.findById(decoded._id)
    } catch(error) {
        return null;
    }
}


const User = mongoose.model("User", userSchema);

export default User;