const mongoose = require('mongoose');
require("dotenv").config();

const connectDB = async() => {

    try {
        console.log("Trying to connect to the database")
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        console.log("Connection was successful");
    } catch (error) {
        console.error(`Failed to connect to database: ${error}`)
        process.exit(1);
    }
}

module.exports = connectDB;
