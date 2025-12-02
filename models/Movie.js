const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    name: String,
    description: String,
    year: Number,
    genres: [String],
    rating: Number,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    extraField: String   // your allowed extra field
});

module.exports = mongoose.model("Movie", movieSchema);
