import express from "express";
import {authenticate} from "../middlewares/auth.middleware.js"
import { deleteStory, getAllStories, getStoryById, getUserStories, markStoryViewed, uploadStory } from "../controllers/story.controller.js";
import { upload } from "../middlewares/multer.js";

const storyRouter = express.Router();

storyRouter.post('/uploadStory', upload.single("storyMedia"),authenticate, uploadStory);
// get particualr users story
storyRouter.get('/user/:userId', authenticate, getUserStories);
storyRouter.get('/getAllStories', authenticate, getAllStories);
storyRouter.delete('/deleteStory/:storyId', authenticate, deleteStory);
storyRouter.put('/view/:storyId', authenticate, markStoryViewed);
// get Story details
storyRouter.get('/getStoryDetails/:storyId', authenticate, getStoryById);

export default storyRouter;