import express from "express"
import { editProfile, fetchProfile, getFollowers, getFollowing, getProfileByParams, suggestedUsers, toggleFollow } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";

const userRoute = express.Router();

userRoute.get('/profile', authenticate ,fetchProfile);
userRoute.get('/suggested-users', authenticate, suggestedUsers);
userRoute.put('/edit-profile', authenticate,upload.single("profilePicture"), editProfile);
userRoute.get('/get-profile/:userName',authenticate, getProfileByParams);
userRoute.post('/followUser', authenticate, toggleFollow);
userRoute.get('/getFollowers/:userId', authenticate, getFollowers);
userRoute.get('/getFollowing/:userId', authenticate, getFollowing);

export default userRoute;