import express from "express"
import { authenticate } from "../middlewares/auth.middleware.js";
import { getPostLikes, likePost } from "../controllers/like.controller.js";

const likeRoute = express.Router();


likeRoute.post("/post/:postId/like", authenticate, likePost);
likeRoute.get('/post/:postId/getLikes', authenticate, getPostLikes)

export default likeRoute;