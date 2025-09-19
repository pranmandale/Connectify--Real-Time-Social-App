import express from "express";
import { getMessage, markAsRead, sendMessage } from "../controllers/message.controller.js";
import {authenticate} from "../middlewares/auth.middleware.js"

const messageRoute = express.Router();

messageRoute.get('/getMessages/:roomId', authenticate, getMessage)
messageRoute.post('/sendMessage',authenticate, sendMessage)
messageRoute.put('/markRead',authenticate, markAsRead)

export default messageRoute;