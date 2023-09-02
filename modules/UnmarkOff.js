const { Types } = require("mongoose");
const { Leave } = require("../models/LeaveModel");

module.exports.unmarkOff = async (req, res) => {
    try{
    if (!req.body.id || !req.body.id.toString().trim()) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Invalid off time id."
        });
    }

    let data = {
        _id: new Types.ObjectId(req.body.id.toString().trim()),
        isActive:true
    }
    let update = {
        $set: {
            isActive: false,
            updated: new Date()
        }
    };
    let leave = await Leave.findOneAndUpdate(data, update, { upsert: false ,new:true});
    if (leave) {
        return res.status(200).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: true,
            message: "Off time unmarked successfully.",
            data: leave
        });
    } else {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Failed to unmark off time."
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
