const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
mongoose.connect(process.env.DATABASE_CONNECTION_STRING,
    {
        useNewURLParser: true,
        useUnifiedTopology: true
    }, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Database connected");
        }
    }
);
module.exports.mongoose = mongoose;