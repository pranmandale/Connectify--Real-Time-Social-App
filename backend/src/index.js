import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connection.js';
import cookieParser from "cookie-parser"
import cors from "cors"

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// middlewares
app.use(express.json());
app.use(cors({
  origin : "http://localhost:5173",
  credentials : true,
}));
app.use(cookieParser())



// importing auth routes
import authRoute from "./routes/auth.route.js"
app.use('/api/v1/auth', authRoute);

// importing user routes which has tokens
import userRoute from './routes/user.route.js';
app.use('/api/v1/user', userRoute);


// import post routes 
import postRoute from './routes/post.route.js';
app.use('/api/v1/post', postRoute);


// import like routes
import likeRoute from './routes/like.route.js';
app.use('/api/v1/like', likeRoute)


app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
