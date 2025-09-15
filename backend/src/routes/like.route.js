import express from "express"
import { authenticate } from "../middlewares/auth.middleware.js";
import { getPostLikes, getUsersWhoLikedPost, likePost } from "../controllers/like.controller.js";

const likeRoute = express.Router();


likeRoute.post("/post/like/:postId", authenticate, likePost);
likeRoute.get('/post/getLikes/:postId', authenticate, getPostLikes)
likeRoute.get('/post/getUserWhoLiked/:postId', authenticate, getUsersWhoLikedPost);

export default likeRoute;