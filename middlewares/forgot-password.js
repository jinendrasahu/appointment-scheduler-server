const dotenv = require("dotenv");
dotenv.config();
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.SECRET_KEY);
const { User } = require("../models/UserModel");

module.exports.forgotPassword = async (req, res, next) => {
    try {
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
        if (!req.body.confirmpassword || !req.body.confirmpassword.toString().trim()) {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Confirm password is required."
            });
        }
        if (req.body.password.toString().trim() !== req.body.confirmpassword.toString().trim()) {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Password and confirm password should be same."
            });
        }
        if (req.body.password.toString().trim().length < 8) {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Password length cannot be less than 8 digit."
            });
        }

        let num = Math.random();
        num = num < 0.1 ? num + 0.1 : num;
        let generateOTP = Math.floor(num * Math.pow(10, 6));
        let token = cryptr.encrypt(generateOTP);
        let condition = {
            email: req.body.email.toString().trim()
        }
        let isUserDataExist = await User.findOne(condition);
        
        if (isUserDataExist && isUserDataExist._id && isUserDataExist.isVarified) {
            let updateData = { $set: { token, tempPassword: cryptr.encrypt(req.body.password.toString().trim()), updated: Date.now() } }
            let user = await User.findOneAndUpdate(condition, updateData, { new: true, upsert: false });
            if (user && user._id) {
                req.code = generateOTP;
                next();
            } else {
                return res.status(400).json({
                    timestamp: Math.floor(Date.now() / 1000),
                    success: false,
                    message: "Failed to save user data.Try again"
                });
            }

        } else {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Invalid User."
            });
        }
    } catch (err) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: err.message
        });
    }

}