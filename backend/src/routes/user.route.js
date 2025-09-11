import express from "express"
import { editProfile, fetechProfile, getProfileByParams, suggestedUsers } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";

const userRoute = express.Router();

userRoute.get('/profile', authenticate ,fetechProfile);
userRoute.get('/suggested-users', authenticate, suggestedUsers);
userRoute.post('/edit-profile', authenticate,upload.single("profileImage"), editProfile);
userRoute.get('/get-profile/:userName',authenticate, getProfileByParams);

export default userRoute;