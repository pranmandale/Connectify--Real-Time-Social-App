import User from "../models/user.model.js"
import sendMail from "../utils/Mail.js";
import {generateOtpHtml} from "../utils/OtpTemplate.js"
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"



export const signUp = asyncHandler( async (req, res) => {
   
        const { name, userName, email, phone, password } = req.body;

        if (!name || !userName || !email || !phone || !password) {
            throw new ApiError(400, "All fields are required" );
        }

        // Check if any user already exists with email, username, or phone
        const existingUser = await User.findOne({
            $or: [
                { email },
                { userName },
                { phone }
            ]
        });

        if (existingUser) {
            throw new ApiError(400, "User already exists, please login");
        }

        const newUser = await User.create({ name, userName, email, phone, password });

        const accessToken = await newUser.generateToken();
        const refreshToken = await newUser.generateRefreshToken();


        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // use secure cookies in production
            sameSite: "None",
            maxAge: 30 * 24 * 60 * 60 * 1000 ,
            path: "/",
        });

        return res.status(201).json({
            message: "User created successfully",
            accessToken,
        });
});

export const login =  asyncHandler (async(req, res) => {
    
        const {identifier, password} = req.body;

        if(!identifier || !password) {
            throw new ApiError(400,"all fields are required")
        }

        const user = await User.findOne({
            $or: [
                {
                    email : identifier
                },
                {
                    userName : identifier
                }
            ]
        })

        if(!user) {
            throw new ApiError(400, "invalid credentials")
        }

        const isPasswordMatch = await user.comparePassword(password);
        if(!isPasswordMatch) {
            throw new ApiError(400,"user not found!!")
        }

         const accessToken = await user.generateToken();
        const refreshToken = await user.generateRefreshToken();



        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // use secure cookies in production
            sameSite: "None",
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        return res.status(200).json({
            message:" login successful",
            accessToken
        })
})

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  });

  return res.status(200).json({
    message: "Logout successful",
  });
});


export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(401, "No refresh token provided");
  }

  const user = await User.findByRefreshToken(token);
  if (!user) {
    throw new ApiError(403, "Invalid or expired refresh token");
  }

  const accessToken = user.generateToken();

  return res.status(200).json({
    accessToken,
  });
});




export const sendOtp = asyncHandler( async (req, res) => {

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(200, "user not found" );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000; 
    user.isVerified = false;
    await user.save();

    const htmlTemplate = generateOtpHtml(otp, user.name);

    await sendMail(
      email,
      otp,
      "Your OTP Code - Connectify",
      htmlTemplate
    );

    return res.status(200).json({ message: "OTP sent successfully" });

    
 
});

export const verifyOtp = asyncHandler( async(req, res) => {
 
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ApiError(400, "Email and OTP are required" );
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(400, "User not exist");
    }

    if (user.resetOtp !== otp || user.otpExpire < Date.now()) {
      throw new ApiError(400, "Invalid or expired OTP");
    }

    user.isVerified = true;
    user.resetOtp = undefined;
    user.otpExpire = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
});


export const resetPassword = asyncHandler( async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(400).json({ message: "User not exist" });
    }

    if (!user.isVerified) {
      throw new ApiError(400).json({ message: "User is not verified" });
    }

    user.password = password;
    user.isVerified = false; // reset verification after password change
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
});







