var uglify = require("uglify-js"),
    fs = require("fs"),
    fileUtil = require("./lib/fileUtil"),
    path = require("path"),
    util = require("./lib/util"),
    config = require("./config");

function isJsFile(filePath) {
    return path.extname(filePath) == ".js";
}


console.log("start minify files");

fileUtil.walk(config.compileDir, walkResult, {
    sync: false
});

function walkResult(files) {
    // 判断是否是js文件类型
    files.forEach(function(file) {
        if(isJsFile(file)) {
            fileUtil.readFile(file, "utf-8", function(err,data) {
                if(err) {
                    console.log("reading file "+ path.resolve(file)+" error");
                    return;
                }
                var fileName = path.basename(file, ".js");
                console.log("fuck")
                var result = uglify.minify(data, {
                    outSourceMap: fileName + ".map",
                    fromString: true
                });
                fileUtil.writeFile(file, result.code, "utf-8", function () {
                    console.log("file " + file + " created");
                    fs.rename(file, path.dirname(file)+"\\"+fileName+"_"+util.md5(data, 7) + ".js", function() {});
                });
                fileUtil.writeFile(path.dirname(file)+"\\"+fileName+ ".map", result.map, "utf-8", function () {
                    console.log("file " + path.dirname(file)+"\\"+fileName+ ".map created")
                });
            })
        }
    });
}
