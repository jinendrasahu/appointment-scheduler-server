const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

let mail = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: "587",
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports.sendVarificationMail = function (request, response) {
    let options = {
        from: process.env.USER_EMAIL,
        to: request.body.email.toString().trim(),
        subject: "Email Varification OTP",
        html: "<div style='min-height:200px;padding:1em;background:#EBC7E8;font-family: Arial, Helvetica, sans-serif;width:100%;height:100%;text-align:center;color:#645CAA;'><h2>Email Varification OTP For Task Manager</h2><span style='background:#645CAA;color:white;border-radius:0.5em;padding:1em;'>" + request.code + "</span></div>"
    }
    mail.sendMail(options, (err, res) => {
        if (err) {
            response.status(400).json({
                timestamp: Math.floor(Date.now() / 1000),
                suceess: false,
                message: err.message
            });
        } else {
            response.status(200).json({
                timestamp: Math.floor(Date.now() / 1000),
                suceess: true,
                message: "OTP Sent Successfully"
            });
        }
    });
}
