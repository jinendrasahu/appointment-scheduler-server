
const { Leave } = require("../models/LeaveModel");
const { Meeting } = require("../models/MeetingModel");

// mark off hours if start time and end time are not overlapping to other off hours or already scheduled meeting
module.exports.markOff = async (req, res) => {
    try{
    if (!req.body.start || !req.body.start.toString().trim()
        || !req.body.end || !req.body.end.toString().trim()
        || !req.body.title || !req.body.title.toString().trim()) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Start and end off date time and title is required."
        });
    }
    let timeDiff=(new Date(req.body.end.toString().trim()).getTime())-(new Date(req.body.start.toString().trim()).getTime());
    if (timeDiff<0) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "End date time should be greater than start date time."
        });
    }
    let start = new Date(req.body.start.toString().trim());
    let end = new Date(req.body.end.toString().trim());
    let condition = {
        isActive: true,
        expired: false,
        user: req.user._id,
        $or: [{ $and: [{ $start: { $lte: start } }, { $end: { $gte: end } }] },
        { $and: [{ $start: { $lte: start } }, { $end: { $gte: start } }] },
        { $and: [{ $start: { $lte: end } }, { $end: { $gte: end } }] }]
    }
    let guestLeaves = await Leave.findOne(condition);
    if (guestLeaves) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "You cannot mark off betweeh these two time interval it is already occupied."
        });
    }

    let conditionForMeeting = {
        isActive: true,
        $expr: {$in:[req.user._id.toString(),"$guests"]},
        $or: [{ $and: [{ $start: { $lte: start } }, { $end: { $gte: end } }] },
        { $and: [{ $start: { $lte: start } }, { $end: { $gte: start } }] },
        { $and: [{ $start: { $lte: end } }, { $end: { $gte: end } }] }]
    }
    let conflictedMeeting = await Meeting.findOne(conditionForMeeting);
    if (conflictedMeeting) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "You cannot mark off betweeh these two time interval you alreadt have a meeting."
        });
    }

    let data = {
        start: start,
        end: end,
        title: req.body.title.toString().trim(),
        user: req.user._id
    }
    let leave = await Leave.create(data);
    if (leave) {
        return res.status(200).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: true,
            message: "Off time marked successfully.",
            data: leave,
            condition
        });
    } else {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Failed to mark off time."
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
module.exports.getLeaves = async (req, res) => {
    try{
    let data = {
        user: req.user._id,
        isActive: true
    }
    let leaves = await Leave.find(data);
    if (leaves) {
        return res.status(200).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: true,
            message: "Off time fetched successfully.",
            data: leaves
        });
    } else {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Failed to get off times."
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