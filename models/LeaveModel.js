const mongoose = require("mongoose");

const leave = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    start: {
        type: Date,
        required:true
    },
    end: {
        type: Date,
        required:true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expired: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

module.exports.Leave = mongoose.model("Leave", leave);