import User from "../models/user.model.js"



export const signUp = async (req, res) => {
    try {
        const { name, userName, email, phone, password } = req.body;

        if (!name || !userName || !email || !phone || !password) {
            return res.status(400).json({ message: "All fields are required" });
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
            return res.status(400).json({ message: "User already exists, please login" });
        }

        const newUser = await User.create({ name, userName, email, phone, password });

        const accessToken = await newUser.generateToken();
        const refreshToken = await newUser.generateRefreshToken();


        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // use secure cookies in production
            sameSite: "Strict",
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000 // 10 years
        });

        return res.status(201).json({
            message: "User created successfully",
            accessToken,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const login = async (req, res) => {
    try{
        const {identifier, password} = req.body;

        if(!identifier || !password) {
            return res.status(400).json({
                message: "all fields are required"
            })
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
            return res.status(400).json({
                message: "user not found!"
            })
        }

        const isPasswordMatch = await user.comparePassword(password);
        if(!isPasswordMatch) {
            return res.status(400).json({
                message: "user not found!!"
            })
        }

         const accessToken = await user.generateToken();
        const refreshToken = await user.generateRefreshToken();


        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // use secure cookies in production
            sameSite: "Strict",
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000 // 10 years
        });

        return res.status(200).json({
            message:" login successful",
            accessToken
        })
    } catch(error) {
        return res.status(500).json({
            message: "Internal server error during login"
        })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict" // fixed: added quotes
        });

        return res.status(200).json({
            message: "Logout successful"
        });
    } catch (error) {
        console.error(error); // log error to see what went wrong
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(200).json({
        accessToken: null,
        message: "No refresh token provided",
      });
    }

    const user = await User.findByRefreshToken(token);
    if (!user) {
      return res.status(200).json({
        accessToken: null,
        message: "User not found or token invalid",
      });
    }

    const accessToken = await user.generateToken();

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    // console.error("Refresh token error:", error); // Log server-side
    return res.status(500).json({
      accessToken: null,
      message: "Internal server error",
    });
  }
};

