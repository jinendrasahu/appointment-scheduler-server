const dotenv = require("dotenv");
const cors = require("cors");
const { mongoose } = require("./db");
const express = require("express");
const { register } = require("./middlewares/register");
const { varifyOtp } = require("./modules/VarifyOtp");
const { Login } = require("./modules/Login")
const { sendVarificationMail } = require("./modules/SendVarificationMail");
const { varifyToken, tokenVerified } = require("./middlewares/varifyToken");
const { markOff, getLeaves } = require("./modules/MarkOff");
const { forgotPassword } = require("./middlewares/forgot-password");
const { updatePassword } = require("./middlewares/update-password");
const { unmarkOff } = require("./modules/UnmarkOff");
const { scheduleMeeting, deleteMeeting, getMeetings, getMeeting } = require("./modules/Meeting");
const { getUsers, updateUserName } = require("./modules/User");
const { addGuest } = require("./modules/Guest");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.listen(process.env.PORT || 3000, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Server connected");
    }
});


app.post("/register", register, sendVarificationMail);
app.post("/forgot-password", forgotPassword,sendVarificationMail);
app.post("/update-password", updatePassword);
app.post("/resendotp", register, sendVarificationMail);
app.post("/varify", varifyOtp);
app.get("/verifytoken", varifyToken,tokenVerified);
app.post("/login", Login);

app.post("/mark-off", varifyToken, markOff);
app.get("/get-off-datetime", varifyToken, getLeaves);
app.post("/unmark-off", varifyToken, unmarkOff);

app.post("/schedule-meeting", varifyToken, scheduleMeeting);
app.get("/get-meetings", varifyToken, getMeetings);
app.delete("/delete-meeting", varifyToken, deleteMeeting);
app.get("/get-meeting/:id", varifyToken, getMeeting);

app.get("/get-guests", varifyToken, getUsers);
app.post("/update-username", varifyToken, updateUserName);
app.post("/add-guest", varifyToken, addGuest);
