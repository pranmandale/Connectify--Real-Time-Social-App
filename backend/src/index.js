
import dotenv from "dotenv"
import connectDB from "./db/connection.js"
import errorHandler from "./middlewares/errorHandler.js";


// import app + server from app.js
import { app, server } from "./socketIO/Server.js";

// import routes
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import storyRouter from "./routes/story.route.js";
import likeRoute from "./routes/like.route.js";
import commentRoute from "./routes/comment.route.js";
import messageRoute from "./routes/message.route.js"
import notificationRoute from "./routes/notification.route.js"


dotenv.config();
const PORT = process.env.PORT;

// register routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/story", storyRouter);
app.use("/api/v1/like", likeRoute);
app.use("/api/v1/comment", commentRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/notifications", notificationRoute)

// error handling middleware
app.use(errorHandler);

// start server
server.listen(PORT, () => {
  connectDB();
  console.log(`✅ Server running on http://localhost:${PORT}`);
});