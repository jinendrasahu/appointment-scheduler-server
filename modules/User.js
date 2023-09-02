const { User } = require("../models/UserModel");

// this will return guests excluding the host because he is already added as guest at the time of meeting creation
module.exports.getUsers = async (req, res) => {
    try {
        let users = await User.find({
            isVarified:true,
                    isActive: true,
                    $expr: { $ne: [{$toString:"$_id"}, req.user._id.toString()] },

                },{
                    username:1,email:1,_id:1
                }
        );
        if (users) {
            return res.status(200).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: true,
                message: "User fetched successfully.",
                data: users
            });
        } else {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Failed to get users."
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

module.exports.updateUserName = async (req, res) => {
    try {
        if (!req.body.username || !req.body.username.toString().trim()) {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Invalid user name."
            });
        }

        let user = await User.findOneAndUpdate({ isVarified:true,_id: req.user._id }, { $set: { username: req.body.username.toString().trim() } }, { upsert: false, new: true });
        if (user) {
            return res.status(200).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: true,
                message: "User name updated successfully.",
                data: user
            });
        } else {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Failed to udate user name."
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