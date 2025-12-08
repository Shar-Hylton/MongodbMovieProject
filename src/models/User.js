const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    username: {
        type: String,
        required: true,
        trim: true,
        lowerCase: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    }


},{timestamps: true})

module.exports = mongoose.model("User", userSchema);