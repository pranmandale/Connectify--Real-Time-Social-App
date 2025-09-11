import express from "express"
import { fetechProfile, suggestedUsers } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const userRoute = express.Router();

userRoute.get('/profile', authenticate ,fetechProfile);
userRoute.get('/suggested-users', authenticate, suggestedUsers)


export default userRoute;