import express from "express"
import { getNotifications, readNotifications } from "../controllers/notification.controller.js";
import {authenticate} from "../middlewares/auth.middleware.js"

const notiRouter = express.Router();


notiRouter.get("/getNoti", authenticate, getNotifications)
notiRouter.put("/read", authenticate, readNotifications);

export default notiRouter;