var mongoose = require("mongoose");

var albumSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    createdAt: {type: Date, default: Date.now}
})


module.exports = mongoose.model("Album", albumSchema);