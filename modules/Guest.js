const { Types } = require("mongoose");
const { Leave } = require("../models/LeaveModel");
const { Meeting } = require("../models/MeetingModel");

// add guest if guest is not in leave in that perticular hour
module.exports.addGuest = async (req, res) => {
    try {
        if (!req.body.meeting_id || !req.body.meeting_id.toString().trim()) {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Meeting is required."
            });
        }
        if (!req.body.guest_id || !req.body.guest_id.toString().trim()) {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Guest is required."
            });
        }
        if (req.user._id.toString() === req.body.guest_id.toString().trim()) {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Host cannot be guest."
            });
        }
        let meeting = await Meeting.findOne({ isActive: true, _id: new Types.ObjectId(req.body.meeting_id.toString().trim()) });
        if (!meeting) {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Invalid Meeting."
            });
        }
        if(meeting.guests.find((guest)=>guest===req.body.guest_id.toString().trim())){
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Guest already added in the meeting."
            });
        }
        let condition = {
            isActive: true,
            expired: false,
            user: new Types.ObjectId(req.body.guest_id.toString().trim()),
            $or: [{ $and: [{ $start: { $lte: meeting.start } }, { $end: { $gte: meeting.end } }] },
            { $and: [{ $start: { $lte: meeting.start } }, { $end: { $gte: meeting.start } }] },
            { $and: [{ $start: { $lte: meeting.end } }, { $end: { $gte: meeting.end } }] }]
        }
        let guestLeaves = await Leave.findOne(condition);
        if (guestLeaves) {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: `Guest is not available his status is ${guestLeaves.title}`
            });
        }
        let addGuest = await Meeting.findOneAndUpdate({ isActive: true, _id: new Types.ObjectId(req.body.meeting_id.toString().trim()) },
        {$push:{"guests":req.body.guest_id.toString().trim()}},{ upsert: false, new: true });
        
        if (!addGuest) {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Failed to add guest"
            });
        }
        return res.status(200).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: true,
            message: `Guest added successfully`
        });
    } catch (err) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: err.message
        });
    }
}