const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({

    username:  {type: String},
    stack: {type: String},
    url: {type: String}
})


module.exports = mongoose.model("Image", ImageSchema);
