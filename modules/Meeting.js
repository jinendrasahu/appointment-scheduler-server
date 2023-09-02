const { Types } = require("mongoose");
const { Meeting } = require("../models/MeetingModel");
const { User } = require("../models/UserModel");
// user itself added as guest
module.exports.scheduleMeeting = async (req, res) => {
    try{
    if (!req.body.start || !req.body.start.toString().trim()) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Start time is required."
        });
    }
    if (!req.body.end || !req.body.end.toString().trim()) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "End time is required."
        });
    }
    if (!req.body.title || !req.body.title.toString().trim()) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Title is required."
        });
    }
    if (!req.body.agenda || !req.body.agenda.toString().trim()) {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Agenda is required."
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

    let data = {
        start: new Date(req.body.start.toString().trim()),
        end: new Date(req.body.end.toString().trim()),
        title: req.body.title.toString().trim(),
        agenda: req.body.agenda.toString().trim(),
        guests: [req.user._id.toString()],
        host: req.user._id
    }
    let meeting = await Meeting.create(data);
    if (meeting) {
        return res.status(200).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: true,
            message: "Meeting scheduled successfully.",
            data: meeting
        });
    } else {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Failed to schedule meeting."
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

// all meeting in which user is added will get return
module.exports.getMeetings = async (req, res) => {
    try{
    let meetings = await Meeting.aggregate([
        {
            $match: {
                isActive: true,
                $expr: { $in: [req.user._id.toString(),"$guests"] },

            }
        },
        {
            $lookup: {
                from:"users",
                localField:"host",
                foreignField:"_id",
                as:"hostData",
            }
        },
        {
            $project: {
                title: 1,
                agenda: 1,
                start:1,
                end:1,
                "hostName": {
                    $arrayElemAt:["$hostData.username",0]
                },
                "hostEmail": {
                    $arrayElemAt:["$hostData.email",0]
                },
                
                isHost:{
                    $cond:{
                        if:{$eq:[{$toString:"$host"},req.user._id.toString()]},
                        then:true,
                        else : false
                    }
                }
            }
        }
    ]);
    if (meetings) {
        return res.status(200).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: true,
            message: "Meeting fetched successfully.",
            data: meetings
        });
    } else {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Failed to get meeting."
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

// only host can delete the meeting
module.exports.deleteMeeting = async (req, res) => {
    try{
    let meeting = await Meeting.findOneAndUpdate({isActive:true,host:req.user._id,_id:new Types.ObjectId(req.body.id)},{$set:{isActive:false}},{ upsert: false, new: true });
    if (meeting) {
        return res.status(200).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: true,
            message: "Meeting deleted successfully.",
            data: meeting
        });
    } else {
        return res.status(400).json({
            timestamp: Math.floor(Date.now() / 1000),
            success: false,
            message: "Failed to delete meeting."
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

module.exports.updateMeeting = async (req, res) => {
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
    let leave = await Leave.findOneAndUpdate(data, update, { upsert: false });
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


module.exports.getMeeting = async (req, res) => {
    try {
        if (!req.params.id || !req.params.id.toString().trim()) {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Meeting is required."
            });
        }
        
        let meeting = await Meeting.findOne({ isActive: true, _id: new Types.ObjectId(req.params.id.toString().trim()) });
        
        if (!meeting) {
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Invalid Meeting."
            });
        }
        if(!meeting.guests.find((guest)=>guest===req.user._id.toString())){
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Invalid Permissions."
            });
        }
        let users = await User.find({isVarified:true,isActive:true,$expr:{$in:[{$toString:"$_id"},meeting.guests]}},{username:1,email:1});
        if (users) {
            return res.status(200).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: true,
                message: `Meeting fetched successfully`,
                data:{
                    title:meeting.title,
                    agenda:meeting.agenda,
                    start:meeting.start,
                    end:meeting.end,
                    guests:users
                }
            });
        }else{
            return res.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                success: false,
                message: "Failed to fetch Meeting"
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