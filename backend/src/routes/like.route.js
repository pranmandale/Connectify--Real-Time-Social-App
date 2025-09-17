import express from "express"
import { authenticate } from "../middlewares/auth.middleware.js";
import {  getUsersWhoLikedPost, getUserWhoLikedStory, likePost, likeStory } from "../controllers/like.controller.js";

const likeRoute = express.Router();

// post routes
likeRoute.post("/post/like/:postId", authenticate, likePost);
// likeRoute.get('/post/getLikes/:postId', authenticate, getPostLikes)
likeRoute.get('/post/getUserWhoLiked/:postId', authenticate, getUsersWhoLikedPost);

// story routes
likeRoute.post('/story/like/:storyId', authenticate, likeStory);
likeRoute.get('/story/getUserWhoLikedStory/:storyId', authenticate, getUserWhoLikedStory);


export default likeRoute;