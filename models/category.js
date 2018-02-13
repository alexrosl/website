var mongoose = require("mongoose");

var categorySchema = new mongoose.Schema({
    name: String,
    materials: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Material"
        }
    ],
    description: String
});

module.exports = mongoose.model("Category", categorySchema);