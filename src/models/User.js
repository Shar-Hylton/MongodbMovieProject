const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        lowerCase: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    }


},{timestamps: true})

let User = module.exports = mongoose.model("User", userSchema);