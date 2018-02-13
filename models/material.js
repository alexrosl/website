var mongoose = require("mongoose");

var materialSchema = new mongoose.Schema({
    name: String,
    createdAt: {type: Date, default: Date.now},
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    images: Array,
    description: String,
    content: String
})

module.exports = mongoose.model("Material", materialSchema);