import express from "express"
import { login, logout, refreshToken, resetPassword, sendOtp, signUp, verifyOtp } from "../controllers/auth.controllers.js"


const router = express.Router();


router.post('/signup', signUp);
router.post('/login', login);
router.get('/logout', logout);

router.post('/refresh-token', refreshToken);
router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
export default router;