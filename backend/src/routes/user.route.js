import express from "express"
import { fetechProfile } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const userRoute = express.Router();

userRoute.get('/profile', authenticate ,fetechProfile);


export default userRoute;