var mongoose = require("mongoose");

var materialSchema = new mongoose.Schema({
    name: String,
    createdAt: {type: Date, default: Date.now},
    images: Array,
    description: String,
    content: String
})

module.exports = mongoose.model("Material", materialSchema);