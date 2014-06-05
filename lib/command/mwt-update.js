var mwt = require("../kernel/global/kernel"),
    path = require("path"),
    fs = require("fs");

exports.desc = "\t更新工程目录下的基础库文件";
exports.usage = "update";
exports.registeCommand = function (commander) {
    commander
        .option('-d, --dirPath <dirName>', '指定要更新的文件目录，不指定则在当前目录下更新')
        .option('-n, --dirName <dirName>', '已注册的工程目录别名')
        .action(function (value) {
            var dirName = value.dir || process.cwd(),
                nickName = value.dirName,
                seajs = true;

            if (nickName) {
                var configData = mwt.util.readJson("../projectConfig.json");
                if (!configData[nickName]) {
                    mwt.show.showError("找不到匹配的项目路径，请先注册该路径");
                    return;
                } else {
                    dirName = path.resolve(configData[nickName].path + "\\" + nickName + "\\assets\\js\\base");
                    seajs = configData[nickName].seajs;
                }
            }
            fs.exists(dirName, function (exist) {
                if (exist) {
                    var fileList = [mwt.config.basicFiles.zepto, mwt.config.basicFiles.util];
                    seajs && fileList.push(mwt.config.basicFiles.seajs);
                    // 下载项目文件
                    fileList.forEach(function (f) {
                        var fileName = f.substring(f.lastIndexOf("/") + 1, f.length);
                        mwt.show.showResult("downloading " + fileName);
                        // 下载公共库文件
                        mwt.util.download(f, function (err, data) {
                            if (err) {
                                mwt.show.showError("update " + fileName + " fail, you can download it by yourself!");
                            } else {
                                // 将文件内容写入
                                fs.writeFile(path.resolve(dirName + "/" + fileName), data, "utf-8", function () {
                                    mwt.show.showResult(fileName + " updated");
                                });
                            }
                        });
                    });
                }
            })
        })
}