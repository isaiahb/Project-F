var mongoose = require("mongoose");

//define model
//module.exports allows us to pass this to other files
module.exports = mongoose.model("Nerd", {name: {type: String, default: ""}});