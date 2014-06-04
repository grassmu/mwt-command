var wt = require("watch"),
    color = require("colors");

exports.startWatch = function(dir) {
    console.log((dir+" is under watch").bold.yellow);
    wt.watchTree("E:\\workspace\\nodejs\\emt\\public\\templates", function(f, curr, prev) {
        if (typeof f == "object" && prev === null && curr === null) {
            // Finished walking the tree
        } else if (prev === null) {
            // f is a new file
        } else if (curr.nlink === 0) {
            // f was removed
        } else {
            console.log(f+" has changed");
        }
    });
}

exports.stopWatch = function(dir) {

}