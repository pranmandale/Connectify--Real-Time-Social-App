import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connection.js';
import cookieParcer from "cookie-parser"
import cors from "cors"

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// middlewares
app.use(express.json());
app.use(cors({
  origin : "http://localhost:5173",
  withCredentials: true
}));
app.use(cookieParcer())



// importing auth routes
import authRoute from "./routes/auth.route.js"
app.use('/api/v1/auth', authRoute);

// importing user routes which has tokens
import userRoute from './routes/user.route.js';
app.use('/api/v1/user', userRoute);


app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
