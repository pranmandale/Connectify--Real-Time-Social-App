import express from "express"
import {authenticate} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.js";
import {deletePost, getAllPost, getAllSuggestedPosts, getPostById, updatePost, uploadPost} from "../controllers/post.controller.js"

const postRoute = express.Router();

postRoute.post("/post/upload",authenticate, upload.array("media", 5), uploadPost); //upload post done by form data
postRoute.get("/post/get-all", authenticate, getAllPost);  //done
postRoute.get("/posts/:postId", authenticate, getPostById); //done
postRoute.put("/posts/:postId",authenticate,upload.single("media"),updatePost); //done
postRoute.delete("/posts/:postId", authenticate, deletePost); //done
postRoute.get('/post/getSuggested', authenticate, getAllSuggestedPosts);


export default postRoute;