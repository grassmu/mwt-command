var fileUtil = require("../kernel/global/fileUtil"),
    fs = require("fs"),
    path = require("path"),
    mwt = require("../kernel/global/kernel"),
    reg = require("./mwt-registe"),
    http = require("http");

exports.usage = '[path] [options] [nick] [options]';
exports.desc = "\t初始化工程目录";

exports.registeCommand = function (commander) {
    commander
        .option('-d, --dirPath <dirPath>', '指定要创建的目录路径')
        .option('-n, --dirName <dirName>', '在目录路径下要创建的目录名称')
        .option('-s, --seajs <seajs>', '是否使用seajs，默认为true', true)
        .action(function (value) {
            var seajs = mwt.util.getBoolean(value.seajs),
                dirPath = value.dirPath || process.cwd(),
                dirName = value.dirName;
            if (dirPath && !mwt.util.validateDir(dirPath)) {
                mwt.show.showError("invalid absolute path !(目录错误，无法读取)");
                return;
            }
            if (!dirName) {
                mwt.show.showError("invalid dirName!(未指定目录名称)");
                return;
            }

            // 生成通用的目录结构
            generateDir(dirName, dirPath, function () {
                // 注册该目录
                reg.doRegiste(dirName, dirPath, seajs, function (err) {
                    if (err) {
                        mwt.show.showError(err);
                    } else {
                        mwt.show.showResult("project " + dirPath + "\\" + dirName + " registe success");
                    }
                });
                var fileList = [mwt.config.basicFiles.zepto, mwt.config.basicFiles.util];
                seajs && fileList.push(mwt.config.basicFiles.seajs);

                fileList.forEach(function (f) {
                    var fileName = f.substring(f.lastIndexOf("/") + 1, f.length);
                    mwt.show.showResult("downloading " + fileName);
                    // 下载公共库文件
                    mwt.util.download(f, function (err, data) {
                        if (err) {
                            mwt.show.showError("downloading " + fileName + " fail, you can download it by yourself!");
                        } else {
                            // 将文件内容写入
                            fs.writeFile(path.resolve(dirPath + "/" + dirName + "/assets/js/base/" + fileName), data, "utf-8", function () {
                            });
                        }
                    });
                    // TODO 写config文件
                });
            })
        })
}

function generateDir(name, base, callback) {
    var baseDir = base + "\\" + name;
    mk(baseDir + "\\templates", function () {
    })
    mk(baseDir + "\\assets\\css", function () {
    })
    mk(baseDir + "\\assets\\js\\base", function () {
        fileUtil.writeFile(baseDir + "\\config.json", "nima ", "utf-8", function () {
            callback();
        })
    })
    function mk(dir, fn) {
        fileUtil.mkdir(dir, fn);
    }
}