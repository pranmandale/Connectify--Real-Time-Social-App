import express from "express";
import { addComment, deleteComment, getComments, replyComment } from "../controllers/comment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const commentRoute = express.Router();




commentRoute.post('/addComment/:contentType/:contentId', authenticate, addComment);
commentRoute.post('/replyComment/:commentId', authenticate, replyComment)
commentRoute.get('/getComments/:contentType/:contentId', authenticate, getComments);
commentRoute.delete('/deleteComment/:commentId', authenticate, deleteComment)

export default commentRoute;