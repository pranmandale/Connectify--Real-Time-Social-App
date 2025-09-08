import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connection.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;



app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
