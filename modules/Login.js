const dotenv = require("dotenv");
dotenv.config();
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.SECRET_KEY);
const { User } = require("../models/UserModel");

// login to user account if user is registered and verified
module.exports.Login = async (req, res) => {
try{
    if (!req.body.email || !req.body.email.toString().trim()) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Please enter valid email address."
        });
    }
    if (!req.body.password || !req.body.password.toString().trim()) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Password is required."
        });
    }
    let condition = {
        email: req.body.email.toString().trim()
    }
    let isUserDataExist = await User.findOne(condition);
    if (isUserDataExist && isUserDataExist._id && isUserDataExist.isVarified) {
        if (cryptr.decrypt(isUserDataExist.password) !== req.body.password.toString().trim()) {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Invalid email or password."
            });
        }
        let num = Math.random();
        num = num < 0.1 ? num + 0.1 : num;
        let generateOTP = Math.floor(num * Math.pow(10, 14));

        let tokenObj = {
            uid: isUserDataExist._id.toString(),
            token: generateOTP
        }
        let token = cryptr.encrypt(JSON.stringify(tokenObj));
        let updateData = { $set: { token, updated: Date.now() } }
        let user = await User.findOneAndUpdate(condition, updateData, { new: true, upsert: false });
        if (user && user._id) {
            return res.status(200).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: true,
                token: token,
                email: user.email,
                message: "User logged in successfully."
            });
        } else {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Please try again."
            });
        }
    } else {

        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "User not registered."
        });
    }
}catch(err){
    return res.status(400).json({
        timestamp: Math.floor(Date.now() / 1000),
        success: false,
        message: err.message
    });
}
}