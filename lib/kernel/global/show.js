var color = require("colors");

exports.showError = function(msg) {
    console.log(msg.bold.red);
}

exports.showResult = function(msg) {
    console.log(msg.bold.yellow);
}