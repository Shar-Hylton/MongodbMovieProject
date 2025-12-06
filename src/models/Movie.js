const mongoose = require('mongoose');

const movieSchema = mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        lowerCase: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    year: {
        type: Number,
        min: 1990,
        max: new Date().getFullYear()
    },

    genres: {
        type: [String],
        required: true,
    },

    rating: {
        type: Number,
        min: 5
    },

    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }
}, {timestamps: true})

let Movie = module.exports = mongoose.model("Movie", movieSchema);

