const mongoose = require("mongoose");

const meeting = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    agenda: {
        type: String,
        require: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    guests: {
        type: Array,
        default: []
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
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

module.exports.Meeting = mongoose.model("Meeting", meeting);