const mongoose = require('mongoose');
require("dotenv").config()

exports.connectDB = () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Database Connection established")
    })
    .catch((err) => {
        console.error(err)
        console.log("Connection Issues with Database");
        process.exit(1);
    })
}