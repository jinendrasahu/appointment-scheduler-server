const dotenv = require("dotenv");
dotenv.config();
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.SECRET_KEY);
const { User } = require("../models/UserModel");

module.exports.updatePassword = async (req, res, next) => {
    try{
    if (!req.body.email || !req.body.email.toString().trim()) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Please enter valid email address."
        });
    }
    if (!req.body.code || req.body.code.toString().trim().length !== 6) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "OTP is required."
        });
    }
    
    let condition = {
        email: req.body.email.toString().trim()
    }
    let isUserDataExist = await User.findOne(condition);
    if (isUserDataExist && isUserDataExist._id && isUserDataExist.tempPassword!=="") {
        if (cryptr.decrypt(isUserDataExist.token) === req.body.code.toString().trim()) {
            let currentTimestamp = new Date();
            let otpTimestamp = new Date(isUserDataExist.updated);
            let dateDiff = currentTimestamp - otpTimestamp;
            console.log(dateDiff, dateDiff / 1e3)
            if (dateDiff < 1e3 || (Math.floor(dateDiff / 1e3) <= 60)) {
                let updateData = { $set: { password: isUserDataExist.tempPassword,tempPassword:"", updated: Date.now() } }
                let user = await User.findOneAndUpdate(condition, updateData, { new: true, upsert: false });
                if (user && user._id) {
                    return res.status(200).json({
                        timestamp: Math.floor(Date.now() / 1000),
                        success: true,
                        message: "User password updated successfully."
                    });
                } else {
                    return res.status(400).json({
                        timestamp: Math.floor(Date.now() / 1000),
                        success: false,
                        message: "Failed to update user password."
                    });
                }
            } else {
                return res.status(400).json({
                    timestamp: Math.floor(Date.now() / 1000),
                    success: false,
                    message: "OTP Expired"
                });
            }
        } else {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Invalid OTP."
            });
        }

    } else {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Invalid email id."
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