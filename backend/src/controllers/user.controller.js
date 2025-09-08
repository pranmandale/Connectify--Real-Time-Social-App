import User from "../models/user.model.js";

export const fetechProfile = async (req, res) => {
    try{
        const user_id = req.user_id;
        const user = await User.findOne({user_id});
        if(!user) {
            return res.status(400).json({
                message: "user not exist"
            })
        }
        return res.status(202).json({
            message: "user fetched successfully",
            user
        })
    } catch(error) {
        return res.status(400).json({
            message: "internal server error",
            error
        })
    }
}