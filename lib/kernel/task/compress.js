var uglify = require("uglify-js"),
    color = require("colors"),
    mwt = require("../global/kernel"),
    fs = require("fs"),
    path = require("path");

exports.doCompress = function () {
    /**
     * 遍历临时目录
     */
    mwt.fs.walk(mwt.tempDir, walkCallback, {
        filter: function (el) {
            return path.basename(el).indexOf(".") != 0;
        }
    });

}

function walkCallback(files) {
    console.log("start minify files");
    var len = files.length;
    files.forEach(function (file) {
        mwt.fs.readFile(file, "utf-8", function (err, data) {
            var fileName = path.basename(file);
            if (err) {
                mwt.show.showError("reading " + file + "error");
                return;
            }
            var result = uglify.minify(data, {
                outSourceMap: fileName + ".map",
                fromString: true
            });
            var arr = file.split(mwt.config.tempDirName),
                prefix = path.join(arr[0], mwt.projectConfig.javascript.dest),
                dest = prefix + arr[1];
            mwt.fs.writeFile(dest, result.code, "utf-8", function () {
                len--;
                var rename = dest.replace(/\.js/, "_" + mwt.util.md5(data, 7) + ".js");
                // 重命名文件
                fs.rename(dest, rename, function () {
                    console.log("minify file " + fileName + " success, new file name is "+(path.basename(rename)).bold.yellow);
                });
                mwt.fs.writeFile(path.dirname(dest) + "\\" + fileName + ".map", result.map, "utf-8", function () {
                    console.log("map file " + fileName + ".map created");
                });
                // 清理临时目录
                if(!len && mwt.projectConfig.javascript.clean) {
                    mwt.fs.delSync(mwt.tempDir);
                }
            });
        });
    })
}