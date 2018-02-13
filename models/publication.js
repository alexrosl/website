var mongoose = require("mongoose");

var publicationSchema = new mongoose.Schema({
    name: String,
    createdAt: {type: Date, default: Date.now},
    description: String,
    link: String
})

module.exports = mongoose.model("Publication", publicationSchema);